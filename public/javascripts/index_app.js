var app = angular.module('app', ['socket.io']);
app.config(['$socketProvider', function ($socketProvider) {
	$socketProvider.setConnectionUrl('http://' + document.domain + ':3003');
	$socketProvider.setTryMultipleTransports(false);
}]);
app.controller('MainCtrl', ['$scope', '$http', '$sce', '$socket', function($scope, $http, $sce, $socket) {
	$scope.generatedJSON = "[]";
	$scope.form_quality = "1080p HD"
	$scope.progressbar = {
		width: '0%'
	};
	$scope.progressbar_text = "0%";
	
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
					
					$scope.progress_info = "Inserting " + moviedb_movie.title + " into the database...";
					
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
						}
					});
				}
			});
		}
		
		$('#progress-modal').modal('hide');
	};
}]);