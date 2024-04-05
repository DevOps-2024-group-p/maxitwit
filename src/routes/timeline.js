const express = require('express')

const router = express.Router()
const crypto = require('crypto')
const UserService = require('../services/userService')
const { publicCounter, followCounter, unfollowCounter } = require('../services/metrics')
const userService = new UserService()

function getUserCredentialsFromSession(req) {
  const defaultUserObj = { user: {} };

  if (req.session && req.session.username) {
    return {
      user: {
        id: req.session.username.id,
        username: req.session.username.username
      }
    };
  }

  return defaultUserObj;
}


const requireAuth = (req, res, next) => {
  if (req.session.username) {
    next()
  } else {
    res.redirect('/public')
  }
}

function gravatarUrl (email, size = 80) {
  const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex')
  return `http://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`
}

function formatMessages (messages) {
  messages.forEach((message) => {
    const date = new Date(message.pub_date * 1000)
    const year = date.getUTCFullYear()
    const month = (`0${date.getUTCMonth() + 1}`).slice(-2)
    const day = (`0${date.getUTCDate()}`).slice(-2)
    const hours = (`0${date.getUTCHours()}`).slice(-2)
    const minutes = (`0${date.getUTCMinutes()}`).slice(-2)
    message.pub_date = `${year}-${month}-${day} @ ${hours}:${minutes}`
    message.gravatar = gravatarUrl(message.email, 48)
  })
  return messages
}

router.post('/add_message', requireAuth, async (req, res) => {
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

router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const g = getUserCredentialsFromSession(req)
    const userId = req.session.username.id
    const { messages, pagination } = await userService.getMessagesFromUserAndFollowedUsers(userId, limit, page);

    res.render('timeline', {
      g,
      endpoint: 'timeline',
      title: `${g.user.username}'s timeline`,
      messages: formatMessages(messages),
      pagination,
      currentPage: page
    })

  } catch (error) {
    console.error(error.message)
    console.error("Error stack:", error.stack);
    res.status(500).send(`Error: ${error.message}`);
  }
})

router.get('/public', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const g = getUserCredentialsFromSession(req)
    const { messages, pagination } = await userService.getPublicTimelineMessages(limit, page);

    res.render('timeline', {
      g,
      title: 'Public Timeline',
      messages: formatMessages(messages),
      pagination,
      currentPage: page
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});


router.get('/:username', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const g = getUserCredentialsFromSession(req);
    const username = req.params.username;
    const user = await userService.getUserIdByUsername(username);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const { messages, pagination } = await userService.getMessagesFromUserAndFollowedUsers(user.id, limit, page);
    const whomUsername = req.params.username
    const whomId = await userService.getUserIdByUsername(whomUsername)
    const followed = g.user ? await userService.isFollowing(g.user.id, whomId.user_id) : false;

    res.render('timeline', {
      endpoint: 'user',
      title: `${username}'s Timeline`,
      messages: formatMessages(messages),
      pagination,
      currentPage: page,
      g,
      profile_user: { user: { id: user.id, username: username } },
      followed
    });

  } catch (error) {
    console.error(error.message);
    console.error("Error stack:", error.stack);
    res.status(500).send(`Error: ${error.message}`);
  }
});

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