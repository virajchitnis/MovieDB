var mongoose = require('mongoose');

var MovieSchema = new mongoose.Schema({
	imdb_id: {
		type: String,
		required: true,
		unique: true
	},
	title: String,
	year: String,
	rated: String,
	released: String,
	runtime: String,
	genre: String,
	director: String,
	writer: String,
	actors: String,
	plot: String,
	language: String,
	country: String,
	awards: String,
	poster: String,
	metascore: Number,
	imdb_rating: String,
	imdb_votes: String,
	quality: String,
	filename: String
});

module.exports = mongoose.model('Movie', MovieSchema);