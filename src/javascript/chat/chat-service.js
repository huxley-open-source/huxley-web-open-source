/*global require, angular*/

(function (require, angular) {
    'use strict';

    var chatApp = require('./chat-app');

    angular.module(chatApp.name)
        .factory('Chat', [
            '$resource',
            'apiURL',
            function ($resource, apiURL) {
                var Chat = $resource(apiURL + '/user/messages/:id', { id: '@id' }, {
                    responseMessage: {
                        method: 'post',
                        url: apiURL + '/user/messages/:id/response'
                    },
                    sendMessage: {
                        method: 'post'
                    },
                    markAsRead: {
                        method: 'post',
                        url: apiURL + '/user/messages/:id/read'
                    }
                });

                return Chat;
            }
        ])

        .service('ChatService', ['Restangular', function (Restangular) {
            this.list = function (params) {
                return Restangular.one('user').getList('messages', params);
            };

            this.get = function (id) {
                return Restangular.one('user').one('messages',id).get();
            };

            this.sendMessage = function (params) {
                return Restangular.one('user').one('messages').customPOST(params);
            };

            this.responseMessage = function (id, params) {
                return Restangular.one('user').one('messages', id).one('response').customPOST(params);
            };

            this.markAsRead = function (id) {
                return Restangular.one('user').one('messages', id).one('read').customPOST();
            };

            this.getMessagesCount = function () {
                return Restangular.one('user').one('messages').one('count').customPOST();
            };

        }])
        .service('MessageService', ['Restangular', function (Restangular) {
            this.list = function (params) {
                return Restangular.one('user').one('messages').get(params);
            };

            this.get = function (id) {
                return Restangular.one('user').one('messages', id).get();
            };

            this.save = function (params) {
                return Restangular.one('user').all('messages').post(params);
            };

            this.remove = function (id) {
                return Restangular.one('user').one('messages', id).remove();
            };

            this.stats = function() {
                return Restangular.one('user').one('messages').one('stats').get();
            };

            this.status = function(id, status) {
                return Restangular.one('user').one('messages').one('status').customPOST({ id: id, status: status });
            };

            this.archiveOld = function(days) {
                return Restangular.one('user').one('messages').one('archive').customPOST({ days: days });
            };

        }]);

}(require, angular));