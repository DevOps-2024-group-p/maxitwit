var express = require('express');
var router = express.Router();

var router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const crypto = require('crypto');

function gravatar_url(email, size = 80) {
  const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
  return `http://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
}

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
  const sql = `SELECT message.text, message.pub_date, message.flagged, user.username, user.email 
  FROM message
  JOIN user ON message.author_id = user.user_id
  WHERE message.flagged != 1
  LIMIT 50;`
  db.all(sql, [], (err, messages) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Server error');
    }
    messages.forEach(message => {
      const date = new Date(message.pub_date * 1000);
      const year = date.getUTCFullYear();
      const month = ("0" + (date.getUTCMonth() + 1)).slice(-2);
      const day = ("0" + date.getUTCDate()).slice(-2);
      const hours = ("0" + date.getUTCHours()).slice(-2);
      const minutes = ("0" + date.getUTCMinutes()).slice(-2);
      message.pub_date = year + "-" + month + "-" + day + " @ " + hours + ":" + minutes;
      message.gravatar = gravatar_url(message.email, 48);
      delete message.email;
      delete message.flagged;
    });
    console.log(messages);
    res.render('timeline', { title: 'Public Timeline', messages: messages });
  });
});

module.exports = router;
