/*global require, angular*/

(function (require, angular) {
    'use strict';

    var userApp = require('./user-app');

    angular.module(userApp.name)
        .directive('thProfileHead', function () {
            return {
                restrict: 'E',
                templateUrl: 'user/templates/profile-head.tpl.html',
            };
        })
        .directive('thUserLink', function () {
            return {
                restrict: 'E',
                scope: {
                    user: '=?user'
                },
                templateUrl: 'user/templates/user-link.tpl.html'
            };
        })
        .directive('thUserBox', function () {
            return {
                restrict: 'E',
                scope: {
                    user: '=?user',
                    similarityDecorator : '=?similarityDecorator',
                    time: '=?time',
                    noLinks: '=?noLinks',
                    submission: '=?submission',
                    noInstitution: '=?noInstitution'
                },
                templateUrl: 'user/templates/user-box.tpl.html'
            };
        });

}(require, angular));