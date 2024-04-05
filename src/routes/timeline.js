const express = require('express')

const router = express.Router()
const crypto = require('crypto')
const UserService = require('../services/userService')
const {
  publicCounter,
  followCounter,
  unfollowCounter
} = require('../services/metrics')

const userService = new UserService()

function getUserCredentialsFromSession (req) {
  if (req.session.username) {
    return {
      user: {
        id: req.session.username.id,
        username: req.session.username.username
      }
    }
  }
  return { user: {} }
}

const requireAuth = (req, res, next) => {
  if (req.session.username) {
    next()
  } else {
    res.redirect('/public')
  }
}

function gravatarUrl (email, size = 80) {
  const hash = crypto
    .createHash('md5')
    .update(email.trim().toLowerCase())
    .digest('hex')
  return `http://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`
}

function formatMessages (messages) {
  messages.forEach((message) => {
    const date = new Date(message.pub_date * 1000)
    const year = date.getUTCFullYear()
    const month = `0${date.getUTCMonth() + 1}`.slice(-2)
    const day = `0${date.getUTCDate()}`.slice(-2)
    const hours = `0${date.getUTCHours()}`.slice(-2)
    const minutes = `0${date.getUTCMinutes()}`.slice(-2)
    message.pub_date = `${year}-${month}-${day} @ ${hours}:${minutes}`
    message.gravatar = gravatarUrl(message.email, 48)
  })
  return messages
}

router.post('/add_message', requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.username.id
    const messageContent = req.body.text
    const currentDate = Math.floor(new Date().getTime() / 1000)
    await userService.addMessage(userId, messageContent, currentDate)
    req.flash('success', 'Your message was recorded')
    res.redirect('/')
  } catch (error) {
    console.log(error)
    res.status(500).send('Server error')
  }
})

router.get('/logout', requireAuth, (req, res) => {
  req.session.destroy()
  res.redirect('/public')
})

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const g = getUserCredentialsFromSession(req)
    const messages = await userService.getMessagesFromUserAndFollowedUsers(
      g.user.id
    )
    res.render('timeline', {
      endpoint: 'timeline',
      title: `${g.user.username}'s timeline`,
      messages: formatMessages(messages),
      g
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
})

router.get('/public', async (req, res, next) => {
  try {
    const g = getUserCredentialsFromSession(req)
    const messages = await userService.getPublicTimelineMessages(50)
    publicCounter.inc()
    res.render('timeline', {
      title: 'Public Timeline',
      messages: formatMessages(messages),
      g
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
})

router.get('/:username', async (req, res, next) => {
  try {
    const g = getUserCredentialsFromSession(req)

    const whomUsername = req.params.username
    const whomId = await userService.getUserIdByUsername(whomUsername)
    const profileUser = {
      user: {
        id: whomId.user_id,
        username: whomUsername
      }
    }

    let followed = false
    if (g) {
      followed = await userService.isFollowing(g.user.id, whomId.user_id)
    }

    const messages = await userService.getMessagesByUserId(whomId.user_id)
    formatMessages(messages)
    publicCounter.inc()
    res.render('timeline', {
      endpoint: 'user',
      title: `${whomUsername}'s Timeline`,
      messages,
      g,
      profile_user: profileUser,
      followed
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
})

router.get('/:username/follow', requireAuth, async (req, res, next) => {
  try {
    const g = getUserCredentialsFromSession(req)

    const whomUsername = req.params.username
    const whomId = await userService.getUserIdByUsername(whomUsername)

    await userService.followUser(g.user.id, whomId.user_id)
    followCounter.inc()
    req.flash('success', `You are now following "${whomUsername}"`)
    res.redirect(`/${whomUsername}`)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
})

router.get('/:username/unfollow', requireAuth, async (req, res, next) => {
  try {
    const g = getUserCredentialsFromSession(req)

    const whomUsername = req.params.username
    const whomId = await userService.getUserIdByUsername(whomUsername)

    await userService.unfollowUser(g.user.id, whomId.user_id)
    unfollowCounter.inc()

    req.flash('success', `You are no longer following "${whomUsername}"`)
    res.redirect(`/${whomUsername}`)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
