var express = require('express');
var router = express.Router();

/* GET register page. */
router.get('/', function (req, res, next) {
  // use res.render to render the register view
  res.render('register', { title: 'Register' });
});

module.exports = router;
