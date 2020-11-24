/*global require, angular*/

(function (require, angular) {
    'use strict';

    var layoutApp = require('./layout-app');

    angular.module(layoutApp.name)
        .factory('Page', function($rootScope){
            $rootScope.title = 'The Huxley';
            return {
                title: function() {
                    return $rootScope.title;
                },
                setTitle: function(newTitle) {
                    $rootScope.title = newTitle;
                }
            };
        });
} (require, angular));