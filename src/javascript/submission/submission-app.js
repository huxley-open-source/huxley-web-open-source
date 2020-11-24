/*global module, require, angular, _*/

(function (module, angular) {
    'use strict';
    var messagesPtBr = require('./i18n/messages_pt_BR'),
        messagesEnUs = require('./i18n/messages_en_US'),
        userApp = require('../user/user-app'),
        securityModule = require('../security/security-module'),
        componentsModule = require('../components/components-module');

    module.exports = angular.module('thehuxley.submission', [
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
        'restangular'
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
                    .state('submission-list', {
                        url: '/submissions?sort&order&submissionGe&submissionLe&evaluation&problem&page&user',
                        templateUrl: 'submission/templates/submission-list.tpl.html',
                        controller: 'SubmissionListController',
                        reloadOnSearch: false,
                        resolve: {
                            currentUser: function (SecurityService, $state, $stateParams, $location) {
                                return SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (!currentUser.isAuthenticated()) {
                                        $location.path($state.href('submission-list')).search($stateParams);
                                        $state.go('submission-unauthenticated', {}, { location: false });
                                    } else {
                                        return SecurityService.requestCurrentUser();
                                    }
                                });
                            },

                            searchParams: function ($q, $stateParams, ProblemService, UserService) {
                                var deferred = $q.defer(), deferred2 = $q.defer(),
                                    params = _.clone($stateParams, true);

                                if (!params.sort) {
                                    params.sort = 'submissionDate';
                                }

                                if (!params.order) {
                                    params.order = 'desc';
                                }

                                params.problem = [];
                                if (params.problem && params.problem.length > 0) {
                                    ProblemService.get($stateParams.problem).then( function (response) {
                                        params.problem.push(response.data);
                                        deferred.resolve(params);
                                    });
                                } else {
                                    deferred.resolve(params);
                                }
                                if ($stateParams.user) {
                                    UserService.get($stateParams.user).then(function (response) {
                                        deferred2.resolve(response.data);
                                    });

                                } else {
                                    deferred2.resolve([]);
                                }

                                return $q.all([deferred.promise, deferred2.promise]);
                            },

                            paginationData: function ($stateParams) {
                                return {
                                    currentPage: $stateParams.page ? parseInt($stateParams.page, 10) : 1,
                                    totalItems: $stateParams.page ? parseInt($stateParams.page, 10) * 10 : 0,
                                    itemsPerPage: 10,
                                    offset: 0,
                                    maxSize: 5
                                };
                            }
                        }
                    })
                    .state('submission-unauthenticated', {
                        templateUrl: 'layout/templates/unauthenticated.tpl.html'
                    });
            }]);

}(module, angular));

require('./submission-service');
require('./submission-controllers');
require('./submission-directives');