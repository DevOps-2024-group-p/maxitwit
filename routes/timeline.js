var express = require('express');
var router = express.Router();
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const session = require('express-session');

router.use(session({
	secret: 'devving-and-opssing',
	resave: false,
	saveUninitialized: true
  }));

// Callback to protect endpoints with authentication
const requireAuth = (req, res, next) => {
	if (req.session.username) {
		next();
	} else {
		res.redirect('/public');
	}
}

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

/* GET current user timeline page. */
router.get('/', requireAuth, async function (req, res, next) {
	try {
		const { username } = req.session.username;
		let userId;

		const row = await new Promise((resolve, reject) => {
			db.get(`SELECT user_id FROM user 
              	JOIN message m 
				ON m.author_id = user.user_id 
                WHERE user.username = ?`, [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
		});

		if (row) {
			userId = row.user_id;
		}

		const findMessages = `SELECT 
			message.text, 
			message.pub_date, 
			message.flagged, 
			user.username, 
			user.email 
  			FROM message
			JOIN user ON user.user_id = message.author_id
			JOIN follower on follower.who_id = user.user_id
			WHERE message.flagged != 1 AND user.user_id = ? 
			OR message.author_id = follower.whom_id
 			LIMIT 50;`

		const messages = await new Promise((resolve, reject) => {
			db.all(findMessages, [userId], (err, messages) => {
				if (err) reject(err);
				else resolve(messages);
			});
		});

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
		});
		res.render('timeline', { title: `Welcome, ${username}`, messages: messages });
	} catch (error) {
		console.error(err.message);
        res.status(500).send('Server error');
	}
});

/* GET public timeline page. */
router.get('/public', function (req, res, next) {
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
		res.render('timeline', { title: 'Public Timeline', messages: messages });
	});
});

/* GET timeline of another user. */
router.get('/:username', async function (req, res, next) {
	try {
		const username = req.params.username;
		let userId;

		const row = await new Promise((resolve, reject) => {
			db.get(`SELECT user_id FROM user 
                    JOIN message m 
					ON m.author_id = user.user_id 
                    WHERE user.username = ?`, [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
		});

		if (row) {
			userId = row.user_id;
		}

		const findMessages = `SELECT 
					message.text, 
					message.pub_date, 
					message.flagged, 
					user.username, 
					user.email 
  					FROM message
  					JOIN user ON user.user_id = message.author_id
  					WHERE message.flagged != 1 AND user.user_id = ?
 					LIMIT 50;`

		const messages = await new Promise((resolve, reject) => {
			db.all(findMessages, [userId], (err, messages) => {
				if (err) reject(err);
					else resolve(messages);
				});
			});
		
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
        });

		res.render('timeline', { title: `${username}'s Timeline`, messages: messages });

	} catch (error) {
		console.error(err.message);
        res.status(500).send('Server error');
	}
});

module.exports = router;
