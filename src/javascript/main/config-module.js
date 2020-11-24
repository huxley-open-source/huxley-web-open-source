/*global module, angular*/

(function (module, angular) {
    'use strict';

    var th = window.th || {};

    module.exports = angular.module('thehuxley.config', [])

        .constant('apiURL', th.apiRootPath)
        .constant('oauthURL', th.oauthRootPath)

        .config(['$locationProvider', '$logProvider', function ($locationProvider, $logProvider) {

            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });

            $logProvider.debugEnabled(th.debugEnabled);
        }]);

}(module, angular));