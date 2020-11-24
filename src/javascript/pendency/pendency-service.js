/*global require, angular*/

(function (require, angular) {
    'use strict';

    var pendencyApp = require('./pendency-app');

    angular.module(pendencyApp.name)

        .service('PendencyService', ['Restangular', function (Restangular) {

            this.list = function (params) {
                return Restangular.all('pendencies').getList(params);
            };

            this.save = function (params) {
                return Restangular.all('pendencies').post(params);
            };

            this.put = function (id, params) {
                return Restangular.one('pendencies', id).customPUT(params);
            };

        }]);

}(require, angular));