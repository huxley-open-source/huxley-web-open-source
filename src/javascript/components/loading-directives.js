/*global module, angular, require*/

(function (module, angular) {
    'use strict';

    var componentsApp = require('./components-module');

    angular.module(componentsApp.name)
        .directive('isLoading', [
            function () {

                function linkFn(scope, element, attrs) {

                    function onIsLoading() {
                        element.addClass('loading-bar-on');
                        element.attr('disabled', true);
                    }

                    function offIsLoading() {
                        element.removeClass('loading-bar-on');
                        element.attr('disabled', false);
                    }

                    scope.$watch(attrs.isLoading, function (isLoading) {
                        if (isLoading === true) {
                            onIsLoading();
                        } else {
                            offIsLoading();
                        }
                    });
                }

                return {
                    strict: 'A',
                    link: linkFn,
                    scope: true
                };
            }]);

}(module, angular));