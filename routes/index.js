var express = require('express');
var router = express.Router();

const requireAuth = (req, res, next) => {
  if (req.session.userId) {
      next(); // User is authenticated
  } else {
      res.redirect('/public'); // User is not authenticated, redirect to public timeline
  }
}

/* GET user timeline page. */
router.get('/', requireAuth, function(req, res, next) {
  res.render('timeline', { title: 'My Timeline' });
});

module.exports = router;
