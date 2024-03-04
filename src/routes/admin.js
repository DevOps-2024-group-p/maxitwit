const express = require('express')

const router = express.Router()


function getUserCredentialsFromSession(req) {
  if (req.session.username) {
    return {
      user: {
        id: req.session.username.id,
        username: req.session.username.username
      }
    }
  } return { user: {} }
}

const requireAuth = (req, res, next) => {
  const { role } = req.session.username
  if (role === 'ADMIN') {
    next()
  } else {
    res.redirect('/public')
  }
}

router.get('/', requireAuth, async (req, res, next) => {
  console.log('adminpanel')
  const messages = []
  const g = getUserCredentialsFromSession(req)
  res.render('adminpanel', {
    title: `Welcome ${req.session.username}`,
    messages,
    g
  })
})

module.exports = router
