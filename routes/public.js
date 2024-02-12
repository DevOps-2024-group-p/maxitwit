var express = require('express');
var router = express.Router();

var router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// Database connection
let db = new sqlite3.Database('./db/minitwit.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the minitwit.db');
  }
});

/* GET public timeline page. */
router.get('/', function (req, res, next) {
  const sql = `SELECT user.username, message.pub_date, message.text
  FROM message
  JOIN user ON message.author_id = user.user_id;`
  db.all(sql, [], (err, messages) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
    console.log(messages);
    res.render('public', { title: 'Public Timeline', messages: messages });
  });
});

module.exports = router;
