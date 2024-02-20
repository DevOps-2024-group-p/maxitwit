const express = require('express');

const router = express.Router();

const requireAuth = (req, res, next) => {
	if (req.session.username) {
		next();
	} else {
		res.redirect('/public');
	}
};

router.get('/', requireAuth, (req, res) => {
	req.session.username = null;
	req.flash('success', 'You were logged out');
	res.redirect('/public');
});

module.exports = router;
