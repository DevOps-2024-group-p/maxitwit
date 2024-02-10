var express = require('express');
var router = express.Router();

/* GET public timeline page. */
router.get('/', function(req, res, next) {
  // use res.render to render the public timeline view
  res.render('public', { title: 'Public Timeline' });
});

module.exports = router;
