const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function formatGetMessages (messages) {
  return messages.map((message) => ({
    text: message.text,
    pub_date: message.pub_date,
    flagged: message.flagged,
    username: message.author.username,
    email: message.author.email
  }))
}

class UserService {
  async addMessage (userId, messageContent, currentDate) {
    try {
      return await prisma.message.create({
        data: {
          author_id: userId,
          text: messageContent,
          pub_date: currentDate,
          flagged: 0
        }
      })
    } catch (err) {
      console.log(err)
      throw new Error(`Error adding message to database: ${err.messsage}`)
    }
  }

  async getMessagesByUserId (id) {
    try {
      const messages = await prisma.message.findMany({
        where: {
          author_id: id,
          flagged: 0
        },
        select: {
          text: true,
          pub_date: true,
          flagged: true,
          author: {
            select: {
              username: true,
              email: true
            }
          }
        },
        orderBy: {
          pub_date: 'desc'
        },
        take: 50
      })
      return formatGetMessages(messages)
    } catch (err) {
      console.error(err)
      throw new Error(`Error getting messages from database: ${err.message}`)
    }
  }

  async getMessagesFromUserAndFollowedUsers (userId) {
    // First, get the IDs of the users that the current user is following
    const followedUsers = await prisma.follower.findMany({
      where: { who_id: userId },
      select: { whom_id: true }
    })

    const followedUserIds = followedUsers.map((user) => user.whom_id)

    // Then, get the messages from the current user and the users they are following
    const messages = await prisma.message.findMany({
      where: {
        flagged: 0,
        author: {
          OR: [{ user_id: userId }, { user_id: { in: followedUserIds } }]
        }
      },
      orderBy: { pub_date: 'desc' },
      take: 50,
      select: {
        text: true,
        pub_date: true,
        flagged: true,
        author: {
          select: {
            username: true,
            email: true
          }
        }
      }
    })
    return formatGetMessages(messages)
  }

  async getPublicTimelineMessages (limit) {
    const limitInt = parseInt(limit)
    try {
      const messages = await prisma.message.findMany({
        where: {
          flagged: 0
        },
        select: {
          text: true,
          pub_date: true,
          flagged: true,
          author: {
            select: {
              username: true,
              email: true
            }
          }
        },
        orderBy: {
          pub_date: 'desc'
        },
        take: limitInt
      })
      return formatGetMessages(messages)
    } catch (err) {
      console.error(err)
      throw new Error(`Error getting messages from database: ${err.message}`)
    }
  }

  async getUserIdByUsername (username) {
    try {
      return await prisma.user.findFirst({
        where: {
          username
        }
      })
    } catch (err) {
      console.error(err)
      throw new Error(
        `Error getting user by username from database: ${err.message}`
      )
    }
  }

  async getUserIdByEmail (email) {
    try {
      return await prisma.user.findFirst({
        where: {
          email
        }
      })
    } catch (err) {
      console.error(err)
      throw new Error(
        `Error getting user by email from database: ${err.message}`
      )
    }
  }

  async isFollowing (whoId, whomId) {
    try {
      return await prisma.follower.findFirst({
        where: {
          who_id: whoId,
          whom_id: whomId
        }
      })
    } catch (err) {
      console.error(err)
      throw new Error(
        `Error checking if user is following another user: ${err.message}`
      )
    }
  }

  async followUser (userId, followedId) {
    console.log(userId, followedId)
    try {
      return await prisma.follower.create({
        data: {
          who_id: userId,
          whom_id: followedId
        }
      })
    } catch (err) {
      console.error(err)
      throw new Error(`Error adding follower to database: ${err.message}`)
    }
  }

  async unfollowUser (userId, followedId) {
    try {
      return await prisma.follower.delete({
        where: {
          who_id_whom_id: {
            who_id: userId,
            whom_id: followedId
          }
        }
      })
    } catch (err) {
      console.error(err)
      throw new Error(`Error removing follower from database: ${err.message}`)
    }
  }

  async registerUser (username, email, hash) {
    try {
      return await prisma.user.create({
        data: {
          username,
          email,
          pw_hash: hash
        }
      })
    } catch (err) {
      console.error(err)
      throw new Error(`Error adding user to database: ${err.messsage}`)
    }
  }

  async getAllFollowedUsers (userId) {
    try {
      return await prisma.follower.findMany({
        where: {
          who_id: userId
        },
        select: {
          whom: true
        }
      })
    } catch (err) {
      console.error(err)
      throw new Error(
        `Error getting followed users from database: ${err.message}`
      )
    }
  }
}
module.exports = UserService
