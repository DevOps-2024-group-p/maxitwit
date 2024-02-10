var express = require('express');
var router = express.Router();

/* GET login page. */
router.get('/', function(req, res, next) {
  // use res.render to render the login view
  res.render('login', { title: 'Login' });
});

module.exports = router;
