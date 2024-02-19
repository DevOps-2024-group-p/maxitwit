const express = require('express');

const router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session');
const UserService = require('../services/userService');

const userService = new UserService();

router.use(session({
	secret: 'devving-and-opssing',
	resave: false,
	saveUninitialized: true,
}));

router.use((req, res, next) => {
	res.locals.success_messages = req.flash('success');
	res.locals.error_messages = req.flash('error');
	next();
});

function getUserCredentialsFromSession(req) {
	if (req.session.username) {
		return {
			user: {
				id: req.session.username.id,
				username: req.session.username.username,
			},
		};
	} return { user: {} };
}

/* GET register page. */
router.get('/', (req, res, next) => {
	const g = getUserCredentialsFromSession(req);
	res.render('register', { title: 'Register', g });
});

router.use((req, res, next) => {
	res.locals.success_messages = req.flash('success');
	res.locals.error_messages = req.flash('error');
	next();
});

const validateEmail = (email) => String(email)
	.toLowerCase()
	.match(
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	);

router.post('/', async (req, res, next) => {
	const {
		username, email, password, password2,
	} = req.body;

	const validEmail = validateEmail(email);

	if (password != password2) {
		req.flash('error', 'The two passwords do not match');
		return res.redirect('/register');
	}

	if (!username) {
		req.flash('error', 'You have to enter a username');
		return res.redirect('/register');
	}

	if (!validEmail) {
		req.flash('error', 'You have to enter a valid email address');
		return res.redirect('/register');
	}

	if (!password) {
		req.flash('error', 'You have to enter a password');
		return res.redirect('/register');
	}

	if (!validEmail) {
		req.flash('error', 'Please enter a valid email address');
		return res.redirect('/register');
	}

	try {
		const emailExists = await userService.getUserIdByEmailIfExists(email);
		const usernameExists = await userService.getUserIdByUsernameIfExists(username);

		if (usernameExists) {
			req.flash('error', 'The username is already taken');
			return res.redirect('/register');
		}

		if (emailExists) {
			req.flash('error', 'That email is taken');
			return res.redirect('/register');
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		await userService.registerUser(username, email, hashedPassword);

		req.flash('success', 'You were successfully registered and can login now');
		return res.redirect('/login');
	} catch (err) {
		console.error(err);
		res.status(500).send('Error, try again');
	}
});

module.exports = router;
