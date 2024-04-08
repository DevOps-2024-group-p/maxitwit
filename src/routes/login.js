const express = require('express')

const router = express.Router()
const bcrypt = require('bcrypt')
const UserService = require('../services/userService')
const userService = new UserService()
const { loginCounter } = require('../services/metrics')

// If user is logged in, return id and username from session, otherwise empty user
// Use the returned value to populate views
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

/* GET login page. */
router.get('/', (req, res) => {
  const g = getUserCredentialsFromSession(req)
  loginCounter.inc()
  res.render('login', { title: 'Login', g })
})

router.post('/', async (req, res, next) => {
  const { username, password } = req.body

  // Input validation
  if (!username || !password) {
    req.flash('error', 'Please enter username and password')
    return res.redirect('/login')
  }

  const user = await userService.getUserIdByUsername(username)

  if (!user) {
    req.flash('error', 'Invalid username')
    return res.redirect('/login')
  }

  bcrypt.compare(password, user.pw_hash, (err, result) => {
    if (err) {
      console.error(err.message)
      return res.status(500).send('Server error')
    }
    if (result) {
      req.session.username = {
        id: user.user_id,
        username
      }
      req.flash('success', 'You were logged in')
      return res.redirect('/')
    }
    req.flash('error', 'Invalid password')
    return res.redirect('/login')
  })
})

module.exports = router
