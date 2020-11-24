/*global module, require, angular, moment*/

require('angular-translate');

(function (module, angular) {
    'use strict';

    var messagesPtBr = require('./i18n/messages_pt_BR'),
        messagesEnUs = require('./i18n/messages_en_US'),
        securityModule = require('../security/security-module');

    module.exports = angular.module('thehuxley.home', [
        securityModule.name,
        'pascalprecht.translate',
        'slick'
    ])

        .config([
            'apiURL',
            '$stateProvider',
            'RestangularProvider',
            '$translateProvider',
            function (apiURL, $stateProvider, RestangularProvider, $translateProvider) {
                $translateProvider.translations('pt_BR', messagesPtBr);
                $translateProvider.translations('en_US', messagesEnUs);
                $translateProvider.preferredLanguage('pt_BR');

                RestangularProvider.setBaseUrl(apiURL);
                RestangularProvider.setFullResponse(true);

                $stateProvider

                    .state('home', {
                        url: '/',
                        resolve: {
                            currentUser: ['SecurityService', '$state', function (SecurityService, $state) {
                                return SecurityService.requestCurrentUser()
                                    .then(function (currentUser) {
                                        if (currentUser.atLeastTeacher()) {
                                            $state.go('teacher-home');
                                        } else if (currentUser.isStudent()) {
                                            $state.go('student-home');
                                        } else {
                                            $state.go('unauthenticated-home');
                                        }
                                    });
                            }]
                        }

                    })

                    .state('unauthenticated-home', {
                        url: '/',
                        templateUrl: 'home/templates/unauthenticated-home.tpl.html',
                        controller: 'UnauthenticatedHomeController'
                    })

                    .state('login', {
                        templateUrl: 'home/templates/login.tpl.html',
                        params : { username: null },
                        controller: 'HomeLoginController',
                        resolve: {
                            currentUser: function ($state, SecurityService, $q) {
                                var deferred = $q.defer();
                                SecurityService.requestCurrentUser().then(function (response) {
                                    if (response.isAuthenticated()) {
                                        $state.go('home');
                                    }
                                    deferred.resolve(true);
                                }, function () {
                                    deferred.resolve(true);
                                });
                                return deferred.promise;
                            },
                            fail: function () {return false; }
                        }

                    })

                    .state('login-fail', {
                        params:{username:null,status:null},
                        templateUrl: 'home/templates/login.tpl.html',
                        controller: 'HomeLoginController',
                        resolve: {
                            currentUser: function ($state, SecurityService, $q) {
                                var deferred = $q.defer();
                                SecurityService.requestCurrentUser().then(function (response) {
                                    if (response.isAuthenticated()) {
                                        $state.go('home');
                                    }
                                    deferred.resolve(true);
                                }, function () {
                                    deferred.resolve(true);
                                });
                                return deferred.promise;
                            },
                            fail: function () {return true; }
                        }

                    })

                    .state('sign-in', {
                        url: '/signin',
                        templateUrl: 'home/templates/sign-in.tpl.html',
                        controller: 'HomeSignInController'
                    })

                    .state('retry-password', {
                        url: '/retry-password',
                        templateUrl: 'home/templates/retry-password.tpl.html',
                        controller: 'HomeRetryPasswordController'
                    })

                    .state('recover-password', {
                        url: '/recover-password?key',
                        templateUrl: 'home/templates/recover-password.tpl.html',
                        controller: 'HomeRecoverPasswordController',
                        resolve: {
                            key: function ($stateParams) {
                                return $stateParams.key;
                            },
                            currentUser: ['SecurityService', '$state', function (SecurityService, $state) {
                                return SecurityService.requestCurrentUser()
                                    .then(function (currentUser) {
                                        if (currentUser.isAuthenticated()) {
                                            $state.go('home');
                                        }
                                        return true;
                                    });
                            }]
                        }
                    })

                    .state('teacher-home', {
                        url: '/',
                        templateUrl: 'home/templates/teacher-home.tpl.html',
                        controller: 'HomeTeacherController',
                        resolve: {
                            currentUser: ['SecurityService', function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            }],

                            info: function ($q, UserService) {
                                var deferred = $q.defer(), deferred2 = $q.defer(), deferred3 = $q.defer();

                                UserService.listFailingStudents({ max: 4 }).then(function (response) {
                                    deferred.resolve(response.data);
                                });

                                var nowFmt = moment().format('YYYY-MM-DDTHH:mm:ssZ');
                                UserService.getCurrentUserGroups({max: 100, startDateLt: nowFmt, endDateGt: nowFmt }).then(function (response) {
                                    deferred2.resolve(response.data);
                                    deferred3.resolve(response.data.length);
                                });


                                return $q.all([deferred.promise, deferred2.promise, deferred3.promise]);
                            }
                        }

                    })

                    .state('teacher-student-home', {
                        url: '/',
                        templateUrl: 'home/templates/teacher-home.tpl.html',
                        controller: 'HomeTeacherController',
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },

                            info: ['$q', 'UserService', 'GroupService', function ($q, UserService, GroupService) {
                                var deferred = $q.defer(), deferred2 = $q.defer();



                                UserService.list({ max: 4 }).then(function (response) {
                                    deferred.resolve(response.data);
                                });

                                GroupService.list().then(function (response) {
                                    deferred2.resolve(response.data);
                                });

                                return $q.all([deferred.promise, deferred2.promise]);
                            }]
                        }

                    })

                    .state('student-home', {
                        url: '/',
                        templateUrl: 'home/templates/student-home.tpl.html',
                        controller: 'HomeStudentController',
                        resolve: {

                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },

                            info: ['$q', 'QuizService', 'ProblemService', function ($q, QuizService) {

                                var deferred = $q.defer(), deferred2 = $q.defer(), now = moment().format('YYYYMMDD');

                                //ProblemService.get(2).then(function (response) {
                                    deferred.resolve([]);
                                //});

                                QuizService.listUserScores({ max: 9, sort: 'endDate', endDateGe: now }).then(function (response) {
                                    deferred2.resolve(response.data);
                                });



                                return $q.all([deferred.promise, deferred2.promise]);
                            }]
                        }

                    })

                    .state('teacher-request', {
                        templateUrl: 'home/templates/teacher-request.tpl.html',
                        url: '/teacher',
                        controller: 'HomeRequestTeacherController',
                        resolve: {
                            currentUser: ['SecurityService', '$state', function (SecurityService, $state) {
                                return SecurityService.requestCurrentUser()
                                    .then(function (currentUser) {
                                        if (!currentUser.isAuthenticated()) {
                                            $state.go('not-found', null, { location: false });
                                        }
                                        return currentUser;
                                    });
                            }]
                        }
                    });
            }]);

}(module, angular));

require('./home-controllers');