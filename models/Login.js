var mongoose = require('mongoose');

var LoginSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true
	},
	user_agent: {
		type: String,
		required: true
	},
	login_date: {
		type: Date,
		required: true,
		default: Date.now
	},
	logout_date: Date
});

module.exports = mongoose.model('Login', LoginSchema);