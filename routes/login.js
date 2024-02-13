var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
var session = require('express-session');

router.use(session({
  secret: 'devving-and-opssing',
  resave: false,
  saveUninitialized: true
}));

// Database connection
let db = new sqlite3.Database('./db/minitwit.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the minitwit.db');
  }
});

/* GET login page. */
router.get('/', function (req, res) {
  res.render('login', { title: 'Login' });
});

router.post('/', (req, res) => {
  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  // Check user in DB
  const sql = 'SELECT * FROM user WHERE username = ?';
  db.get(sql, [username], (err, user) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
    if (!user) {
      // User not found
      return res.status(400).send('Invalid username or password');
    } else {
      // Compare submitted password with hashed password in DB
      bcrypt.compare(password, user.pw_hash, (err, result) => {
        if (err) {
          console.error(err.message);
          return res.status(500).send('Server error');
        }
        if (result) {
          // Passwords match
          req.session.username = {
            username:username
          };
          console.log(req.session.username)
          return res.redirect('/');
        } else {
          // Passwords dont match
          return res.status(400).send('Invalid username or password');
        }
      });
    }
  });
});

module.exports = router;
