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

router.post('/', async (req, res) => {
	const { username, email, password } = req.body;

	try {
		const emailExists = await userService.getUserIdByEmailIfExists(email);
		const usernameExists = await userService.getUserIdByUsernameIfExists(username);

		if (emailExists || usernameExists) {
			return res.status(400).send('Username or password already exists');
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		await userService.registerUser(username, email, hashedPassword);

		return res.redirect('/login');
	} catch (err) {
		console.error(err);
		res.status(500).send('Error, try again');
	}
});

module.exports = router;
