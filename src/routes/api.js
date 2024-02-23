const express = require('express')

const router = express.Router()
const UserService = require('../services/userService')
const userService = new UserService()
const fs = require('fs')

const validateEmail = (email) => String(email).includes('@')

const requireRequestFromSimulator = (req, res, next) => {
  const fromSimulator = req.get('Authorization')
  if (fromSimulator !== 'Basic c2ltdWxhdG9yOnN1cGVyX3NhZmUh') {
    const error = 'You are not authorized to use this resource!'
    return res.status(403).json({ status: 403, error_msg: error })
  }
  next()
}

function formatMessagesAsJSON (messages) {
  const formattedMessages = []
  messages.forEach((msg) => {
    const formatted = {}
    formatted.content = msg.text
    formatted.pub_date = msg.pub_date
    formatted.user = msg.username
    formattedMessages.push(formatted)
  })
  return formattedMessages
}

function updateLatest (req) {
  const { latest } = req.query
  if (!latest) {
    return
  }

  fs.appendFile('latest.txt', `${latest}\n`, (err) => {
    if (err) throw err
    console.log(`Saved latest: ${latest} to latest.txt`)
  })
}

function getLatest () {
  const fileContent = fs.readFileSync('latest.txt', 'utf8')
  const parsed = fileContent.trim().split('\n')
  const last = parsed[parsed.length - 1]
  return parseInt(last)
}

router.get('/', requireRequestFromSimulator, (req, res) => res.status(404).send())

router.get('/latest', requireRequestFromSimulator, (req, res) => {
  const latest = getLatest()
  return res.json({ latest })
})

router.post('/register', requireRequestFromSimulator, async (req, res) => {
  const { username, email, pwd } = req.body
  updateLatest(req)

  const validEmail = validateEmail(email)
  let error = null

  await userService.getUserIdByUsername(username).then((user) => {
    if (user) {
      error = 'The username is already taken'
    }
  })

  if (!username) {
    error = 'You have to enter a username'
  }

  if (!validEmail) {
    error = 'You have to enter a valid email address'
  }

  if (!pwd) {
    error = 'You have to enter a password'
  }

  if (!validEmail) {
    error = 'Please enter a valid email address'
  }

  if (!error) {
    userService.registerUser(username, email, pwd)
      .then(() => res.status(204))
      .catch((err) => res.json({ message: err.message }))
  }

  if (error) {
    return res.status(400).json({ status: 400, error_msg: error })
  }
  return res.status(204).send()
})

router.post('/msgs/:username', requireRequestFromSimulator, async (req, res) => {
  updateLatest(req)
  const { username } = req.params
  const { content } = req.body
  const id = await userService.getUserIdByUsername(username)
  const currentDate = Math.floor(new Date().getTime() / 1000)
  await userService.addMessage(id.user_id, content, currentDate)
  return res.status(204).send()
})

router.get('/msgs', requireRequestFromSimulator, async (req, res) => {
  updateLatest(req)
  const { no } = req.query
  const messages = await userService.getPublicTimelineMessages(no)
  return res.json(formatMessagesAsJSON(messages))
})

router.get('/msgs/:username', requireRequestFromSimulator, async (req, res, next) => {
  updateLatest(req)
  const { username } = req.params
  const id = await userService.getUserIdByUsername(username)
  if (!id) {
    return res.status(404).send()
  }
  const messages = await userService.getMessagesByUserId(id.user_id)
  return res.json(formatMessagesAsJSON(messages))
})

router.all('/fllws/:username', requireRequestFromSimulator, async (req, res, next) => {
  updateLatest(req)
  const { username } = req.params
  const action = req.body
  const { no } = req.query
  const whoId = await userService.getUserIdByUsername(username)
  if (!whoId) {
    return res.status(404).send()
  }
  if (action.follow) {
    const whomId = await userService.getUserIdByUsername(action.follow)
    if (!whomId) {
      res.status(404).send()
    }
    await userService.followUser(whoId.user_id, whomId.user_id)
    return res.status(204).send()
  }
  if (action.unfollow) {
    const whomId = await userService.getUserIdByUsername(action.unfollow)
    if (!whomId) {
      res.status(404).send()
    }
    await userService.unfollowUser(whoId.user_id, whomId.user_id)
    return res.status(204).send()
  }
  const followed = await userService.getAllFollowed(whoId.user_id, no)
  return res.json({ follows: JSON.stringify(followed) })
})
module.exports = router
