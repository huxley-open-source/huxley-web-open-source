/*global require, angular*/

(function (require, angular) {
    'use strict';

    var layoutApp = require('./layout-app');

    angular.module(layoutApp.name)

        .directive('title', ['$rootScope', '$timeout',
            function($rootScope, $timeout) {
                return {
                    link: function() {

                        var listener = function(event, toState, toParams, fromState) {

                            var currentState, nextState;

                            if(fromState.name.indexOf('.') === -1) {
                                currentState = fromState.name;
                            } else {
                                currentState = fromState.name.substring(0, fromState.name.indexOf('.'));
                            }

                            if(toState.name.indexOf('.') === -1) {
                                nextState = toState.name;
                            } else {
                                nextState = toState.name.substring(0, toState.name.indexOf('.'));
                            }

                            if(currentState !== nextState) {
                                $timeout(function() {
                                    $rootScope.title =
                                        (toState.data && toState.data.pageTitle) ? toState.data.pageTitle : 'The Huxley';
                                });
                            }
                        };

                        $rootScope.$on('$stateChangeSuccess', listener);
                    }
                };
            }
        ])

        .directive('resizable', function ($window) {
            return function ($scope) {
                $scope.initializeWindowSize = function() {
                    $scope.windowHeight = ($window.innerHeight - 580 - 104);
                };

                $scope.initializeWindowSize();

                return angular.element($window).bind('resize', function() {
                    $scope.initializeWindowSize();
                    return $scope.$apply();
                });
            };
        });

}(require, angular));
