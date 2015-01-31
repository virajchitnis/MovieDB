var express = require('express');
var router = express.Router();
var pjson = require('../package.json');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { appName: 'Movies - ' + pjson.name });
});

/* GET login page. */
router.get('/login', function(req, res) {
  res.render('login', { appName: pjson.name });
});

module.exports = router;
