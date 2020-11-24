/*global require, angular*/

(function (require, angular) {
    'use strict';

    var groupApp = require('./group-app');

    angular.module(groupApp.name)

        .service('GroupService', ['apiURL', '$resource', 'Restangular', function (apiURL, $resource, Restangular) {

            this.get = function (id, params) {
                return Restangular.one('groups', id).withHttpConfig({ transformResponse: function(data) {
                    var resp =  JSON.parse(data);
                    if (resp.group) {
                        resp.group.teacherAssistants = resp.teacherAssistants;
                        resp.group.teachers = resp.teachers;
                        resp.group.role = resp.role;
                    }

                    return resp.group;
                }}).get(params);
            };

            this.getGroupStats = function (id, params) {
                return Restangular.one('groups', id).one('stats').get(params);
            };

            this.getUsersStats = function(groupId) {
                return Restangular.one('submissions').one('group', groupId).one('stats').get({ excludeTopics: true });
            };

            this.getGroupThermometer = function(groupId) {
                return Restangular.one('submissions').one('group', groupId).one('thermometer').get({ excludeTopics: true });
            };

            this.list = function (params) {
                return Restangular.all('groups').getList(params);
            };

            this.listStudents = function (id, params) {
                return Restangular.one('groups', id).all('users').getList(params);
            };

            this.validate = function (group) {
                return Restangular.one('groups').all('validate').post(group);
            };

            //this.update = function (group) {
            //    var groupUpdated = Restangular.one('groups', group.id);
            //    _.assign(groupUpdated, group);
            //    return groupUpdated.put();
            //};

            this.update = function (group) {
                return Restangular.one('groups', group.id).customPUT(group);
            };

            this.create = function (group) {
                return Restangular.all('groups').post(group);
            };

            this.findGroupByKey = function (key) {
                return Restangular.one('groups').one('key', key).get();
            };

            this.joinGroupByKey = function (key) {
                return Restangular.one('groups').one('join', key).customPUT();
            };

            this.generateKeyByGroup = function (id) {
                return Restangular.one('groups', id).customPOST({}, 'generateAccessKey');
            };

            this.getKey = function (id) {
                return Restangular.one('groups', id).one('key').get();
            };

            this.regenerateKey = function (id) {
                return Restangular.one('groups', id).one('key').customPUT();
            };

            this.addUserToGroup = function (groupId, userId, params) {
                return Restangular.one('groups', groupId).one('users', userId).save(params);
            };

            this.addUsersToGroup = function (groupId, userList) {
                return Restangular.one('groups', groupId).one('users').all('add').post(userList);
            };

            this.removeUserFromGroup = function (groupId, userId) {
                return Restangular.one('groups', groupId).one('users', userId).remove();
            };

            this.getQuestionnaires = function (groupId, params) {
                return Restangular.one('groups', groupId).getList('quizzes', params);
            };

            this.getSubmissions = function (groupId, params) {
                return Restangular.one('groups', groupId).getList('submissions', params);
            };

            this.getUserList = function (groupId, params) {
                return Restangular.one('groups', groupId).getList('users', params);
            };

            this.getStats = function (groupId) {
                return Restangular.one('groups', groupId).one('stats').get();
            };

            this.exportQuizzes = function(groupId) {
                return Restangular.one('groups', groupId).one('quiz').one('export').withHttpConfig({responseType: 'blob'}).get();
            };

        }]);

}(require, angular));