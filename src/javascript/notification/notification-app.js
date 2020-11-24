/*global module, require, angular*/

(function (module, angular) {
    'use strict';

    module.exports = angular.module('thehuxley.notification', [
        'ngResource',
        'restangular'
    ])
        .config([
            'apiURL',
            'RestangularProvider',
            function (apiURL, RestangularProvider) {
                RestangularProvider.setBaseUrl(apiURL);
                RestangularProvider.setFullResponse(true);

            }]);

}(module, angular));

require('./notification-service');
