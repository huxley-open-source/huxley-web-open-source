/*global require, angular, _*/

(function (require, angular) {
    'use strict';

    var homeApp = require('./home-app');

    angular.module(homeApp.name)

        .controller('HomeTeacherController', [
            '$scope',
            'currentUser',
            'info',
            'ProblemService',
            function ($scope, currentUser, info, ProblemService) {
                $scope.currentUser = currentUser;
                $scope.info = info;
                $scope.panelOption = 0;

                if ($scope.info[0].length === 0) {
                    $scope.panelOption = 1;
                } else if ($scope.info[3] === 0) {
                    $scope.panelOption = 2;
                }

                if ($scope.currentUser.isAdminInst()) {
                    $scope.panelOption = 3;
                }

                $scope.notificationList = _.clone($scope.layoutNotificationList);

                $scope.notificationList.sort(function(a,b){
                    return new Date(b.date) - new Date(a.date);
                });

                var updateNotificationList = function (message) {
                    $scope.notificationList.unshift(message);
                    if ($scope.notificationList.length > 9) {
                        $scope.notificationList.pop();
                    }
                };

                ProblemService.getStats({ 'test_cases': true }).then(function(resp) {
                    $scope.badTestCases = resp.data;
                });

                ProblemService.countByStatus().then(function(resp) {
                   resp.data.forEach(function(cs) {
                       if (cs.status === 0){
                           $scope.pending = cs.count;
                       }
                   });
                });

                ProblemService.findBadTips().then(function(resp) {
                   $scope.badTips = resp.data;
                });

                $scope.$on('GROUP_MEMBER_SOLVED_PROBLEM', function (event, message) {
                    updateNotificationList(message);
                });

                $scope.$on('USER_SUBMISSION_STATUS', function (event, message) {
                    updateNotificationList(message);
                });

            }])

        .controller('HomeStudentController', [
            '$scope',
            'currentUser',
            'info',
            function ($scope, currentUser, info) {
                $scope.currentUser = currentUser;
                $scope.info = info;

                $scope.notificationList = _.clone($scope.layoutNotificationList);

                $scope.notificationList.sort(function(a,b){
                    return new Date(b.date) - new Date(a.date);
                });

                var updateNotificationList = function (message) {
                    $scope.notificationList.unshift(message);
                    if ($scope.notificationList.length > 9) {
                        $scope.notificationList.pop();
                    }
                };

                $scope.$on('GROUP_MEMBER_SOLVED_PROBLEM', function (event, message) {
                    updateNotificationList(message);
                });

                $scope.$on('USER_SUBMISSION_STATUS', function (event, message) {
                    updateNotificationList(message);
                });
            }
        ])
        .controller('HomeRequestTeacherController', [
            '$scope',
            'currentUser',
            'PendencyService',
            'InstitutionService',
            '$state',
            function ($scope, currentUser, pendencyService, institutionService, $state) {
                $scope.institution =[];
                $scope.institutionName = '';
                $scope.hasError = true;
                $scope.showResult = false;
                $scope.sendPendency = function () {
                    if ($scope.institution[0]) {
                        var newPendency = {user: currentUser,
                            institution: $scope.institution[0],
                            group: [],
                            kind : 'TEACHER_APPROVAL'
                            };
                        pendencyService.save(newPendency).then(
                            function () {
                                $scope.hasError = false;
                                $scope.showResult = true;
                            },
                            function () {
                                $scope.hasError = true;
                                $scope.showResult = true;
                            }
                        );
                    } else {
                        $state.go('institution-create', {institutionName: $scope.institutionName});
                    }

                };
            }
        ])
        .controller('HomeLoginController', [
            '$scope',
            'SecurityService',
            'fail',
            '$stateParams',
            function ($scope, SecurityService, fail, $stateParams) {
                $scope.user = { username: $stateParams.username };
                $scope.status = $stateParams.status;
                $scope.hasError = fail;
                $scope.sendForm = function () {
                    SecurityService.login($scope.user).then(function () {
                        $scope.hasError = false;
                    }, function (response) {
                        $scope.hasError = true;
                        $scope.status = response.status;
                    });
                };
                $scope.formChanged = function () {
                    if($scope.login.username.$dirty) {
                        $scope.hasError = false;
                    }
                    else if($scope.login.password.$dirty) {
                        $scope.hasError = false;
                    }
                };
            }
        ])
        .controller('HomeRetryPasswordController', [
            '$scope',
            'UserService',
            function ($scope, UserService) {
                $scope.user = {};
                $scope.info = 0;
                $scope.hasError = false;
                $scope.sendForm = function () {
                    if (!$scope.retryPassword.$valid) {
                        _(_.keys($scope.retryPassword)).forEach(function (field) {
                            if (field[0] !== '$') {
                                $scope.retryPassword[field].$setDirty();
                            }
                        });
                    } else {
                        UserService.requestChangePassword({k: $scope.user.email}).then(function () {
                            $scope.info = 1;
                        }, function () {
                            $scope.info = 2;
                        });
                    }
                };
            }
        ])

        .controller('HomeRecoverPasswordController', [
            '$scope',
            'UserService',
            'key',
            function ($scope, UserService, key) {
                $scope.info = 0;
                $scope.hasError = false;
                $scope.validatePassword =  function (kind) {
                    if (kind || ($scope.recoverPassword.passwordR.$dirty && $scope.recoverPassword.password.$dirty)) {
                        if ($scope.password === $scope.passwordR) {
                            $scope.recoverPassword.passwordR.$setValidity('equal', true);
                        } else {
                            $scope.recoverPassword.passwordR.$setValidity('equal', false);
                        }
                    }
                };
                $scope.sendForm = function () {
                    $scope.validatePassword(true);
                    if (!$scope.recoverPassword.$valid) {
                        _(_.keys($scope.recoverPassword)).forEach(function (field) {
                            if (field[0] !== '$') {
                                $scope.recoverPassword[field].$setDirty();
                            }
                        });
                    } else {
                        UserService.changePassword({newPassword: $scope.password, confirmNewPassword: $scope.passwordR, key: key}).then(function () {
                            $scope.info = 1;
                        }, function () {
                            $scope.info = 2;
                        });
                    }
                };
            }
        ])

        .controller('HomeSignInController', [
            '$scope',
            'UserService',
            'SecurityService',
            function ($scope, UserService, SecurityService) {
                $scope.user = {};
                $scope.validateUsername = function () {

                    UserService.userValidate({
                        username : $scope.user.username
                    }).then(function () {
                            $scope.createUser.username.$setValidity('unique', true);
                            $scope.createUser.username.$setValidity('format', true);
                        },
                        function (response) {
                            var valid = true;
                            var format = true;
                            _.each(response.data.errors, function (error) {
                                console.log(error);
                                if (error.code === 301011) {
                                    valid = false;
                                } else if (error.code === 301012) {
                                    format = false;
                                }
                            });
                            $scope.createUser.username.$setValidity('unique', valid);
                            $scope.createUser.username.$setValidity('format', format);
                        });
                };
                $scope.validateEmail = function () {
                    UserService.userValidate({
                        email : $scope.user.email
                    }).then(function () {
                            $scope.createUser.email.$setValidity('unique', true);
                        },
                        function (response) {
                            var valid = true;
                            _.each(response.data.errors, function (error) {
                                if (error.code === 301021) {
                                    valid = false;
                                }
                            });
                            $scope.createUser.email.$setValidity('unique', valid);

                        });
                };
                $scope.validateEmailR = function () {
                    if ($scope.createUser.emailR.$dirty) {
                        if ($scope.user.email === $scope.user.emailR) {
                            $scope.createUser.emailR.$setValidity('repeat', true);
                        } else {
                            $scope.createUser.emailR.$setValidity('repeat', false);
                        }
                    }

                };
                $scope.formSubmit = function () {
                    if (!$scope.createUser.$valid) {
                        _(_.keys($scope.createUser)).forEach(function (field) {
                            if (field[0] !== '$') {
                                $scope.createUser[field].$setDirty();
                            }
                        });
                    } else {
                        UserService.create($scope.user).then(function(){
                            SecurityService.login({
                                username: $scope.user.username,
                                password: $scope.user.password
                            });
                        });
                    }
                };

            }
        ])
        .controller('UnauthenticatedHomeController', [
            '$scope',
            'UserService',
            'SecurityService',
            function ($scope, UserService, SecurityService) {
                $scope.registerOption = 'student';
                $scope.myInterval = 5000;
                $scope.slides = [];
                $scope.slides.push({
                    image: '/images/home/teste-rodrigo.png',
                    text: 'O Professor Rodrigo de Barros Paes publicou um livro sobre programação em C.',
                    link: 'http://aprendac.com.br/',
                    linkText: 'Saiba Mais!'
                    // thumb: '/images/home/thumb02.png'
                });

                $scope.form = {
                    name : '',
                    email : '',
                    confirmEmail: '',
                    username : '',
                    password: '',
                    confirmPassword: '',
                    maxLength: 255,
                    minLength: 6,
                    done : false
                };

                $scope.userValidate = function () {
                    UserService.userValidate({
                        email : $scope.form.email,
                        username : $scope.form.username
                    }).then(function () {
                            $scope.registerForm.username.$setValidity('used', true);
                            $scope.registerForm.username.$setValidity('pattern', true);
                        },
                        function (response) {
                            _.each(response.data.errors, function (error) {
                                if (error.code === 301011) {
                                    $scope.registerForm.username.$setValidity('used', false);
                                    return false;
                                } else if (error.code === 301012) {
                                    $scope.registerForm.username.$setValidity('pattern', false);
                                    return false;
                                } else {
                                    $scope.registerForm.username.$setValidity('used', true);
                                    $scope.registerForm.username.$setValidity('pattern', true);
                                }
                            });
                        });
                };

                $scope.emailValidate = function () {
                    UserService.userValidate({
                        email : $scope.form.email
                    }).then(function () {
                            $scope.registerForm.email.$setValidity('used', true);
                        },
                        function (response) {
                            _.each(response.data.errors, function (error) {
                                if (error.code === 301021) {
                                    $scope.registerForm.email.$setValidity('used', false);
                                    return false;
                                } else if (error.code === 301022) {
                                    $scope.registerForm.email.$setValidity('pattern', false);
                                    return false;
                                } else {
                                    $scope.registerForm.email.$setValidity('used', true);
                                    $scope.registerForm.email.$setValidity('pattern', true);
                                }
                            });
                        });
                };

                $scope.matchEmails = function () {
                    if($scope.form.email === $scope.form.confirmEmail) {
                        $scope.registerForm.repeatEmail.$setValidity('match', true);
                    } else {
                        $scope.registerForm.repeatEmail.$setValidity('match', false);
                    }
                };

                $scope.matchPassword = function () {
                    if($scope.form.password === $scope.form.confirmPassword) {
                        $scope.registerForm.repeatPassword.$setValidity('match', true);
                    } else {
                        $scope.registerForm.repeatPassword.$setValidity('match', false);
                    }
                };

                $scope.formSubmit = function () {
                    if (!$scope.registerForm.$valid) {
                        _(_.keys($scope.registerForm)).forEach(function (field) {
                            if (field[0] !== '$') {
                                $scope.registerForm[field].$setDirty();
                            }
                        });
                    } else {
                        UserService.register({
                            name: $scope.form.name,
                            username: $scope.form.username,
                            email: $scope.form.email,
                            password: $scope.form.password
                        }).then(function () {
                            SecurityService.login({
                                username: $scope.form.username,
                                password: $scope.form.password
                            });
                        });
                    }
                };
            }
        ]);

}(require, angular));