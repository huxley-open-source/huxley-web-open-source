/*global module, require, angular */

require('angular-translate');

(function (module, angular) {
    'use strict';

    var messagesPtBr = require('./i18n/messages_pt_BR'),
        messagesEnUs = require('./i18n/messages_en_US'),
        securityModule = require('../security/security-module');

    module.exports = angular.module('thehuxley.help', [
        securityModule.name,
        'pascalprecht.translate',
        'ui.bootstrap'
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
                    .state('help', {
                        url: '/help',
                        templateUrl: 'help/templates/layout-help.tpl.html',
                        controller: 'HelpController',
                        controllerAs: 'vm'
                    })
                    .state('help.page', {
                        url: '/:page',
                        templateProvider: function ($stateParams, $templateCache) {
                            var pageName = $stateParams.page,
                                templateUrl = 'help/templates/pages/' + pageName + '.tpl.html',
                                template = $templateCache.get(templateUrl);
                            return template || $templateCache.get('help/templates/page-not-found.tpl.html');
                        }
                    });
            }]);

}(module, angular));

require('./help-controllers');