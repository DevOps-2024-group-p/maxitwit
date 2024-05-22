const express = require('express')

const router = express.Router()
const crypto = require('crypto')
const UserService = require('../services/userService') // Import UserService class to interact with user data
const userService = new UserService() // Create new UserService instance
const SERVER_ERR_MESSAGE = 'Server error'

// Helper function to get user credentials from session
function getUserCredentialsFromSession(req) {
  // Check if user is logged in using session information
  if (req.session.username) {
    // Return user details from session
    return {
      user: {
        id: req.session.username.id,
        username: req.session.username.username
      }
    }
  }
  return { user: {} }
}

// Middleware function to check if the user is authenticated
const requireAuth = (req, res, next) => {
  // If user is logged in, proceed to the next middleware/route else redirect to /public
  if (req.session.username) {
    next()
  } else {
    res.redirect('/public')
  }
}

// Function to generate a Gravatar URL from an email
function gravatarUrl(email, size = 80) {
  // Create MD5 hash of trimmed, lowercase email address
  const hash = crypto
    .createHash('md5')
    .update(email.trim().toLowerCase())
    .digest('hex')
  return `http://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`
}

// Function to formats array of message objects for display
function formatMessages(messages) {
  messages.forEach((message) => {
    const date = new Date(message.pub_date * 1000)
    const year = date.getUTCFullYear()
    const month = `0${date.getUTCMonth() + 1}`.slice(-2)
    const day = `0${date.getUTCDate()}`.slice(-2)
    const hours = `0${date.getUTCHours()}`.slice(-2)
    const minutes = `0${date.getUTCMinutes()}`.slice(-2)
    message.pub_date = `${year}-${month}-${day} @ ${hours}:${minutes}`
    message.gravatar = gravatarUrl(message.email, 48) // Add Gravatar URL to each message
  })
  return messages
}

// Post route to add a new message
router.post('/add_message', requireAuth, async (req, res, next) => {
  try {
    // Get userId and message from session information
    const userId = req.session.username.id
    const messageContent = req.body.text
    const currentDate = Math.floor(new Date().getTime() / 1000) // Get userId and message from session information

    await userService.addMessage(userId, messageContent, currentDate) // Call userService to save new message in database
    req.flash('success', 'Your message was recorded') // Flash success message
    res.redirect('/') // Redirect to homepage
  } catch (error) {
    console.log(error)
    res.status(500).send(SERVER_ERR_MESSAGE)
  }
})

// Get route to handle user logout
router.get('/logout', requireAuth, (req, res) => {
  req.session.destroy() // Destroy user session to log out
  res.redirect('/public') // Redirect to /public after logging out
})

// Get route to handle requests to '/' endpoint
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const g = getUserCredentialsFromSession(req) // Get user credentials from session
    const messages = await userService.getMessagesFromUserAndFollowedUsers(g.user.id) // Call userService to get all messages from user and followed users
    // Render the timeline view with user data and formatted messages
    res.render('timeline', {
      endpoint: 'timeline',
      title: `${g.user.username}'s timeline`,
      messages: formatMessages(messages),
      g
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).send(SERVER_ERR_MESSAGE)
  }
})

// Get route to handle requests to '/public' endpoint
router.get('/public', async (req, res, next) => {
  try {
    const g = getUserCredentialsFromSession(req) // Get user credentials from session
    const messages = await userService.getPublicTimelineMessages(50) // Call userService to get 50 public timeline messages
    // Render the timeline view with formatted messages
    res.render('timeline', {
      title: 'Public Timeline',
      messages: formatMessages(messages),
      g
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).send(SERVER_ERR_MESSAGE)
  }
})

// Get route to handle requests to '/:username' endpoint
router.get('/:username', async (req, res, next) => {
  try {
    const g = getUserCredentialsFromSession(req) // Get user credentials from session
    const whomUsername = req.params.username // Get username from session
    const whomId = await userService.getUserIdByUsername(whomUsername) // Call userService to get id of user
    const profileUser = {
      user: {
        id: whomId.user_id,
        username: whomUsername
      }
    }

    let followed = false
    // Check if user is following the user whose timeline is being accessed
    if (g) {
      followed = await userService.isFollowing(g.user.id, whomId.user_id)
    }
    const messages = await userService.getMessagesByUserId(whomId.user_id) // Fetches messages posted by user whose username is specified in the URL
    formatMessages(messages)

    // Render the usernames timeline view with formatted messages
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
    res.status(500).send(SERVER_ERR_MESSAGE)
  }
})

// Get route to handle follow requests to '/:username/follow' endpoint
router.get('/:username/follow', requireAuth, async (req, res, next) => {
  try {
    const g = getUserCredentialsFromSession(req) // Get user credentials from session
    const whomUsername = req.params.username // Get username from session
    const whomId = await userService.getUserIdByUsername(whomUsername) // Call userService to get id of user
    await userService.followUser(g.user.id, whomId.user_id) // Call userService to add a follow relationship between the logged-in user and the target user
    
    req.flash('success', `You are now following "${whomUsername}"`)
    res.redirect(`/${whomUsername}`)
  } catch (error) {
    console.error(error.message)
    res.status(500).send(SERVER_ERR_MESSAGE)
  }
})

// Get route to handle unfollow requests to '/:username/unfollow' endpoint
router.get('/:username/unfollow', requireAuth, async (req, res, next) => {
  try {
    const g = getUserCredentialsFromSession(req) // Get user credentials from session
    const whomUsername = req.params.username // Get username from session
    const whomId = await userService.getUserIdByUsername(whomUsername) // Call userService to get id of user
    await userService.unfollowUser(g.user.id, whomId.user_id) // Call userService to remove a follow relationship between the logged-in user and the target user

    req.flash('success', `You are no longer following "${whomUsername}"`)
    res.redirect(`/${whomUsername}`)
  } catch (error) {
    console.error(error.message)
    res.status(500).send(SERVER_ERR_MESSAGE)
  }
})

module.exports = router
