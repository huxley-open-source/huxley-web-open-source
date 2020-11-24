/*global angular, require, _*/

(function (angular, require) {
    'use strict';

    var institutionApp = require('./institution-app');


    angular.module(institutionApp.name)

        .service('InstitutionService', ['Restangular', function (Restangular) {

            this.get = function (id) {
                return Restangular.one('institutions', id).get();
            };
            this.list = function (params) {
                return Restangular.all('institutions').getList(params);
            };
            this.getInstitution = function (id) {
                return Restangular.one('institutions', id).get();
            };
            this.listUserInstitutions = function (params) {
                return Restangular.one('user').all('institutions').getList(params);
            };
            this.getGroups = function (id, params) {
                return Restangular.one('institutions', id).all('groups').getList(params);
            };
            this.getUsers = function (id, params) {
                return Restangular.one('institutions', id).all('users').getList(params);
            };
            this.getStudents = function (id, params) {
                return Restangular.one('institutions', id).all('users').getList(_.assign(params, {role: 'STUDENT'}));
            };
            this.getTeachers = function (id, params) {
                return Restangular.one('institutions', id).all('users').getList(_.assign(params, {role: 'TEACHER'}));
            };
            this.getTeachersAssistants = function (id, params) {
                return Restangular.one('institutions', id).all('users').getList(_.assign(params, {role: 'TEACHER_ASSISTANT'}));
            };
            this.getAdmins = function (id, params) {
                return Restangular.one('institutions', id).all('users').getList(_.assign(params, {role: 'ADMIN_INST'}));
            };

            this.addUserToInstitution = function (institutionId, userId) {
                return Restangular.one('institutions', institutionId).one('users', userId).save();
            };

            this.addUsersToInstitution = function (institutionId, userList) {
                return Restangular.one('institutions', institutionId).one('users').all('add').post(userList);
            };

            this.removeUserFromInstitution = function (institutionId, userId) {
                return Restangular.one('institutions', institutionId).one('users', userId).remove();
            };

            this.put = function (id, params) {
                return Restangular.one('institutions', id).customPUT(params);
            };

            this.changeStatus = function(id, params) {
                return Restangular.one('institutions', id).one('changeStatus').customPUT(params);
            };

            this.save = function (params) {
                return Restangular.all('institutions').post(params);
            };

            this.sendImage = function (id, formData) {
                return Restangular.one('institutions', id).one('logo')
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPOST(formData, '', undefined, {'Content-Type': undefined});
            };

            this.cropImage = function (id, params) {
                return Restangular.one('institutions', id).one('logo').customPUT(params);
            };

            this.instValidate =  function (institution) {
                return Restangular.one('institutions').one('validate').customPOST(institution);
            };

        }]);


}(angular, require));