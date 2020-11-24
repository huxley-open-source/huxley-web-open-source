/*global module, require, angular, _*/

(function (module, angular) {
    'use strict';

    var messagesPtBr = require('./i18n/messages_pt_BR'),
        messagesEnUs = require('./i18n/messages_en_US'),
        securityModule = require('../security/security-module'),
        componentsModule = require('../components/components-module');

    module.exports = angular.module('thehuxley.institution', [
        securityModule.name,
        componentsModule.name,
        'pascalprecht.translate',
        'ui.router',
        'restangular'
    ])
        .config([
            'apiURL',
            '$stateProvider',
            'RestangularProvider',
            '$translateProvider',
            function (apiURL, $stateProvider, RestangularProvider, $translateProvider) {

                RestangularProvider.setBaseUrl(apiURL);

                $translateProvider.translations('pt_BR', messagesPtBr);
                $translateProvider.translations('en_US', messagesEnUs);
                $translateProvider.preferredLanguage('pt_BR');

                RestangularProvider.setBaseUrl(apiURL);
                RestangularProvider.setFullResponse(true);
                $stateProvider.state('institution-list', {
                    url: '/institutions?q&sort&order&page&all',
                    templateUrl: 'institution/templates/institution-list-user.tpl.html',
                    controller: 'InstitutionListController',
                    reloadOnSearch: false,
                    resolve: {
                        currentUser: function (SecurityService) {
                            return SecurityService.requestCurrentUser();
                        },
                        canList: function (currentUser, $state) {
                            if (!currentUser.atLeastAdminInst()) {
                                $state.go('not-found', null, { location: false });
                            } else {
                                return true;
                            }
                        },
                        searchParams: function ($stateParams) {
                            var params = _.clone($stateParams, true);
                            if (params.sort === undefined) {
                                params.sort = 'name';
                            }
                            if (params.order === undefined) {
                                params.order = 'desc';
                            }
                            params.all = false;
                            return params;
                        },
                        paginationData: function ($stateParams) {
                            return {
                                currentPage: $stateParams.page ? parseInt($stateParams.page) : 1,
                                totalItems: $stateParams.page ? parseInt($stateParams.page) * 10 : 0,
                                itemsPerPage: 10,
                                offset: 0,
                                maxSize: 5
                            };
                        }
                    }
                });
            }
        ]);

}(module, angular));

require('./institution-service');
require('./institution-controllers');

