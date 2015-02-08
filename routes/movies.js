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
		
		var json = new Array();
		for (var i = 0; i < movies.length; i++) {
			var movie = {
				imdb_id: movies[i].imdb_id,
				title: movies[i].title,
				year: movies[i].year,
				rated: movies[i].rated,
				released: movies[i].released,
				runtime: movies[i].runtime,
				genre: movies[i].genre,
				director: movies[i].director,
				writer: movies[i].writer,
				actors: movies[i].actors,
				plot: movies[i].plot,
				language: movies[i].language,
				country: movies[i].country,
				awards: movies[i].awards,
				poster: movies[i].poster,
				metascore: movies[i].metascore,
				imdb_rating: movies[i].imdb_rating,
				imdb_votes: movies[i].imdb_votes,
				quality: movies[i].quality,
				filename: movies[i].filename
			};
			json.push(movie);
		}
		
		res.json(json);
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
				socketio.sockets.emit('movie.updated', updated_movie);
				
				res.json(updated_movie);
			});
		}
		else {
			var movie = new Movie(req.body);
			movie.save(function(err, movie) {
				if(err){ return next(err); }
				
				var socketio = req.app.get('socketio');
				socketio.sockets.emit('movie.added', movie);
				
				res.json(movie);
			});
		}
	});
});

/* GET a particular movie by its id */
router.get('/:movie', function(req, res) {
	var movie = {
		imdb_id: req.movie.imdb_id,
		title: req.movie.title,
		year: req.movie.year,
		rated: req.movie.rated,
		released: req.movie.released,
		runtime: req.movie.runtime,
		genre: req.movie.genre,
		director: req.movie.director,
		writer: req.movie.writer,
		actors: req.movie.actors,
		plot: req.movie.plot,
		language: req.movie.language,
		country: req.movie.country,
		awards: req.movie.awards,
		poster: req.movie.poster,
		metascore: req.movie.metascore,
		imdb_rating: req.movie.imdb_rating,
		imdb_votes: req.movie.imdb_votes,
		quality: req.movie.quality,
		filename: req.movie.filename
	};
	
	res.json(movie);
});

module.exports = router;
