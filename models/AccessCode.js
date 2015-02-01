var mongoose = require('mongoose');
var uuid = require('node-uuid');

var AccessCodeSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	account_type: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('AccessCode', AccessCodeSchema);