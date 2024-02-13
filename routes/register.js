var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const { check, validationResult } = require('express-validator');

// Database connection
let db = new sqlite3.Database('./db/minitwit.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the minitwit.db');
  }
});

/* GET register page. */
router.get('/', function (req, res, next) {
  res.render('register', { title: 'Register' });
});

router.post('/', async (req, res) => {
  const { username, email, password } = req.body;

  
  // Input validation
  try {
    
    // todo catch error in view template
    const existingUser = db.get('SELECT * FROM user WHERE username = ?', [username]);
    const existingEmail = db.get('SELECT * FROM user WHERE email = ?', [email]);
    if (existingUser || existingEmail) {
      return res.status(400).send('User already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into DB
    const sql = `INSERT INTO user (username, email, pw_hash) VALUES (?, ?, ?)`;
    db.run(sql, [username, email, hashedPassword], function (err) {
      if (err) {
        console.error(err.message);
        return res.status(400).send('Error, try again');
      }
      // Redirect to login
      return res.redirect('/login');
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error, try again');
  }
});

module.exports = router;
