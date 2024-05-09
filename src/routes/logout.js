const express = require('express')
const router = express.Router() // Initialize router instance

// Middleware function to check if the user is authenticated
const requireAuth = (req, res, next) => {
  // If user is logged in, proceed to the next middleware/route else redirect to /public
  if (req.session.username) {
    next()
  } else {
    res.redirect('/public')
  }
}
// Get route to handle logout
router.get('/', requireAuth, (req, res) => {
  req.session.username = null // Invalidate session username to log user out
  console.log('You were logged out')
  req.flash('success', 'You were logged out')
  res.redirect('/public')
})

// Export router to use in app.js
module.exports = router
