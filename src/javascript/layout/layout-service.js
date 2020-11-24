/*global angular, require*/

(function (angular, require) {
    'use strict';

    var institutionApp = require('./layout-app');


    angular.module(institutionApp.name)

        .service('LayoutService', ['Restangular', function (Restangular) {

            this.sendEmail = function (params) {
                return Restangular.one('user').one('contact').customPOST(params);
            };
        }]);


}(angular, require));