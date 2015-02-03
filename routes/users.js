var express = require('express');
var router = express.Router();
var cfg = require('../config.json');

// MongoDB setup
var mongoose = require('mongoose');
var Movie = require('../models/Movie.js');
var User = require('../models/User.js');
var AccessCode = require('../models/AccessCode.js');
var Login = require('../models/Login.js');

/* POST add a new user. */
router.post('/', function(req, res, next) {
	if (validateEmail(req.body.email) && validatePassword(req.body.password) && (req.body.first_name.length >= 2) && (req.body.last_name.length >= 2) && (req.body.access_code.length >= 10)) {
		User.findOne({ 'email': req.body.email }, function(err, existing_user) {
			if(err){ return next(err); }
		
			if (!existing_user) {
				AccessCode.findOne({ 'email': req.body.email }, function(err, access_code) {
					if(err){ return next(err); }
					if (access_code && (access_code._id == req.body.access_code)) {
						if (access_code.expires) {
							var current_date = new Date();
							if (current_date > access_code.expires) {
								returnFailure("Your access code has expired.");
							}
							else {
								returnSuccess(access_code);
							}
						}
						else {
							returnSuccess(access_code);
						}
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
	}
	else {
		returnFailure("Please fill out all the fields in the form and make sure they are check marked.");
	}
	
	function validateEmail(email) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}
	
	function validatePassword(str) {
		// at least one number, one lowercase and one uppercase letter
		// at least six characters
		var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
		return re.test(str);
	}
	
	function returnSuccess(access_code) {
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
								returnSuccess();
							}
							else {
								returnFailure("Invalid admin credentials.");
							}
						});
					}
					else {
						returnSuccess("There is no admin account, please create one as soon as possible.");
					}
				});
			}
			else {
				returnFailure("Invalid admin credentials.");
			}
		}
		else {
			returnFailure("Access code already exists for this email.");
		}
	});
	
	function returnSuccess(message) {
		var access_code = {
			email: req.body.email,
			account_type: req.body.type
		};
		
		if (req.body.expires) {
			access_code.expires = req.body.expires;
		}
		
		if (message) {
			access_code.message = message;
		}

		var accesscode = new AccessCode(access_code);
		accesscode.save(function(err, accesscode) {
			if(err){ return next(err); }

			res.json(accesscode);
		});
	}
	
	function returnFailure(msg) {
		var ret = {
			success: false,
			message: msg
		};
		res.json(ret);
	}
});

/* POST check if email is already taken. */
router.post('/email', function(req, res, next) {
	User.findOne({ 'email': req.body.email }, function(err, existing_user) {
		if(err){ return next(err); }
		
		if (!existing_user) {
			returnJSON(true);
		}
		else {
			returnJSON(false);
		}
	});
	
	function returnJSON(status) {
		var ret = {
			available: status
		};
		res.json(ret);
	}
});

/* POST check if email and password are correct and allow (or prevent) user login. */
router.post('/login', function(req, res, next) {
	AccessCode.findOne({ 'email': req.body.email }, function(err, accesscode) {
		if(err){ return next(err); }
		if (accesscode) {
			if (accesscode.expires) {
				var current_date = new Date();
				if (current_date > accesscode.expires) {
					returnFailure("Your access code has expired.");
				}
				else {
					loginSuccess();
				}
			}
			else {
				loginSuccess();
			}
		}
		else {
			returnFailure("Invalid email or password, please try again.");
		}
	});
	
	function loginSuccess() {
		User.findOne({ 'email': req.body.email }, function(err, user) {
			if(err){ return next(err); }
		
			if (user) {
				user.comparePassword(req.body.password, function(err, isMatch) {
					if(err){ return next(err); }
					
					if (isMatch) {
						var received_data = {
							email: req.body.email,
							user_agent: req.body.user_agent
						};
		
						var login = new Login(received_data);
						login.save(function(err, login) {
							if(err){ return next(err); }
						
							var ret = {
								success: true,
								token: login._id
							}

							res.json(ret);
						});
					}
					else {
						returnFailure("Invalid email or password, please try again.");
					}
				});
			}
			else {
				returnFailure("Invalid email or password, please try again.");
			}
		});
	}
	
	function returnFailure(msg) {
		var ret = {
			success: false,
			message: msg
		};
		res.json(ret);
	}
});

module.exports = router;
