/*global require, angular*/

(function (require, angular) {
    'use strict';

    var notificationApp = require('./notification-app');

    angular.module(notificationApp.name)

        .service('NotificationService', ['Restangular', function (Restangular) {

            this.listUserNotifications = function (params) {
                return Restangular.one('user').all('feed').getList(params);
            };

        }]);

}(require, angular));