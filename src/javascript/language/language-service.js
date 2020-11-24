/*global require, angular*/

(function (require, angular) {
    'use strict';

    var languageApp = require('./language-app');

    angular.module(languageApp.name)

        .service('LanguageService', ['Restangular', function (Restangular) {
            this.list = function (params) {
                return Restangular.all('languages').getList(params);
            };

            this.get = function (id) {
                return Restangular.one('languages', id).get();
            };

            this.put = function (id, params) {
                return Restangular.one('languages', id).customPUT(params);
            };

            this.save = function (params) {
                return Restangular.all('languages').post(params);
            };

            this.remove = function (id) {
                return Restangular.one('languages', id).remove();
            };

        }]);

}(require, angular));