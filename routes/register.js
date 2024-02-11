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

router.post('/', async (req, res) => {
  const { username, password, email } = req.body;
  // Validate input (omitted for brevity)

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user into DB
  const sql = `INSERT INTO users (username, email, pw_hash) VALUES (?, ?, ?)`;
  db.run(sql, [username, email, hashedPassword], function(err) {
      if (err) {
          // Handle errors (e.g., username taken)
          return res.status(400).send('Error message');
      }
      // User registered
      return res.redirect('/login');
  });
});


module.exports = router;
