/*global module, require, angular*/

(function (module, angular) {
    'use strict';

    var messagesPtBr = require('./i18n/messages_pt_BR'),
        messagesEnUs = require('./i18n/messages_en_US'),
        securityModule = require('../security/security-module'),
        componentsModule = require('../components/components-module');

    module.exports = angular.module('thehuxley.language', [
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

            }
        ]);

}(module, angular));

require('./language-controllers');
require('./language-service');