'use strict';

var firebase = new Firebase("https://leanmetrix.firebaseio.com");

angular.module('leanMetrix', ['ngMessages', 'firebase'])

.run(function() {

});

angular.module('leanMetrix').controller('authCtrl', function($rootScope) {

    var model = this;

    firebase.onAuth(function(authData) {

        $rootScope.authData = authData;

        if (!$rootScope.$$phase) $rootScope.$apply();        
    });

    this.signOut = function() {
        firebase.unauth();
    }
});

angular.module('leanMetrix').directive("compareTo", function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue == scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
});
angular.module('leanMetrix').controller('createAccountCtrl', function(AuthService) {

    var model = this;

    this.message = "";

    this.user = {
        email: "bobtester@mailinator.com",
        password: "123123",
        confirmPassword: "123123"
    };

    this.submit = function(isValid) {
        if (isValid) {
            AuthService.create(model.user.email, model.user.password).success(function(data) {
                AuthenticationService.isLogged = true;
                $window.sessionStorage.token = data.token;
                $location.path("/admin");
            }).error(function(status, data) {
                console.log(status, data);
            });
        } else {
            model.message = "There are still invalid fields below";
        }
    };
});


angular.module('leanMetrix').directive('usernameAvailableValidator', function($q, AuthService) {
    return {
        require: 'ngModel',
        link: function($scope, element, attrs, ngModel) {
            ngModel.$asyncValidators.usernameAvailable = function(email) {
                var deferred = $q.defer();
                deferred.resolve(false);
                return deferred.promise;
                return AuthService.exist(email);
            };
        }
    }
});

angular.module('leanMetrix').controller('domainsCtrl', function($firebase, FirebaseService) {

    var model = this;

    var firebase = FirebaseService.getInstance('/domains/');
    var sync = $firebase(firebase);


    console.log(this.domains);

    this.addDomain = function() {
        firebase.push().set(model.newDomain);
        model.newDomain = '';
    };
});

angular.module('leanMetrix').controller('messagesCtrl', function($scope, $firebase, FirebaseService) {

    var ctrl = this,
        firebaseDomains = FirebaseService.getInstance('/domains/');

    ctrl.domains = $firebase(firebaseDomains).$asArray();

    $scope.$watch('currentDomain', function(newValue, oldValue) {

        if (!newValue) return;

        var url = newValue.$value.replace('.', '@') + '/messages/';
        var firebaseMessages = FirebaseService.getInstance(url);
        ctrl.messages = $firebase(firebaseMessages).$asArray();
    });

});

angular.module('leanMetrix').factory('AuthService', function($firebase, $http, $rootScope) {

    var apiRoot = 'http://localhost:3000';
    //var firebase = new Firebase("https://leanmetrix.firebaseio.com/");

    return {
        signIn: function(email, password) {
            firebase.authWithPassword({
                email: email,
                password: password,
            }, function(error, authData) {
                if (error === null) {
                    console.log(authData);
                } else {
                    console.log("Error authenticating user:", error);
                }
            });
        },
        create: function(email, password) {

            var account = {
                email: email,
                password: password,
            };

            firebase.createUser(account, function(error) {
                console.log(error);
            });

             $http.post(apiRoot + '/createaccount/', account);
        },
        exist: function(email) {
            return $http.get(apiRoot + '/users/?email=' + email);
        },
        currentUser: function() {
            return $rootScope.authData.password.email;
        }
    }
});

angular.module('leanMetrix').factory('FirebaseService', function(Firebase, AuthService) {

    function firebaseUserUrl() {
        return 'https://leanmetrix.firebaseio.com/' + AuthService.currentUser().replace('.', '@') + '/';
    }

    function getInstance(path) {
        console.log('isntance', firebaseUserUrl() + path)
        return new Firebase(firebaseUserUrl() + path);
    }

    return {
        firebaseUserUrl: firebaseUserUrl,
        getInstance: getInstance
    }
});

angular.module('leanMetrix').controller('signInCtrl', function(AuthService) {

    var model = this;

    this.message = "";

    this.user = {
        email: "",
        password: ""
    };

    this.submit = function(isValid) {
        if (isValid) {
            AuthService.signIn(model.user.email, model.user.password);
        } else {
            model.message = "There are still invalid fields below";
        }
    };

    this.logout = function logout() {
        if (AuthenticationService.isLogged) {
            AuthenticationService.isLogged = false;
            delete $window.sessionStorage.token;
            $location.path("/");
        }
    }

});

//# sourceMappingURL=app.js.map