var app = angular.module('app', ['socket.io']);
app.config(['$socketProvider', function ($socketProvider) {
	$socketProvider.setConnectionUrl('http://' + document.domain + ':3003');
	$socketProvider.setTryMultipleTransports(false);
}]);
app.controller('MainCtrl', ['$scope', '$http', '$sce', '$socket', function($scope, $http, $sce, $socket) {
	$scope.firstNameCSSClasses = "has-error";
	$scope.firstNameGlyphicon = "glyphicon-remove";
	$scope.validateFirstName = function() {
		if ($scope.firstName.length >= 2) {
			$scope.firstNameCSSClasses = "";
			$scope.firstNameGlyphicon = "glyphicon-ok";
		}
		else {
			$scope.firstNameCSSClasses = "has-error";
			$scope.firstNameGlyphicon = "glyphicon-remove";
		}
	};
	
	$scope.lastNameCSSClasses = "has-error";
	$scope.lastNameGlyphicon = "glyphicon-remove";
	$scope.validateLastName = function() {
		if ($scope.lastName.length >= 2) {
			$scope.lastNameCSSClasses = "";
			$scope.lastNameGlyphicon = "glyphicon-ok";
		}
		else {
			$scope.lastNameCSSClasses = "has-error";
			$scope.lastNameGlyphicon = "glyphicon-remove";
		}
	};
	
	$scope.email = "";
	$scope.emailAvailable = true;
	$scope.emailCSSClasses = "has-error";
	$scope.emailGlyphicon = "glyphicon-remove";
	$scope.emailChanged = function() {
		if (validateEmail($scope.email)) {
			var request = {
				email: $scope.email
			}
		
			if ($scope.email != "") {
				$http.post('/users/email', request).
				success(function(data, status, headers, config) {
					$scope.emailAvailable = data.available;
				
					if (data.available) {
						$scope.emailCSSClasses = "";
						$scope.emailGlyphicon = "glyphicon-ok";
					}
					else {
						$scope.emailCSSClasses = "has-error";
						$scope.emailGlyphicon = "glyphicon-remove";
					}
				});
			}
		}
		else {
			$scope.emailCSSClasses = "has-error";
			$scope.emailGlyphicon = "glyphicon-remove";
		}
	};
	
	$scope.passwordCSSClasses = "has-error";
	$scope.passwordGlyphicon = "glyphicon-remove";
	$scope.validatePassword = function() {
		if (validatePassword($scope.password)) {
			$scope.passwordCSSClasses = "";
			$scope.passwordGlyphicon = "glyphicon-ok";
		}
		else {
			$scope.passwordCSSClasses = "has-error";
			$scope.passwordGlyphicon = "glyphicon-remove";
		}
		
		if ($scope.passwordRepeat == $scope.password) {
			$scope.passwordsMatch = true;
			$scope.passwordRepeatCSSClasses = "";
			$scope.passwordRepeatGlyphicon = "glyphicon-ok";
		}
		else {
			$scope.passwordsMatch = false;
			$scope.passwordRepeatCSSClasses = "has-error";
			$scope.passwordRepeatGlyphicon = "glyphicon-remove";
		}
	};
	
	$scope.passwordsMatch = false;
	$scope.passwordRepeatCSSClasses = "has-error";
	$scope.passwordRepeatGlyphicon = "glyphicon-remove";
	$scope.validatePasswordRepeat = function() {
		if ($scope.passwordRepeat == $scope.password) {
			$scope.passwordsMatch = true;
			$scope.passwordRepeatCSSClasses = "";
			$scope.passwordRepeatGlyphicon = "glyphicon-ok";
		}
		else {
			$scope.passwordsMatch = false;
			$scope.passwordRepeatCSSClasses = "has-error";
			$scope.passwordRepeatGlyphicon = "glyphicon-remove";
		}
	};
	
	$scope.accessCodeCSSClasses = "has-error";
	$scope.accessCodeGlyphicon = "glyphicon-remove";
	$scope.validateAccessCode = function() {
		if ($scope.accessCode.length >= 10) {
			$scope.accessCodeCSSClasses = "";
			$scope.accessCodeGlyphicon = "glyphicon-ok";
		}
		else {
			$scope.accessCodeCSSClasses = "has-error";
			$scope.accessCodeGlyphicon = "glyphicon-remove";
		}
	};
	
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
}]);