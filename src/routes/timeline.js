const express = require('express');

const router = express.Router();
const crypto = require('crypto');
const UserService = require('../services/userService');

const userService = new UserService();

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

const requireAuth = (req, res, next) => {
	if (req.session.username) {
		next();
	} else {
		res.redirect('/public');
	}
};

function gravatar_url(email, size = 80) {
	const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
	return `http://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
}

function formatMessages(messages) {
	messages.forEach((message) => {
		const date = new Date(message.pub_date * 1000);
		const year = date.getUTCFullYear();
		const month = (`0${date.getUTCMonth() + 1}`).slice(-2);
		const day = (`0${date.getUTCDate()}`).slice(-2);
		const hours = (`0${date.getUTCHours()}`).slice(-2);
		const minutes = (`0${date.getUTCMinutes()}`).slice(-2);
		message.pub_date = `${year}-${month}-${day} @ ${hours}:${minutes}`;
		message.gravatar = gravatar_url(message.email, 48);
		delete message.email;
	});
	return messages;
}

router.post('/add_message', requireAuth, async (req, res, next) => {
	try {
		const userId = req.session.username.id;
		const messageContent = req.body.text;
		const currentDate = Math.floor(new Date().getTime() / 1000);
		await userService.addMessage(userId, messageContent, currentDate);
		req.flash('success', 'Your message was recorded');

		res.redirect('/');
	} catch (error) {
		console.log(error);
		res.status(500).send('Server error');
	}
});

router.get('/logout', requireAuth, (req, res) => {
	req.session.destroy();
	res.redirect('/public');
});

router.get('/', requireAuth, async (req, res, next) => {
	try {
		const g = getUserCredentialsFromSession(req);
		const messages = await userService.getMessagesFromUserAndFollowedUsers(g.user.id);
		res.render('timeline', {
			endpoint: 'timeline',
			title: `${g.user.username}'s timeline`,
			messages: formatMessages(messages),
			g,
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server error');
	}
});

router.get('/public', async (req, res, next) => {
	try {
		const g = getUserCredentialsFromSession(req);
		const messages = await userService.getPublicTimelineMessages(50);
		res.render('timeline', {
			title: 'Public Timeline',
			messages: formatMessages(messages),
			g,
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server error');
	}
});

router.get('/:username', async (req, res, next) => {
	try {
		const g = getUserCredentialsFromSession(req);

		const whom_username = req.params.username;
		const whom_id = await userService.getUserIdByUsername(whom_username);
		const profile_user = {
			user: {
				id: whom_id.user_id,
				username: whom_username,
			},
		};

		let followed = false;
		if (g) {
			followed = await userService.isFollowing(g.user.id, whom_id.user_id);
		}

		const messages = await userService.getMessagesByUserId(whom_id.user_id);

		res.render('timeline', {
			endpoint: 'user',
			title: `${whom_username}'s Timeline`,
			messages: formatMessages(messages),
			g,
			profile_user,
			followed,
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server error');
	}
});

router.get('/:username/follow', requireAuth, async (req, res, next) => {
	try {
		const g = getUserCredentialsFromSession(req);

		const whom_username = req.params.username;
		const whom_id = await userService.getUserIdByUsername(whom_username);

		await userService.followUser(g.user.id, whom_id.user_id);

		req.flash('success', `You are now following \"${whom_username}\"`);
		res.redirect(`/${whom_username}`);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server error');
	}
});

router.get('/:username/unfollow', requireAuth, async (req, res, next) => {
	try {
		const g = getUserCredentialsFromSession(req);

		const whom_username = req.params.username;
		const whom_id = await userService.getUserIdByUsername(whom_username);

		await userService.unfollowUser(g.user.id, whom_id.user_id);

		req.flash('success', `You are no longer following \"${whom_username}\"`);
		res.redirect(`/${whom_username}`);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server error');
	}
});

module.exports = router;
