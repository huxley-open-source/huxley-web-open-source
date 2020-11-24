/*global module, require, angular*/

(function (module, angular) {
    'use strict';

    var messagesPtBr = require('./i18n/messages_pt_BR'),
        messagesEnUs = require('./i18n/messages_en_US'),
        securityModule = require('../security/security-module'),
        componentsModule = require('../components/components-module');

    module.exports = angular.module('thehuxley.user', [
        securityModule.name,
        componentsModule.name,
        'pascalprecht.translate',
        'ui.router',
        'restangular',
        'nvd3'
    ])
        .config([
            'apiURL',
            '$stateProvider',
            'RestangularProvider',
            '$translateProvider',
            '$urlRouterProvider',
            function (apiURL, $stateProvider, RestangularProvider, $translateProvider) {

                RestangularProvider.setBaseUrl(apiURL);

                $translateProvider.translations('pt_BR', messagesPtBr);
                $translateProvider.translations('en_US', messagesEnUs);
                $translateProvider.preferredLanguage('pt_BR');

                RestangularProvider.setBaseUrl(apiURL);
                RestangularProvider.setFullResponse(true);

                $stateProvider

                    .state('profile-edit', {
                        url: '/profile/edit',
                        templateUrl: 'user/templates/profile-edit.tpl.html',
                        controller: 'ProfileEditController',
                        resolve: {
                            currentUser: function (SecurityService, $state) {
                                return SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (!currentUser.isAuthenticated()) {
                                        $state.go('profile-unauthenticated', {}, { location: false });
                                    } else {
                                        return SecurityService.requestCurrentUser();
                                    }
                                });
                            },
                            institutions: function (UserService) {
                                 return UserService.getCurrentUserInstitutions({});
                            }
                        }
                    })

                    .state('profile-edit-password', {
                        url: '/profile/edit/password',
                        templateUrl: 'user/templates/profile-edit-password.tpl.html',
                        controller: 'ProfileChangePasswordController',
                        resolve: {
                            currentUser: function (SecurityService, $state) {
                                return SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (!currentUser.isAuthenticated()) {
                                        $state.go('profile-unauthenticated', {}, { location: false });
                                    } else {
                                        return SecurityService.requestCurrentUser();
                                    }
                                });
                            }
                        }
                    })

                    .state('profile-show', {
                        url: '/profile/:id',
                        templateUrl: 'user/templates/profile-show.tpl.html',
                        controller: 'ProfileShowController',
                        abstract : true,
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },
                            profileUser: function (SecurityService, UserService, $stateParams) {
                                if ($stateParams.id) {
                                    return UserService.get($stateParams.id);
                                }

                                return SecurityService.requestCurrentUser();
                            }
                        }
                    })

                    .state('profile-show.quizzes', {
                        url: '/quizzes',
                        templateUrl: 'user/templates/profile-show-quizzes.tpl.html',
                        controller: 'ProfileShowQuizzesController'
                    })

                    .state('profile-show.problems', {
                        url: '',
                        templateUrl: 'user/templates/profile-show-problems.tpl.html',
                        controller: 'ProfileShowProblemController'
                    })

                    .state('profile-show.notifications', {
                        url: '/notifications',
                        templateUrl: 'user/templates/profile-show-notifications.tpl.html',
                        controller: 'ProfileShowNotificationsController'
                    })

                    .state('profile-show.groups', {
                        url: '/groups',
                        templateUrl: 'user/templates/profile-show-groups.tpl.html',
                        controller: 'ProfileShowGroupsController'
                    })

                    .state('profile-show.solved-by-topics', {
                        url: '/solved-by-topics',
                        templateUrl: 'user/templates/profile-show-solved-by-topics.tpl.html',
                        controller: 'ProfileShowSolvedByTopicsController'
                    })

                    .state('advanced-search', {
                        url: '/adsearch',
                        templateUrl: 'user/templates/ad-search.tpl.html',
                        controller: 'adSearchController'

                    })
                    .state('profile-unauthenticated', {
                        templateUrl: 'layout/templates/unauthenticated.tpl.html'
                    });
            }
        ]);

}(module, angular));

require('./user-service');
require('./user-directives');
require('./user-controllers');