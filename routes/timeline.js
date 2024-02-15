var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const session = require('express-session');
const UserService = require('../services/userService');
const userService = new UserService();

router.use(session({
	secret: 'devving-and-opssing',
	resave: false,
	saveUninitialized: true
}));

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

function formatMessages(messages) {
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
	return messages;
}

router.post('/add_message', requireAuth, async function (req, res, next) {
	try {
		const userId = req.session.username.id;
		const messageContent = req.body.text;
		const currentDate = new Date().getTime();
		await userService.addMessage(userId, messageContent, currentDate);
		res.redirect('/')
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

router.get('/', requireAuth, async function (req, res, next) {
	try {
		const userId = req.session.username.id;
		const g = { user: req.session.username };
		const profile_user = 'example_profile_user';
		const followed = true;
		let messages = await userService.getMessagesByUserId(userId);
		res.render('timeline', {
			endpoint: 'timeline',
			title: `${g.user.username}'s timeline`,
			messages: formatMessages(messages),
			g: g,
			profile_user: profile_user,
			followed: followed,
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server error');
	}
});

router.get('/public', async function (req, res, next) {
	try {
		const g = { user: req.session.username };
		const endpoint = 'user'
		const profile_user = 'example_profile_user';
		const followed = true;
		let messages = await userService.getPublicTimelineMessages();
		res.render('timeline', {
			endpoint: endpoint,
			title: `Public Timeline`,
			messages: formatMessages(messages),
			g: g,
			profile_user: profile_user,
			followed: followed,
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server error');
	}
});

router.get('/:username', async function (req, res, next) {
	try {
		const g = { user: req.session.username };
		const profile_user = 'example_profile_user';
		const followed = true;
		const username = req.params.username;

		const userId = await userService.getUserIdByUsername(username);
		let messages = await userService.getMessagesByUserId(userId);

		res.render('timeline', {
			endpoint: 'user',
			title: `${username}'s Timeline`,
			messages: formatMessages(messages),
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
