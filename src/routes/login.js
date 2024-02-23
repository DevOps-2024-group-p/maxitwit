const express = require('express')

const router = express.Router()
const bcrypt = require('bcrypt')
const db = require('../../db/database')

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
  } return { user: {} }
}

/* GET login page. */
router.get('/', (req, res) => {
  const g = getUserCredentialsFromSession(req)
  res.render('login', { title: 'Login', g })
})

router.post('/', (req, res, next) => {
  const { username, password } = req.body

  // Input validation
  if (!username || !password) {
    req.flash('error', 'Please enter username and password')
    return res.redirect('/login')
  }

  // Check user in DB
  const sql = 'SELECT * FROM user WHERE username = ?'
  db.getDb().get(sql, [username], (err, user) => {
    if (err) {
      console.error(err.message)
      return res.status(500).send('Server error')
    }
    if (!user) {
      req.flash('error', 'Invalid username')
      res.redirect('/login')
    } else {
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
          console.log(req.session.username)
          req.flash('success', 'You were logged in')
          return res.redirect('/')
        }
        req.flash('error', 'Invalid password')
        return res.redirect('/login')
      })
    }
  })
})

module.exports = router
