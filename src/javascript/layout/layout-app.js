/*global module, require, angular*/

require('angular-translate');

(function (module, angular) {
    'use strict';

    var messagesPtBr = require('./i18n/messages_pt_BR'),
        messagesEnUs = require('./i18n/messages_en_US'),
        securityModule = require('../security/security-module');

    module.exports = angular.module('thehuxley.layout', [
        securityModule.name,
        'pascalprecht.translate',
        'ui.router',
        'angularjs-facebook-sdk',
        'ngCookies'
    ])

        //.config(function facebookConfig (facebookConfigProvider) {
        //    facebookConfigProvider.setAppId(890507707661023);
        //    facebookConfigProvider.setLanguage('pt-BR');
        //    facebookConfigProvider.setDebug(false);
        //
        //    // When autoInit is setted to false you need to initialize
        //    // the facebookConfig service manually inside a run block.
        //    facebookConfigProvider.autoInit(true);
        //
        //    // Same: developers.facebook.com/docs/javascript/reference/FB.init/
        //    facebookConfigProvider.setOptions({
        //        status: true
        //    });
        //})

        .config(['$translateProvider', '$stateProvider', '$urlRouterProvider', function ($translateProvider, $stateProvider, $urlRouterProvider) {
            $translateProvider.translations('pt_BR', messagesPtBr);
            $translateProvider.translations('en_US', messagesEnUs);
            $translateProvider.preferredLanguage('pt_BR');

            $urlRouterProvider.otherwise(function ($injector, $location) {
                var state = $injector.get('$state');
                state.go('not-found', null, { location: false });
                return $location.path();
            });

            $stateProvider
                .state('layout-unauthenticated', {
                    url: '/unauthenticated',
                    templateUrl: 'layout/templates/unauthenticated.tpl.html'
                });

            $stateProvider
                .state('not-found', {
                    url: '/not-found',
                    templateUrl: 'layout/templates/not-found.tpl.html',
                    resolve: {
                        currentUser: function (SecurityService, $q, $state) {
                            var deferred = $q.defer();

                            SecurityService.requestCurrentUser().then(function (currentUser) {
                                if(!currentUser.isAuthenticated()) {
                                    $state.go('login', null, { location: false });
                                }
                                deferred.resolve(currentUser);

                            });

                            return deferred.promise;
                        }
                    }
                });

            $stateProvider
                .state('contact', {
                    url: '/contact',
                    templateUrl: 'layout/templates/contact.tpl.html',
                    controller: 'ContactController',
                    resolve: {
                        currentUser: function (SecurityService, $q, $state) {
                            var deferred = $q.defer();

                            SecurityService.requestCurrentUser().then(function (currentUser) {
                                if(!currentUser.isAuthenticated()) {
                                    $state.go('login', null, { location: false });
                                }
                                deferred.resolve(currentUser);

                            });

                            return deferred.promise;
                        }
                    }
                });
        }]);

}(module, angular));

require('./layout-controllers');
require('./layout-directives');
require('./layout-service');
require('./layout-factory');