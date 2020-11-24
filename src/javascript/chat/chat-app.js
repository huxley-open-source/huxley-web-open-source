/*global module, require, angular, _*/

(function (module, angular) {
    'use strict';
    var messagesPtBr = require('./i18n/messages_pt_BR'),
        messagesEnUs = require('./i18n/messages_en_US'),
        userApp = require('../user/user-app'),
        securityModule = require('../security/security-module'),
        componentsModule = require('../components/components-module');

    var authenticatedUserResolver = function(SecurityService, $q, $state) {
        var deferred = $q.defer();
        SecurityService.requestCurrentUser().then(function (currentUser) {
            if (currentUser.isAuthenticated()) {
                deferred.resolve(currentUser);
            } else {
                $state.go('not-found', null, { location: false });
                deferred.reject();
            }
        });
        return deferred.promise;
    };

    module.exports = angular.module('thehuxley.chat', [
        securityModule.name,
        componentsModule.name,
        userApp.name,
        'thehuxley.templates',
        'pascalprecht.translate',
        'ngRoute',
        'ngResource',
        'ui.bootstrap',
        'ui.router',
        'angularMoment',
        'ui.bootstrap.tpls',
        'restangular',
        'ngSanitize',
        'luegg.directives'
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
                    .state('chat-list', {
                        url: '/chat?filter&id&offset&max',
                        controller: 'ChatListController',
                        controllerAs: 'chat',
                        templateUrl: 'chat/templates/chat-list.tpl.html',
                        reloadOnSearch : false,
                        params: {
                            'filter': undefined,
                            'id': undefined
                        },
                        resolve: {
                            currentUser: authenticatedUserResolver,

                            filterParams: function ($stateParams) {
                                var params = _.clone($stateParams, true);
                                if($stateParams.filter) {
                                    params.filter = $stateParams.filter;
                                }
                                if($stateParams.id) {
                                    params.id = $stateParams.id;
                                }

                                return params;
                            },

                            paginationData: function ($stateParams) {
                                return {
                                    currentPage: $stateParams.page ? parseInt($stateParams.page, 10) : 1,
                                    max: 10,
                                    offset: 0,
                                    maxSize: 5
                                };
                            }
                        }
                    })

                    .state('chat-list.chat-group-show', {
                        url: '/group/:id',
                        controller: 'ChatShowController',
                        templateUrl: 'chat/templates/chat-show.tpl.html',
                        resolve: {
                            groupUser: function (GroupService, $stateParams) {
                                return GroupService.get($stateParams.id);
                            },
                            chatUser: function () {}
                        }
                    })

                    .state('chat-list.chat-show', {
                        url: '/:id',
                        controller: 'ChatShowController',
                        controllerAs: 'vm',
                        templateUrl: 'chat/templates/chat-show.tpl.html',
                        resolve: {
                            currentUser: authenticatedUserResolver
                        }
                    })
                    .state('chat-message', {
                        url: '/chat/show/?messageGroup?submission',
                        controller: 'MessageShowController',
                        templateUrl: 'chat/templates/chat-message.tpl.html',
                        resolve: {
                            currentUser: authenticatedUserResolver
                        }
                    })
                    .state('chat-new-question', {
                        url: '/chat/question/:problem?group&submission',
                        controller: 'MessageShowController',
                        templateUrl: 'chat/templates/chat-message.tpl.html',
                        resolve: {
                            currentUser: authenticatedUserResolver
                        }
                    })
                    .state('chat-direct', {
                        url: '/chat/direct/:recipient',
                        controller: 'MessageShowController',
                        templateUrl: 'chat/templates/chat-message.tpl.html',
                        resolve: {
                            currentUser: authenticatedUserResolver
                        }
                    }).state('chat-report', {
                        url: '/chat/report/:problem',
                        controller: 'MessageShowController',
                        templateUrl: 'chat/templates/chat-message.tpl.html',
                        resolve: {
                            isReport: function($stateParams) {
                                $stateParams.isReport = true;
                                return true;
                            },
                            currentUser: authenticatedUserResolver
                        }
                    });
            }]);

}(module, angular));


require('./chat-controllers');
require('./chat-service');