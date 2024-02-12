var express = require('express');
var router = express.Router();

router.get('/:username', async (req, res) => {
    const username = req.params.username;
    const profileUser = await queryDb('SELECT * FROM user WHERE username = ?', [username]);
    if (!profileUser) {
        return res.status(404).send('User not found');
    }
    let followed = false;
    if (req.user) {
        followed = await queryDb('SELECT 1 FROM follower WHERE follower.who_id = ? AND follower.whom_id = ?', [req.session.userId, profileUser.userId]);
    }
    const messages = await queryDb('SELECT message.*, user.* FROM message, user WHERE user.user_id = message.author_id AND user.user_id = ? ORDER BY message.pub_date DESC LIMIT ?', [profileUser.userId, PER_PAGE]);
    res.render('timeline', { messages, followed, profileUser });
});

router.get('/:username/follow', async (req, res) => {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    const whomId = await getUserId(req.params.username);
    if (!whomId) {
        return res.status(404).send('User not found');
    }
    await db.execute('INSERT INTO follower (who_id, whom_id) VALUES (?, ?)', [req.session.userId, whomId]);
    req.flash('success', `You are now following "${req.params.username}"`);
    res.redirect(`/user/${req.params.username}`);
});

router.get('/:username/unfollow', async (req, res) => {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    const whomId = await getUserId(req.params.username);
    if (!whomId) {
        return res.status(404).send('User not found');
    }
    await db.execute('DELETE FROM follower WHERE who_id=? AND whom_id=?', [req.session.userId, whomId]);
    req.flash('success', `You are no longer following "${req.params.username}"`);
    res.redirect(`/user/${req.params.username}`);
});


module.exports = router;
