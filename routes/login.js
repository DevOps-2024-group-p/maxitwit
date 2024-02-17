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

router.use(function (req, res, next) {
	res.locals.success_messages = req.flash('success');
	res.locals.error_messages = req.flash('error');
	next();
})

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
	const g = { user: req.session.username };
	res.render('login', { title: 'Login', g: g });
});

router.post('/', (req, res, next) => {
	const { username, password } = req.body;

	// Input validation
	if (!username || !password) {
		req.flash('error', 'Please enter username and password');
		return res.redirect('/login');
	}

	// Check user in DB
	const sql = 'SELECT * FROM user WHERE username = ?';
	db.get(sql, [username], (err, user) => {
		if (err) {
			console.error(err.message);
			return res.status(500).send('Server error');
		}
		if (!user) {
			req.flash('error', 'Invalid username or password');
			res.redirect('/login');
		} else {
			bcrypt.compare(password, user.pw_hash, (err, result) => {
				if (err) {
					console.error(err.message);
					return res.status(500).send('Server error');
				}
				if (result) {
					req.session.username = {
						id: user.user_id,
						username: username
					};
					console.log(req.session.username)
					req.flash('success', 'You were logged in');
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
