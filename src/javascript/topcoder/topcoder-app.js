/*global module, require, angular*/

(function (module, angular) {
    'use strict';

    var messagesPtBr = require('./i18n/messages_pt_BR'),
        messagesEnUs = require('./i18n/messages_en_US'),
        securityModule = require('../security/security-module'),
        componentsModule = require('../components/components-module');

    module.exports = angular.module('thehuxley.topcoder', [
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

                    .state('topcoder-show', {
                        url: '/topcoder',
                        templateUrl: 'topcoder/templates/topcoder-show.tpl.html',
                        controller: 'topcoderShowController',
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (!currentUser.isAuthenticated()) {
                                        return null;
                                    } else {
                                        return SecurityService.requestCurrentUser();
                                    }
                                });
                            }
                        }
                    });
            }
        ]);

}(module, angular));

require('./topcoder-controllers');