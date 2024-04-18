const express = require('express')

const router = express.Router() // Initialize router instance
const bcrypt = require('bcrypt') // Import bcrypt for password hashing
const UserService = require('../services/userService') // Import UserService class to interact with user data
const userService = new UserService() // Create new UserService instance

// Helper function to get user credentials from session
function getUserCredentialsFromSession (req) {
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

// Get route to serve registration page via get request
router.get('/', (req, res, next) => {
  const g = getUserCredentialsFromSession(req) // Get user credentials from session
  res.render('register', { title: 'Register', g }) // Render register.pug with title and user credentials
})

// Middleware adding flash messages to response local variables
router.use((req, res, next) => {
  res.locals.success_messages = req.flash('success')
  res.locals.error_messages = req.flash('error')
  next()
})

// Utility function to validate email address using regex
const validateEmail = (email) => 
  String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )


// Post route to handle registration form submission
router.post('/', async (req, res, next) => {
  // Get user inputs from request body
  const { username, email, password, password2 } = req.body

  // Validate email format
  const validEmail = validateEmail(email)

  // Check if both password fields from req.body match
  if (password !== password2) {
    req.flash('error', 'The two passwords do not match')
    return res.redirect('/register')
  }
  if (!username) {
    req.flash('error', 'You have to enter a username')
    return res.redirect('/register')
  }
  if (!validEmail) {
    req.flash('error', 'You have to enter a valid email address')
    return res.redirect('/register')
  }
  if (!password) {
    req.flash('error', 'You have to enter a password')
    return res.redirect('/register')
  }

  try {
    // Check if email or username exists in database
    const emailExists = await userService.getUserIdByEmail(email)
    const usernameExists = await userService.getUserIdByUsername(username)

    if (usernameExists) {
      req.flash('error', 'The username is already taken')
      return res.redirect('/register')
    }
    if (emailExists) {
      req.flash('error', 'That email is taken')
      return res.redirect('/register')
    }

    const hashedPassword = await bcrypt.hash(password, 10) // Hash the password using bcrypt
    await userService.registerUser(username, email, hashedPassword) // Register new user in database

    req.flash('success', 'You were successfully registered and can login now')
    return res.redirect('/login')
  } catch (err) {
    console.error(err)
    res.status(500).send('Error, try again')
  }
})

// Export router to use in app.js
module.exports = router
