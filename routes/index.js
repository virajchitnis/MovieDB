var express = require('express');
var router = express.Router();
var pjson = require('../package.json');

// MongoDB setup
var mongoose = require('mongoose');
var Movie = require('../models/Movie.js');
var User = require('../models/User.js');
var AccessCode = require('../models/AccessCode.js');
var Login = require('../models/Login.js');

/* GET home page. */
router.get('/', function(req, res) {
	if (req.cookies.token) {
		Login.findById(req.cookies.token, function (err, login) {
			if (err) return next(err);
			
			if (login) {
				AccessCode.findOne({ 'email': login.email }, function(err, accesscode) {
					if (accesscode) {
						if (accesscode.expires) {
							var current_date = new Date();
							if (current_date > accesscode.expires) {
								return401();
							}
							else {
								returnPage();
							}
						}
						else {
							returnPage();
						}
					}
					else {
						return401();
					}
				});
			}
			else {
				return401();
			}
		});
	}
	else {
		return401();
	}
	
	function return401() {
		res.status(401);
		res.send("<script type='text/javascript'>window.location.replace('/login');</script>");
	}
	
	function returnPage() {
		res.render('index', { appName: pjson.name });
	}
});

/* GET login page. */
router.get('/login', function(req, res) {
	res.render('login', { appName: pjson.name });
});

module.exports = router;
