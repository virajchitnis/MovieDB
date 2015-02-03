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
	
	$scope.submitNewUser = function() {
		if (($scope.firstNameCSSClasses == "") && ($scope.lastNameCSSClasses == "") && ($scope.emailCSSClasses == "") && ($scope.passwordCSSClasses == "") && ($scope.accessCodeCSSClasses == "")) {
			var user = {
				email: $scope.email,
				first_name: $scope.firstName,
				last_name: $scope.lastName,
				password: $scope.password,
				access_code: $scope.accessCode
			}
		
			$scope.responseTitle = "Please wait...";
			$scope.responseMessage = "Verifying info and creating user account...";
			$scope.responseMessageClosable = false;
		
			$('#login-progress-modal').modal({
				backdrop: 'static',
				keyboard: false,
				show: true
			});
		
			$http.post('/users', user).
			success(function(data, status, headers, config) {
				var response = data;
				if (response.success) {
					$('#login-progress-modal').modal('hide');
					$('#signup-modal').modal('hide');
					
					$scope.firstName = "";
					$scope.firstNameCSSClasses = "has-error";
					$scope.firstNameGlyphicon = "glyphicon-remove";
					$scope.lastName = "";
					$scope.lastNameCSSClasses = "has-error";
					$scope.lastNameGlyphicon = "glyphicon-remove";
					$scope.email = "";
					$scope.emailCSSClasses = "has-error";
					$scope.emailGlyphicon = "glyphicon-remove";
					$scope.password = "";
					$scope.passwordCSSClasses = "has-error";
					$scope.passwordGlyphicon = "glyphicon-remove";
					$scope.passwordRepeat = "";
					$scope.passwordRepeatCSSClasses = "has-error";
					$scope.passwordRepeatGlyphicon = "glyphicon-remove";
					$scope.accessCode = "";
					$scope.accessCodeCSSClasses = "has-error";
					$scope.accessCodeGlyphicon = "glyphicon-remove";
				}
				else {
					$scope.responseTitle = "Error";
					$scope.responseMessage = response.message;
					$scope.responseMessageClosable = true;
				}
			});
		}
		else {
			$scope.responseTitle = "Error";
			$scope.responseMessage = "Please fill out all the fields in the form and make sure they are check marked.";
			$scope.responseMessageClosable = true;
			
			$('#login-progress-modal').modal({
				backdrop: 'static',
				keyboard: false,
				show: true
			});
		}
	};
	
	$scope.userLogin = function() {
		var login = {
			email: $scope.loginEmail,
			password: $scope.loginPassword,
			user_agent: navigator.userAgent
		};
		
		$scope.responseTitle = "Please wait...";
		$scope.responseMessage = "Verifying login credentials...";
		$scope.responseMessageClosable = false;
	
		$('#login-progress-modal').modal({
			backdrop: 'static',
			keyboard: false,
			show: true
		});
		
		$http.post('/users/login', login).
		success(function(data, status, headers, config) {
			var response = data;
			if (response.success) {
				setCookie("token", response.token, 30);
				window.location = "/";
				
				$('#login-progress-modal').modal('hide');
			}
			else {
				$scope.responseTitle = "Error";
				$scope.responseMessage = response.message;
				$scope.responseMessageClosable = true;
			
				$('#login-progress-modal').modal({
					backdrop: 'static',
					keyboard: false,
					show: true
				});
			}
		});
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