var express = require('express');
var router = express.Router();
var cfg = require('../config.json');

// MongoDB setup
var mongoose = require('mongoose');
var Movie = require('../models/Movie.js');
var User = require('../models/User.js');
var AccessCode = require('../models/AccessCode.js');

/* POST add a new user. */
router.post('/', function(req, res, next) {
	User.findOne({ 'email': req.body.email }, function(err, existing_user) {
		if(err){ return next(err); }
		
		if (!existing_user) {
			AccessCode.findOne({ 'email': req.body.email }, function(err, access_code) {
				if(err){ return next(err); }
				if (access_code && (access_code._id == req.body.access_code)) {
					var user = new User(req.body);
			
					if (access_code.account_type == "admin") {
						user.type = "admin";
					}
					else {
						user.type = "user";
					}
			
					user.save(function(err, user) {
						if(err){ return next(err); }
				
						var ret = {
							email: user.email,
							success: true
						};
				
						res.json(ret);
					});
				}
				else {
					returnFailure("Invalid access code.");
				}
			});
		}
		else {
			returnFailure("Account with selected email exists.");
		}
	});
	
	function returnFailure(msg) {
		var ret = {
			success: false,
			message: msg
		};
		res.json(ret);
	}
});

/* POST add a new access code. */
router.post('/code', function(req, res, next) {
	AccessCode.findOne({ 'email': req.body.email }, function(err, existing_accesscode) {
		if(err){ return next(err); }
		if (!existing_accesscode) {
			var owner_email = cfg.owner;
			if (req.body.owner == owner_email) {
				User.findOne({ 'email': req.body.owner }, function(err, owner) {
					if(err){ return next(err); }
			
					if (owner) {
						owner.comparePassword(req.body.password, function(err, isMatch) {
							if(err){ return next(err); }
					
							if (isMatch) {
								var access_code = {
									email: req.body.email,
									account_type: req.body.type
								};
		
								var accesscode = new AccessCode(access_code);
								accesscode.save(function(err, accesscode) {
									if(err){ return next(err); }

									res.json(accesscode);
								});
							}
							else {
								returnFailure("Invalid admin password.");
							}
						});
					}
					else {
						returnFailure("Admin account does not exist.");
					}
				});
			}
			else {
				returnFailure("Invalid admin email.");
			}
		}
		else {
			returnFailure("Access code already exists for this email.");
		}
	});
	
	function returnFailure(msg) {
		var ret = {
			success: false,
			message: msg
		};
		res.json(ret);
	}
});

module.exports = router;
