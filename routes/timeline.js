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
		let messages = await userService.getMessagesFromUserAndFollowedUsers(userId);
		res.render('timeline', {
			endpoint: 'timeline',
			title: `${g.user.username}'s timeline`,
			messages: formatMessages(messages),
			g: g,
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server error');
	}
});

router.get('/public', async function (req, res, next) {
	try {

		const g = {
			user: req.session.username
		};
		let messages = await userService.getPublicTimelineMessages();
		res.render('timeline', {
			endpoint: 'timeline',
			title: `Public Timeline`,
			messages: formatMessages(messages),
			g: g,
		});

	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server error');
	}
});



router.get('/:username', requireAuth, async function (req, res, next) {
	try {
		const who_id = req.session.username.id;
		const g = {
			user: {
				id: req.session.username.id,
				username: req.session.username.username

			}
		};

		const whom_username = req.params.username;
		const whom_id = await userService.getUserIdByUsername(whom_username);
		const profile_user = {
			user: {
				id: whom_id,
				username: whom_username
			}
		};

		const followed = await userService.isFollowing(who_id, whom_id);

		let messages = await userService.getMessagesByUserId(whom_id);

		res.render('timeline', {
			endpoint: 'user',
			title: `${whom_username}'s Timeline`,
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

router.get('/:username/follow', requireAuth, async function (req, res, next) {

	try {
		const who_id = req.session.username.id;
		const g = {
			user: {
				id: req.session.username.id,
				username: req.session.username.username

			}
		};

		const whom_username = req.params.username;
		const whom_id = await userService.getUserIdByUsername(whom_username);
		const profile_user = {
			user: {
				id: whom_id,
				username: whom_username
			}
		};

		let messages = await userService.getMessagesByUserId(whom_id);

		const followed = await userService.followUser(who_id, whom_id);
		// TODO: implement flashes
		// res.redirect(`/${whom_username}`);
		res.render('timeline', {
			endpoint: 'user',
			title: `${whom_username}'s Timeline`,
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

router.get('/:username/unfollow', requireAuth, async function (req, res, next) {
	try {
		const who_id = req.session.username.id;
		const g = {
			user: {
				id: req.session.username.id,
				username: req.session.username.username

			}
		};

		const whom_username = req.params.username;
		const whom_id = await userService.getUserIdByUsername(whom_username);
		const profile_user = {
			user: {
				id: whom_id,
				username: whom_username
			}
		};

		let messages = await userService.getMessagesByUserId(whom_id);

		const followed = await userService.unfollowUser(who_id, whom_id);
		// TODO: implement flashes
		// res.redirect(`/${whom_username}`);
		res.render('timeline', {
			endpoint: 'user',
			title: `${whom_username}'s Timeline`,
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
