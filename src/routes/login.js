// Imports
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt') // Import bcrypt for password hashing
const UserService = require('../services/userService') // Import UserService class to interact with user data
const userService = new UserService() // Create new UserService instance

// Helper function to retrieve user credentials from session
function getUserCredentialsFromSession(req) {
  // If user is logged in, return id and username from session
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

// Get route to serve login page via get request
router.get('/', (req, res) => {
  const g = getUserCredentialsFromSession(req)
  res.render('login', { title: 'Login', g })  // Render login.pug with title and user credentials
})

// Post route for handling login submissions
router.post('/', async (req, res, next) => {

  const { username, password } = req.body // Get username and password from request body

  // Variable validation, if false creates error message and redirects to the login page
  if (!username || !password) {
    req.flash('error', 'Please enter username and password')
    return res.redirect('/login')
  }

  const user = await userService.getUserIdByUsername(username) // Fetch user by username via userService

  // Variable validation, if false creates error message and redirects to the login page
  if (!user) {
    req.flash('error', 'Invalid username')
    return res.redirect('/login')
  }

  // Compare entered password with hashed user password in the database
  bcrypt.compare(password, user.pw_hash, (err, result) => {

    // If entered password is incorrect, log error and return a server error
    if (err) {
      console.error(err.message)
      return res.status(500).send('Server error')
    }

    // If entered password is correct, set the user details in the session
    if (result) {
      req.session.username = {
        id: user.user_id,
        username
      }
      // Set success message and redirect to homepage
      req.flash('success', 'You were logged in')
      return res.redirect('/')
    }

    req.flash('error', 'Invalid password')
    return res.redirect('/login')
  })
})

// Export router to use in app.js
module.exports = router
