var app = angular.module('app', ['socket.io']);
app.config(['$socketProvider', function ($socketProvider) {
	$socketProvider.setConnectionUrl('http://' + document.domain + ':3003');
	$socketProvider.setTryMultipleTransports(false);
}]);
app.controller('MainCtrl', ['$scope', '$http', '$sce', '$socket', function($scope, $http, $sce, $socket) {
	$(window).scroll(function() {
		var pageHeaderVisible = $(".page-header").visible();
		if (!pageHeaderVisible) {
			$("#backToTopButton").css("display", "block");
		}
		else {
			$("#backToTopButton").css("display", "none");
		}
		
		lazyLoadPosters();
	});
	
	$scope.searchMoviesCriteria = "title";
	$scope.generatedJSON = "[]";
	$scope.form_quality = "1080p HD"
	$scope.progressbar = {
		width: '0%'
	};
	$scope.progressbar_text = "0%";
	
	reloadAllMovies();
	
	var adminCheckData = { token: getCookie("token") };
	$http.post('/users/admin', adminCheckData).
	success(function(data, status, headers, config) {
		var response = data;
		if (response.admin) {
			$("#header").click(function() {
				$('#edit-modal').modal('show');
			});
			$scope.headerStyle = { cursor: "pointer" };
		}
		else {
			$scope.headerStyle = {};
		}
	});
	
	$scope.searchValueChanged = function() {
		$scope.searchMovies = {};
		$scope.searchMovies[$scope.searchMoviesCriteria] = $scope.searchMoviesInput;
	};
	
	$scope.showDetails = function(id) {
		var matchingMovies = $.grep($scope.movies, function(e){ return e.imdb_id == id; });
		var selectedMovie = matchingMovies[0];
		
		$scope.details_imdb_id = id;
		$scope.details_title = selectedMovie.title;
		$scope.details_year = selectedMovie.year;
		$scope.details_rated = selectedMovie.rated;
		$scope.details_runtime = selectedMovie.runtime;
		$scope.details_poster = selectedMovie.poster;
		$scope.details_quality = selectedMovie.quality;
		$scope.details_genre = selectedMovie.genre;
		$scope.details_released = selectedMovie.released;
		$scope.details_actors = selectedMovie.actors;
		$scope.details_director = selectedMovie.director;
		$scope.details_writer = selectedMovie.writer;
		$scope.details_plot = selectedMovie.plot;
		$scope.details_country = selectedMovie.country;
		$scope.details_awards = selectedMovie.awards;
		$scope.details_imdb_rating = selectedMovie.imdb_rating;
		
		$(".details-lazy-load").attr("src", selectedMovie.poster);
		
		$('#details-modal').modal('show');
	};
	
	$scope.addMovieToList = function() {
		var newMovie = {
			imdb_id: $scope.form_imdb_id,
			quality: $scope.form_quality,
			filename: $scope.form_filename
		};
		
		var movies = new Array();
		if ($scope.generatedJSON != "") {
			movies = JSON.parse($scope.generatedJSON);
		}
		movies.push(newMovie);
		$scope.generatedJSON = JSON.stringify(movies);
	};
	
	$scope.addAllMoviesToList = function() {
		$http.get('./movies/backup').success(function(data) {
			var movies = data;
			if ($scope.generatedJSON != "") {
				var new_movies = JSON.parse($scope.generatedJSON);
				
				for (var i = 0; i < new_movies.length; i++) {
					movies.push(new_movies[i]);
				}
			}
			$scope.generatedJSON = JSON.stringify(movies);
		});
	};
	
	$scope.clearMoviesList = function() {
		$scope.generatedJSON = "[]";
	};
	
	$scope.addMoviesToDB = function () {
		var movies = new Array();
		if ($scope.generatedJSON != "") {
			movies = JSON.parse($scope.generatedJSON);
		}
		
		$scope.progress_info = "Preparing..."
		
		$('#edit-modal').modal('hide');
		$('#progress-modal').modal('show');
		
		$scope.progressbar_crumbs = 100 / (movies.length * 2);
		$scope.progressbar_progress = 0;
		
		$scope.progressbar = {
			width: '0%'
		};
		$scope.progressbar_text = "0%";
		
		for (var i = 0; i < movies.length; i++) {
			$scope.current_movie = movies[i];
			$scope.progress_info = "Fetching metadata for " + $scope.current_movie.imdb_id + "...";
			
			$scope.progressbar_progress += $scope.progressbar_crumbs;
			$scope.progressbar = {
				width: $scope.progressbar_progress + '%'
			};
			$scope.progressbar_text = $scope.progressbar_progress + '%';
			
			jQuery.ajax({
				url: 'http://www.omdbapi.com/?i=' + $scope.current_movie.imdb_id + '&plot=full',
				type: 'GET',
				async: false,
				success: function(result) {
					var omdb_movie = JSON.parse(result);
					var moviedb_movie = {
						imdb_id: $scope.current_movie.imdb_id,
						quality: $scope.current_movie.quality,
						filename: $scope.current_movie.filename
					};
					
					if (omdb_movie.Response == "True") {
						moviedb_movie = {
							imdb_id: $scope.current_movie.imdb_id,
							title: omdb_movie.Title,
							year: omdb_movie.Year,
							rated: omdb_movie.Rated,
							released: omdb_movie.Released,
							runtime: omdb_movie.Runtime,
							genre: omdb_movie.Genre,
							director: omdb_movie.Director,
							writer: omdb_movie.Writer,
							actors: omdb_movie.Actors,
							plot: omdb_movie.Plot,
							language: omdb_movie.Language,
							country: omdb_movie.Country,
							awards: omdb_movie.Awards,
							poster: omdb_movie.Poster,
							metascore: omdb_movie.Metascore,
							imdb_rating: omdb_movie.imdbRating,
							imdb_votes: omdb_movie.imdbVotes,
							quality: $scope.current_movie.quality,
							filename: $scope.current_movie.filename
						};
						
						var movie_runtime = Number(moviedb_movie.runtime.replace(" min", ""));
						var movie_runtime_hours = Math.floor(movie_runtime / 60);
						var movie_runtime_mins = movie_runtime % 60;
						
						moviedb_movie.runtime = movie_runtime_hours + "h " + movie_runtime_mins + "m";
						
						if (moviedb_movie.rated == "Not Rated") {
							moviedb_movie.rated = "NR";
						}
						
						$scope.progress_info = "Inserting " + moviedb_movie.title + " into the database...";
					}
					
					jQuery.ajax({
						url: './movies',
						type: 'POST',
						async: false,
						data: moviedb_movie,
						success: function(result) {
							$scope.progressbar_progress += $scope.progressbar_crumbs;
							$scope.progressbar = {
								width: $scope.progressbar_progress + '%'
							};
							$scope.progressbar_text = $scope.progressbar_progress + '%';
							
							movies[i] = result;
						}
					});
				}
			});
		}
		
		console.log(movies);
		reloadAllMovies();
		$('#progress-modal').modal('hide');
	};
	
	$scope.scrollToTop = function() {
		$('html, body').animate({scrollTop: '0px'}, 1000);
	};
	
	function reloadAllMovies() {
		$http.get('./movies').success(function(data) {
			$scope.movies = data;
			
			setTimeout( function() {
				lazyLoadPosters();
			}, 150);
		});
	}
	
	function lazyLoadPosters() {
		$(".lazy-load").each(function() {
			if ($(this).attr("data-loaded") == "false") {
				if ($(this).visible(true)) {
					var posterURL = $(this).attr("data-poster");
					$(this).attr("src", posterURL);
					$(this).attr("data-loaded", "true");
				}
			}
		});
	}
	
	function setCookie(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires="+d.toUTCString();
		document.cookie = cname + "=" + cvalue + "; " + expires;
	}
	
	function getCookie(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i=0; i<ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1);
			if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
		}
		return "";
	}

	function checkCookie() {
		var user = getCookie("username");
		if (user != "") {
			alert("Welcome again " + user);
		} else {
			user = prompt("Please enter your name:", "");
			if (user != "" && user != null) {
				setCookie("username", user, 365);
			}
		}
	}
}]);