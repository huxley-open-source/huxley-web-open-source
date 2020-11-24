/*global require, angular, moment*/

(function (require, angular) {
    'use strict';

    var layoutApp = require('./layout-app');

    angular.module(layoutApp.name)

        .controller('LayoutController', [
            '$scope',
            'apiURL',
            '$cookies',
            'authCookieName',
            'NotificationService',
            'SecurityService',
            '$http',
            function ($scope, apiURL) {

                $scope.apiURL = apiURL;
                $scope.layoutNotificationList = [];

                try {
                    // var socket = atmosphere, request = new atmosphere.AtmosphereRequest();

                    // request = {
                    //     url: 'http://dev.thehuxley.com/push/pull',
                    //     contentType: 'application/json',
                    //     transport: 'websocket',
                    //     fallbackTransport: 'long-polling',
                    //     trackMessageLength: true,
                    //     maxReconnectOnClose: 3600,
                    //     reconnectInterval: 5000
                    // };

                    // request.onOpen = function (response) {
                    //     if ($scope.currentUser.isAuthenticated()) {
                    //         console.log(response.request.uuid);
                    //         $http.post('http://www.thehuxley.com:8082/push/notifications/register', { uuid: response.request.uuid });
                    //     }
                    // };
                    // request.onMessage = function (response) {
                    //     var responseParsed = response.responseBody;
                    //     if (responseParsed !== 'X') {
                    //         responseParsed = JSON.parse(response.responseBody);
                    //     } else {
                    //         responseParsed = {};
                    //     }
                    //     if (responseParsed.type) {
                    //         if (responseParsed.type !== 'USER_CHAT_MESSAGE') {
                    //             $scope.layoutNotificationList.unshift(responseParsed);
                    //         }
                    //         if ($scope.layoutNotificationList.length > 21) {
                    //             $scope.layoutNotificationList.pop();
                    //         }
                    //         $scope.$broadcast(responseParsed.type, responseParsed);
                    //     }

                    // };

                    // request.onError = function (response) {
                    //     console.log('error');
                    //     console.log(response);
                    // };

                    // SecurityService.requestCurrentUser().then(function (response){
                    //     $scope.currentUser = response;

                    //     socket.subscribe(request);

                    //     if ($scope.currentUser.isAuthenticated()) {
                    //         $scope.updateNotificationList();
                    //     }
                    // });

                    // $scope.updateNotificationList = function () {
                    //     var max = 10 - $scope.layoutNotificationList.length, newNotifications;
                    //     if (max > 0 && $scope.currentUser && $scope.currentUser.isAuthenticated()) {
                    //         NotificationService.listUserNotifications({max: max}).then(function (response) {
                    //             newNotifications = response.data;
                    //             for (max = newNotifications.length - 1; max >= 0; max--) {
                    //                 $scope.layoutNotificationList.push(newNotifications[max]);
                    //                 $scope.$broadcast(newNotifications[max].type, newNotifications[max]);
                    //             }

                    //         });


                    //     }
                    // };

                } catch(err) {
                    console.log(err);
                }
            }])

        .controller('HeaderController', [
            '$scope',
            'SecurityService',
            'UserService',
            'ProblemService',
            'GroupService',
            '$timeout',
            'apiURL',
            '$state',
            '$window',
            '$q',
            'ChatService',
            'InstitutionService',
            '$interval',
            '$translate',
            '$cookies',
            function ($scope, SecurityService, UserService, ProblemService, GroupService, $timeout, apiURL, $state, $window, $q, ChatService, InstitutionService, $interval, $translate, $cookies) {
                var delay = (function () {
                    var timer = 0;
                    return function (callback, ms) {
                        clearTimeout(timer);
                        timer = setTimeout(callback, ms);
                    };
                }()),
                updateUnreadMessages = function () {
                    if ($scope.currentUser && $scope.currentUser.isAuthenticated()) {

                        var fetchMessagesCount = function() {
                            ChatService.getMessagesCount().then(function (response) {
                                $scope.unReadMessages = response.data.unreadCount;
                            });
                        };

                        fetchMessagesCount();
                        $interval(fetchMessagesCount, 120 * 1000);
                    }

                };

                $scope.problemsCount = {
                    total: 0,
                    languages: {}
                };

                $scope.getProblemsCount = function () {
                    ProblemService.getProblemsCount().then(function (resp) {
                        var aux = resp.data;
                        aux.forEach(function (n) {
                            //jshint camelcase: false
                            n.locale = n.locale.replace('_', '');
                            if($scope.problemsCount.languages[n.locale] === undefined) {
                                $scope.problemsCount.languages[n.locale] = {
                                    total: 0
                                };
                            }
                            if(n.problem_type === 'SINGLE_CHOICE' || n.problem_type === 'MULTIPLE_CHOICE' || n.problem_type === 'TRUE_OR_FALSE') {
                                $scope.problemsCount.languages[n.locale].CHOICES = n.count;
                            } else {
                                $scope.problemsCount.languages[n.locale][n.problem_type] = n.count;
                            }
                            $scope.problemsCount.languages[n.locale].total = $scope.problemsCount.languages[n.locale].total + n.count;
                            $scope.problemsCount.total = $scope.problemsCount.total + n.count;
                        });
                    });
                };

                $scope.getProblemsCount();

                $scope.selected = {
                    language: {}
                };

                $scope.languages = {
                    'pt_BR' : 'user.languages.ptBR',
                    'en_US' : 'user.languages.enUS'
                };

                $scope.changeLanguage = function (key) {
                    if($scope.languages[key] !== undefined) {
                        $cookies.put('locale', key);
                    } else {
                        $cookies.put('locale', 'pt_BR');
                    }

                    moment.lang($cookies.get('locale'));
                    $window.location.reload();
                };

                $scope.saveChangedLanguage = function (key) {
                    UserService.updateLanguage({locale: key}).then(function () {
                        $window.location.reload();
                    });
                };



                $scope.defaultLanguage = function () {
                    var lang = $cookies.get('locale') || $window.navigator.language || $window.navigator.userLanguage;
                    lang = lang.replace('-', '_');
                    if($scope.languages[lang] !== undefined) {
                        $translate.use(lang);
                        $cookies.put('locale', lang);
                        moment.lang($cookies.get('lang'));
                    } else {
                        $translate.use('pt_BR');
                        $cookies.put('locale', 'pt_BR');
                    }
                };

                $scope.defaultLanguage();

                SecurityService.requestCurrentUser().then(function (response){
                    $scope.currentUser = response;
                    if ($scope.currentUser.isAuthenticated()) {
                        updateUnreadMessages();
                        $scope.header.template = 'layout/templates/th-header.tpl.html';
                        $translate.use($scope.currentUser.locale);
                        $cookies.put('locale', $scope.currentUser.locale);
                        moment.lang($scope.currentUser.locale);
                    }
                });

                $scope.unReadMessages = 0;

                $scope.apiURL = apiURL;
                $scope.searchDropdown = {
                    isOpen1: false,
                    isOpen2: false
                };
                $scope.scrolled = false;
                $scope.header = {};
                $scope.header.template = 'layout/templates/th-header-unauthenticated.tpl.html';
                $scope.auth = {};
                $scope.logout = function () {
                    SecurityService.logout();
                };

                $scope.$loadingLogin = false;
                $scope.quickLogin = function (params) { SecurityService.login(params); };
                $scope.login = function () {
                    $scope.$loadingLogin = true;
                    SecurityService.login($scope.auth, function (response) {
                        $scope.$loadingLogin = false;
                        $state.go('login-fail', {username: $scope.auth.username, status: response.status});
                    });
                };

                $scope.$on('CHAT_MESSAGES_RECOUNT', function () {
                    updateUnreadMessages();
                });

                $scope.$on('USER_CHAT_MESSAGE', function () {
                    updateUnreadMessages();
                });

                $scope.searchParams = {
                    q : '',
                    max : 5
                };

                angular.element($window).on('scroll', function () {
                    if($window.scrollY >= 135) {
                        $scope.scrolled = true;
                    }
                    else {
                        $scope.scrolled = false;
                    }
                    $scope.$apply();
                });


                $scope.disableDropdown = function ($event) {
                    $event.stopPropagation();
                };
                $scope.search = function (open) {
                    if ($scope.searchParams.q !== '') {
                        delay(function (){
                            var deferred = $q.defer(), deferred2 = $q.defer(), deferred3 = $q.defer(), deferred4 = $q.defer();
                            UserService.list({
                                q : $scope.searchParams.q,
                                max: $scope.searchParams.max
                            }).then(function (response) {
                                deferred.resolve('');
                                $scope.users = response.data;
                            });

                            ProblemService.list({
                                q : $scope.searchParams.q,
                                max: $scope.searchParams.max
                            }).then(function (response) {
                                deferred2.resolve('');
                                $scope.problems = response.data;
                            });

                            GroupService.list({
                                q : $scope.searchParams.q,
                                max: $scope.searchParams.max
                            }).then(function (response) {
                                deferred3.resolve('');
                                $scope.groups = response.data;
                            });

                            InstitutionService.list({
                                q : $scope.searchParams.q,
                                max: $scope.searchParams.max
                            }).then(function (response) {
                                deferred4.resolve('');
                                $scope.institutions = response.data;
                            });
                            $q.all([deferred.promise, deferred2.promise, deferred3.promise, deferred4.promise]).then(function () {
                                $scope.searchDropdown[open] = true;
                            });
                        },500);

                    } else {
                        $scope.searchDropdown[open] = false;
                    }
                };

            }])
        .controller('ContactController', [
            '$scope',
            'currentUser',
            'LayoutService',
            function ($scope, currentUser, LayoutService) {
                $scope.form = {
                    subject: '',
                    body: ''
                };
                $scope.sent = false;
                $scope.currentUser = currentUser;
                $scope.submitForm = function () {
                    LayoutService.sendEmail($scope.form).then(function () {
                        $scope.sent = true;
                    });
                };
            }]);

}(require, angular));