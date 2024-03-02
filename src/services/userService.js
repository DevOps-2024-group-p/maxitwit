const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function formatGetMessages(messages) {
  const FormattedMessages = messages.map((message) => ({
    text: message.text,
    pub_date: message.pub_date,
    flagged: message.flagged,
    username: message.author.username,
    email: message.author.email
  }))
  return FormattedMessages
}

class UserService {
  async addMessage(userId, messageContent, currentDate) {
    try {
      const message = await prisma.message.create({
        data: {
          author_id: userId,
          text: messageContent,
          pub_date: currentDate,
          flagged: 0
        }
      })
      return message
    } catch (err) {
      console.log(err)
      throw new Error(`Error adding message to database: ${err.messsage}`)
    }
  }

  async getMessagesByUserId(id) {
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

  async getMessagesFromUserAndFollowedUsers(userId) {
    // First, get the IDs of the users that the current user is following
    const followedUsers = await prisma.follower.findMany({
      where: { who_id: userId },
      select: { whom_id: true }
    })

    const followedUserIds = followedUsers.map(user => user.whom_id)

    // Then, get the messages from the current user and the users they are following
    const messages = await prisma.message.findMany({
      where: {
        flagged: 0,
        author: {
          OR: [
            { user_id: userId },
            { user_id: { in: followedUserIds } }
          ]
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

  async getPublicTimelineMessages(limit) {
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
        take: limit
      })
      return formatGetMessages(messages)
    } catch (err) {
      console.error(err)
      throw new Error(`Error getting messages from database: ${err.message}`)
    }
  }

  async getUserIdByUsernameIfExists(username) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          username
        }
      })
      return user
    } catch (err) {
      console.error(err)
      throw new Error(`Error getting user by username from database: ${err.message}`)
    }
  }

  async getUserByUsername(username) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          username
        }
      })
      return user
    } catch (err) {
      console.error(err)
      throw new Error(`Error getting user by username from database: ${err.message}`)
    }
  }

  async getUserIdByUsername(username) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          username
        }
      })
      return user
    } catch (err) {
      console.error(err)
      throw new Error(`Error getting user by username from database: ${err.message}`)
    }
  }

  async getUserIdByEmail(email) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          email
        }
      })
      return user
    } catch (err) {
      console.error(err)
      throw new Error(`Error getting user by email from database: ${err.message}`)
    }
  }

  async getUserIdByEmailIfExists(email) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          email
        }
      })
      return user
    } catch (err) {
      console.error(err)
      throw new Error(`Error getting user by email from database: ${err.message}`)
    }
  }

  async isFollowing(whoId, whomId) {
    try {
      const follower = await prisma.follower.findFirst({
        where: {
          who_id: whoId,
          whom_id: whomId
        }
      })
      if (follower) {
        return true
      } else {
        return false
      }
    } catch (err) {
      console.error(err)
      throw new Error(`Error checking if user is following another user: ${err.message}`)
    }
  }

  async getAllFollowed(userId, limit) {
    try {
      const followed = await prisma.follower.findMany({
        where: {
          who_id: userId
        },
        include: {
          user: true
        },
        take: limit
      })
      return followed
    } catch (err) {
      console.error(err)
      throw new Error(`Error getting followed users from database: ${err.message}`)
    }
  }

  async followUser(userId, followedId) {
    try {
      const follower = await prisma.follower.create({
        data: {
          who_id: userId,
          whom_id: followedId
        }
      })
      return follower
    } catch (err) {
      console.error(err)
      throw new Error(`Error adding follower to database: ${err.message}`)
    }
  }

  async unfollowUser(userId, followedId) {
    try {
      const follower = await prisma.follower.delete({
        where: {
          who_id_whom_id: {
            who_id: userId,
            whom_id: followedId
          }
        }
      })
      return follower
    } catch (err) {
      console.error(err)
      throw new Error(`Error removing follower from database: ${err.message}`)
    }
  }

  async registerUser(username, email, hash) {
    try {
      const user = await prisma.user.create({
        data: {
          username,
          email,
          pw_hash: hash
        }
      })
      return user
    } catch (err) {
      console.error(err)
      throw new Error(`Error adding user to database: ${err.messsage}`)
    }
  }
}
module.exports = UserService
