var express = require('express');
var router = express.Router();

// MongoDB setup
var mongoose = require('mongoose');
var Movie = require('../models/Movie.js');

/* PARAM (method) for retrieving a movie by its imdb_id */
router.param('movie', function(req, res, next, imdb_id) {
	var query = Movie.findOne({ 'imdb_id': imdb_id }, function (err, movie) {
		if(err){ return next(err); }
		if (!movie) { return next(new Error("can't find movie")); }
		
		req.movie = movie;
		return next();
	});
});

/* GET all movies. */
router.get('/', function(req, res) {
	Movie.find(function (err, movies) {
		if (err) return next(err);
		res.json(movies);
	});
});

/* GET all movies for backup purposes. */
router.get('/backup', function(req, res) {
	Movie.find(function (err, movies) {
		if (err) return next(err);
		
		var backup = new Array();
		for (var i = 0; i < movies.length; i++) {
			var movie = {
				imdb_id: movies[i].imdb_id,
				quality: movies[i].quality,
				filename: movies[i].filename
			};
			backup.push(movie);
		}
		
		res.json(backup);
	});
});

/* POST update an a movie if it exists in the database, otherwise add a new one */
router.post('/', function(req, res, next) {
	Movie.findOne({ 'imdb_id': req.body.imdb_id }, function (err, existing_movie) {
		if(err){ return next(err); }
		if (existing_movie) {
			Movie.findOneAndUpdate({ 'imdb_id': req.body.imdb_id }, req.body, function (err, updated_movie) {
				if(err){ return next(err); }
				
				var socketio = req.app.get('socketio');
				socketio.sockets.emit('movies.modified', movie);
				
				res.json(updated_movie);
			});
		}
		else {
			var movie = new Movie(req.body);
			movie.save(function(err, movie) {
				if(err){ return next(err); }
				
				var socketio = req.app.get('socketio');
				socketio.sockets.emit('movies.modified', movie);
				
				res.json(movie);
			});
		}
	});
});

/* GET a particular movie by its id */
router.get('/:movie', function(req, res) {
	res.json(req.movie);
});

module.exports = router;
