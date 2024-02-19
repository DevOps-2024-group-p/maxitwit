var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const UserService = require('../services/userService');
const userService = new UserService();
const fs = require('fs');

const validateEmail = (email) => {
    return String(email).includes('@');
};

const requireRequestFromSimulator = (req, res, next) => {
    const fromSimulator = req.get("Authorization");
    if (fromSimulator != "Basic c2ltdWxhdG9yOnN1cGVyX3NhZmUh") {
        const error = "You are not authorized to use this resource!"
        return res.status(403).json({ status: 403, error_msg: error });
    } else {
        next();
    }
}

function formatMessagesAsJSON(messages) {
    let formattedMessages = [];
    messages.forEach((msg) => {
        let formatted = {};
        formatted["content"] = msg["text"];
        formatted["pub_date"] = msg["pub_date"];
        formatted["user"] = msg["username"];
        formattedMessages.push(formatted);
    });
    return JSON.stringify(formattedMessages);
}

function updateLatest(req) {
    const { latest } = req.query;
    if (!latest) {
        return;
    }
    fs.appendFile('latest.txt', latest, function (err) {
        if (err) throw err;
        console.log('Saved latest: ' + latest + ' to latest.txt');
    });
}

function getLatest() {
    const fileContent = fs.readFileSync('latest.txt', 'utf8');
    const parsed = fileContent.trim().split('');
    const last = parsed[parsed.length - 1];
    return parseInt(last);
}

router.get('/latest', requireRequestFromSimulator, function (req, res, next) {
    const latest = getLatest();
    res.json({ latest: latest });
});

router.post('/register', requireRequestFromSimulator, async function (req, res, next) {
    const { username, email, pwd } = req.body;
    updateLatest(req);

    const validEmail = validateEmail(email);
    const usernameExists = await userService.getUserIdByUsernameIfExists(username);

    let error = null;

    if (!username) {
        error = 'You have to enter a username';
    }

    if (usernameExists) {
        error = 'The username is already taken';
    }

    if (!validEmail) {
        error = 'You have to enter a valid email address';
    }

    if (!pwd) {
        error = 'You have to enter a password';
    }

    if (!validEmail) {
        req.flash('error', 'Please enter a valid email address')
        return res.redirect('/register')
    }

    if (!error) {
        userService.registerUser(username, email, pwd)
            .then(() => {
                updateLatest(req);
                res.status(204);
            })
            .catch((err) => {
                res.json({ message: err.message });
            });
    }

    if (error) {
        res.status(400).json({ status: 400, error_msg: error });
    }
    res.status(204).send();
});

router.post('/msgs/:username', requireRequestFromSimulator, async function (req, res, next) {
    updateLatest(req);
    const { username } = req.params;
    const { content } = req.body;
    const id = await userService.getUserIdByUsername(username);
    const currentDate = Math.floor(new Date().getTime() / 1000);
    await userService.addMessage(id.user_id, content, currentDate);
    res.status(204).send();
});

router.get('/msgs', requireRequestFromSimulator, async function (req, res, next) {
    updateLatest(req);
    const { no } = req.query;
    const messages = await userService.getPublicTimelineMessages(no);
    res.json(formatMessagesAsJSON(messages));
});

router.post('/msgs/:username', requireRequestFromSimulator, async function (req, res, next) {
    updateLatest(req);
    const { username } = req.params;
    const id = await userService.getUserIdByUsername(username);
    if (!id) {
        res.status(404).send();
    }
    const messages = await userService.getMessagesByUserId(id.user_id);
    res.json(formatMessagesAsJSON(messages));
});

router.post('/fllws/:username', requireRequestFromSimulator, async function (req, res, next) {
    updateLatest(req);
    const latest = getLatest();
    const { username } = req.params;
    const id = await userService.getUserIdByUsername(username);

    if (!id) {
        res.status(404).send();
    }
    const{follow} = req.body;
    await userService.followUser(id.user_id, follow)
    res.json(formatMessagesAsJSON(messages));
});

router.post('/fllws/:username', requireRequestFromSimulator, async function (req, res, next) {
    updateLatest(req);
    const latest = getLatest();
    const { username } = req.params;
    const id = await userService.getUserIdByUsername(username);

    if (!id) {
        res.status(404).send();
    }
    const{unfollow} = req.body;
    await userService.unfollowUser(id.user_id, unfollow)
    res.json(formatMessagesAsJSON(messages));
});
module.exports = router;