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

router.post('/add_message', requireAuth, async function (req, res, next) {
	try {

		const userId = req.session.username.id;
		const messageContent = req.body.text;
		const currentDate = new Date().getTime();
		const flagged = 0;

		console.log(currentDate);
		const sql = `insert into message (author_id, text, pub_date, flagged) values (?, ?, ?, ?)`;
		db.run(sql, [userId, messageContent, currentDate, flagged], (err) => {
			if (err) {
				console.error(err.message);
			}
		});

		res.redirect('/');

	} catch (error) {
		console.log(error);
		res.status(500).send('Server error');
	}
})

router.get('/logout', function (req, res) {
	req.session.destroy();
	const g = { user: null };
	res.redirect('/public');
});

/* GET current user timeline page. */
router.get('/', requireAuth, async function (req, res, next) {
	try {
		const { username } = req.session.username;
		const id = req.session.username.id;
		const g = { user: req.session.username };
		const profile_user = 'example_profile_user';
		const followed = true;

		const sql = `SELECT message.text, message.pub_date, message.flagged, user.username, user.email 
  	FROM message
  	JOIN user ON message.author_id = user.user_id
  	WHERE message.flagged != 1 and message.author_id = ?
	order by message.pub_date desc
  	LIMIT 50;`

		const messages = await new Promise((resolve, reject) => {
			db.all(sql, [id], (err, messages) => {
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

		console.log(messages);
		res.render('timeline', {
			endpoint: 'timeline',
			title: `${g.user.username}'s timeline`,
			messages: messages,
			g: g,
			profile_user: profile_user,
			followed: followed,
		});

	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server error');
	}
});

/* GET public timeline page. */
router.get('/public', async function (req, res, next) {
	const g = { user: req.session.username };
	const endpoint = 'user'
	const profile_user = 'example_profile_user'; // Example value, replace with actual profile user data
	const followed = true; // Example value, replace with actual logic to determine if user is followed

	const sql = `SELECT message.text, message.pub_date, message.flagged, user.username, user.email 
  	FROM message
  	JOIN user ON message.author_id = user.user_id
  	WHERE message.flagged != 1
	order by message.pub_date desc
  	LIMIT 50;`

	const messages = await new Promise((resolve, reject) => {
		db.all(sql, [], (err, messages) => {
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


	res.render('timeline', {
		endpoint: endpoint,
		title: `Public Timeline`,
		messages: messages,
		g: g,
		profile_user: profile_user,
		followed: followed,
	});

});

/* GET timeline of another user. */
router.get('/:username', async function (req, res, next) {
	try {
		const g = { user: req.session.username };
		const profile_user = 'example_profile_user';
		const followed = true;

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

		console.log(messages);

		res.render('timeline', {
			endpoint: 'user',
			title: `${username}'s Timeline`,
			messages: messages,
			g: g,
			profile_user: profile_user,
			followed: followed,
		});

	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server error');
	}
});

module.exports = router;
