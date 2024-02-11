var express = require('express');
var router = express.Router();

// Mock database object
var users = {}; // In a real app, replace this with database operations

/* GET register page. */
router.get('/', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

/* POST register page. */
router.post('/', function(req, res, next) {
  var { username, email, password } = req.body;
  // In a real app, you should validate and hash the password before saving
  users[username] = { email, password };
  // Redirect to login or confirmation page
  res.redirect('/login');
});

module.exports = router;
