/*global angular, require*/

(function (angular, require) {
    'use strict';

    var userApp = require('./user-app'),
        _ = require('lodash');

    angular.module(userApp.name)
        .service('UserService', ['Restangular', function (Restangular) {

            this.get = function (id) {
                return Restangular.one('users', id).get();
            };

            this.list = function (params) {
                return Restangular.all('users').getList(params);
            };

            this.validate = function (user) {
                return Restangular.all('users').all('validate').post(user);
            };

            this.create = function (user) {
                return Restangular.all('users').post(user);
            };

            this.requestChangePassword = function (params) {
                return Restangular.all('users').all('recoveryPassword').post(params);
            };

            this.changePassword = function (params) {
                var passwordUpdated = Restangular.all('users').one('password', params.key);
                _.assign(passwordUpdated, params);
                return passwordUpdated.put();
            };

            this.update = function (user) {
                var userUpdated = Restangular.one('users', user.id);
                _.assign(userUpdated, user);
                return userUpdated.put();
            };

            this.getUserGroups = function (userId, params) {
                return Restangular.one('users', userId).getList('groups', params);
            };

            this.getCurrentUserGroups = function (params) {
                return Restangular.one('user').getList('groups', params);
            };

            this.getCurrentUserInstitutions = function (params) {
                return Restangular.one('user').getList('institutions', params);
            };

            this.getAttemptedProblems = function (userId, params) {
                return Restangular.one('users', userId).getList('problems', _.assign((params || {}), {filter: 'attempted'}));
            };

            this.getProfileUser = function (id) {
                return Restangular.one('submissions').one('user', id).one('stats').get();
            };

            this.getUser = function () {
                return Restangular.one('user').get();
            };

            this.put = function (params) {
                return Restangular.one('user').customPUT(params);
            };

            this.putPassword = function (params) {
                return Restangular.one('user').one('password').customPUT(params);
            };

            this.userValidate =  function (user) {
                return Restangular.one('users').one('validate').customPOST(user);
            };

            this.sendImage = function (formData) {
                return Restangular.one('user').one('avatar')
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPOST(formData, '', undefined, {'Content-Type': undefined});
            };

            this.cropImage = function (params) {
                return Restangular.one('user').one('avatar').customPUT(params);
            };

            this.register = function (user) {
                return Restangular.one('users').customPOST(user);
            };

            this.getTopCoders = function (params) {
                return Restangular.all('topcoders').getList(params);
            };

            this.getNotificationPreferences = function() {
                return Restangular.one('user').one('notification').one('preferences').get();
            };

            this.saveNotificationPreferences = function(params) {
                return Restangular.one('user').one('notification').one('preferences').customPOST(params);
            };

            this.listFailingStudents = function() {
                return Restangular.one('user').one('failingStudents').get();
            };

            this.availableLanguages = function() {
                return {
                    'pt_BR' : 'user.languages.ptBR',
                    'en_US' : 'user.languages.enUS'
                };
            };

            this.updateLanguage = function (params) {
                return Restangular.one('user').one('updateLocale').customPUT(params);
            };

        }]);


}(angular, require));