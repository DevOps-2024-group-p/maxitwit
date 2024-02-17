var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const UserService = require('../services/userService');
const userService = new UserService();

/* GET register page. */
router.get('/', function (req, res, next) {
	const g = { user: req.session.username };
	res.render('register', { title: 'Register', g: g });
});

router.use(function (req, res, next) {
	res.locals.success_messages = req.flash('success');
	res.locals.error_messages = req.flash('error');
	next();
})

const validateEmail = (email) => {
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
};

router.post('/', async function (req, res, next) {
	const { username, email, password } = req.body;

	const validEmail = validateEmail(email);

	if (!validEmail) {
		req.flash('error', 'Please enter a valid email address')
		return res.redirect('/register')
	}

	try {
		const emailExists = await userService.getUserIdByEmailIfExists(email);
		const usernameExists = await userService.getUserIdByUsernameIfExists(username);

		if (emailExists || usernameExists) {
			req.flash('error', 'User already exists');
			return res.redirect('/register')
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		await userService.registerUser(username, email, hashedPassword);

		req.flash('success', 'You were registered, please login')
		return res.redirect('/login');
	} catch (err) {
		console.error(err);
		res.status(500).send('Error, try again');
	}
});

module.exports = router;
