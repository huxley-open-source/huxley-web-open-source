/*global module, require, angular*/

(function (module, angular) {
    'use strict';

    module.exports = angular.module('thehuxley.security', ['ngRoute', 'ngCookies'])

        .constant('authCookieName', 'tha')

        .factory('authInterceptor', [
            '$q',
            '$cookies',
            'authCookieName',
            '$window',
            '$log',
            '$injector',
            function ($q, $cookies, authCookieName, $window, $log, $injector) {
                return {
                    request: function (config) {
                        config.headers = config.headers || {};
                        if ($cookies.get(authCookieName)) {
                            config.headers.Authorization = 'Bearer ' + $cookies.get(authCookieName);
                        }

                        return config;
                    },

                    responseError: function (response) {
                        if (response.status === 401 && $cookies.get(authCookieName)) {
                            $log.debug('security cookie exists but the server responded with a status of 401 (Unauthorized)');
                            $injector.get('$state').go('quiz-unauthenticated', {}, {location: false});
                            $injector.get('$window').location.reload();
                            //$cookies.remove(authCookieName);
                        }

                        return $q.reject(response);
                    }
                };
            }
        ])

        .config([
            '$httpProvider',
            function ($httpProvider) {
                $httpProvider.defaults.withCredentials = false;
                $httpProvider.interceptors.push('authInterceptor');
            }
        ]);

}(module, angular));

require('./security-service');
