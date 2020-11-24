/*global require, angular*/

(function (require, angular) {
    'use strict';

    var securityModule = require('./security-module'),
        _ = require('lodash'),
        // $ = require('jquery'),
        moment = require('moment');

    angular.module(securityModule.name)

        .service('SecurityService', [
            'apiURL',
            'oauthURL',
            '$q',
            '$http',
            '$window',
            '$cookies',
            'authCookieName',
            '$log',
            '$state',
            function (apiURL, oauthURL, $q, $http, $window, $cookies, authCookieName, $log, $state) {

                var isAuthenticated,
                    getCurrentUser,
                    requestCurrentUser,
                    requestToken,
                    login,
                    logout,
                    // clean,
                    hasRole,
                    currentUser = null,
                    ACCESS_TOKEN_FIELD = 'access_token',
                    CURRENT_USER_URL = '/user',
                    LOGIN_URL = '/login',
                    // LOGOUT_URL = '/logout',
                    COOKIE_EXPIRES = 30, //days
                    USER_ROLES = {
                        ADMIN: 'ROLE_ADMIN',
                        ADMIN_INST: 'ROLE_ADMIN_INST',
                        TEACHER: 'ROLE_TEACHER',
                        TEACHER_ASSISTANT: 'ROLE_TEACHER_ASSISTANT',
                        STUDENT: 'ROLE_STUDENT',
                        TRANSLATOR: 'ROLE_TRANSLATOR'
                    },
                    ENTITY_ROLE = {
                        ADMIN_INST: 'ADMIN_INST',
                        TEACHER: 'TEACHER',
                        TEACHER_ASSISTANT: 'TEACHER_ASSISTANT',
                        STUDENT: 'STUDENT'
                    };

                isAuthenticated = function () {
                    return !!currentUser;
                };

                hasRole = function (roles, role, map) {
                    if (map) {
                        return _.contains(_.map(roles, map), role);
                    }
                    return _.contains(roles, role);
                };

                getCurrentUser = function () {
                    return _.assign((currentUser || {}), {
                        isAuthenticated: isAuthenticated,

                        atLeastAdmin: function () {
                            return isAuthenticated() &&
                                hasRole(currentUser.roles, USER_ROLES.ADMIN, function (role) { return role.authority; });
                        },

                        atLeastAdminInst: function (instance) {
                            if (instance) {
                                return isAuthenticated() &&
                                    (hasRole(instance.roles, ENTITY_ROLE.ADMIN_INST) ||
                                    (instance.institution ? instance.institution.role === ENTITY_ROLE.ADMIN_INST : instance.role === ENTITY_ROLE.ADMIN_INST) ||
                                    this.atLeastAdmin());
                            }
                            return isAuthenticated() &&
                                (hasRole(currentUser.roles, USER_ROLES.ADMIN_INST, function (role) {
                                    return role.authority;
                                }) || this.atLeastAdmin());
                        },

                        atLeastTeacher: function (instance) {
                            if (instance) {
                                return isAuthenticated() &&
                                    (instance.role === ENTITY_ROLE.TEACHER || this.atLeastAdminInst(instance));
                            }
                            return isAuthenticated() &&
                                (hasRole(currentUser.roles, USER_ROLES.TEACHER, function (role) {
                                    return role.authority;
                                }) || this.atLeastAdminInst());
                        },

                        isTranslator: function () {
                            return isAuthenticated() &&
                                (hasRole(currentUser.roles, USER_ROLES.TRANSLATOR, function (role) {
                                    return role.authority;
                                }));
                        },

                        atLeastTeacherAssistant: function (instance) {
                            if (instance) {
                                return isAuthenticated() &&
                                    (instance.role === ENTITY_ROLE.TEACHER_ASSISTANT || this.atLeastTeacher(instance));
                            }
                            return isAuthenticated() &&
                                (hasRole(currentUser.roles, USER_ROLES.TEACHER_ASSISTANT, function (role) {
                                    return role.authority;
                                }) || this.atLeastTeacher());
                        },

                        atLeastStudent: function (instance) {
                            if (instance) {
                                return isAuthenticated() &&
                                    (instance.role === ENTITY_ROLE.STUDENT || this.atLeastTeacherAssistant(instance));
                            }
                            return isAuthenticated() &&
                                (hasRole(currentUser.roles, USER_ROLES.STUDENT, function (role) {
                                    return role.authority;
                                }) || this.atLeastTeacherAssistant());
                        },

                        isAdminInst: function (instance) {
                            if (instance) {
                                return isAuthenticated() &&
                                    ((instance.role === ENTITY_ROLE.ADMIN_INST) ||
                                    (instance.institution ? instance.institution.role === ENTITY_ROLE.ADMIN_INST : false));
                            }
                            return isAuthenticated() &&
                                hasRole(currentUser.roles, USER_ROLES.ADMIN_INST, function (role) {
                                    return role.authority;
                                });
                        },

                        isTeacher: function (instance) {
                            if (instance) {
                                return isAuthenticated() &&
                                    (instance.role === ENTITY_ROLE.TEACHER);
                            }
                            return isAuthenticated() &&
                                hasRole(currentUser.roles, USER_ROLES.TEACHER, function (role) {
                                    return role.authority;
                                });
                        },

                        isTeacherAssistant: function (instance) {
                            if (instance) {
                                return isAuthenticated() &&
                                    (instance.role === ENTITY_ROLE.TEACHER_ASSISTANT);
                            }
                            return isAuthenticated() &&
                                hasRole(currentUser.roles, USER_ROLES.TEACHER_ASSISTANT, function (role) {
                                    return role.authority;
                                });
                        },

                        isStudent: function (instance) {
                            if (instance) {
                                return isAuthenticated() &&
                                    (instance.role === ENTITY_ROLE.STUDENT);
                            }
                            return isAuthenticated() &&
                                hasRole(currentUser.roles, USER_ROLES.STUDENT, function (role) {
                                    return role.authority;
                                });
                        },

                        getLocale: function() {
                            if (isAuthenticated()) {
                                return currentUser.locale;
                            }

                            return $cookies.get('locale') || $window.navigator.language || $window.navigator.userLanguage;
                        }
                    });
                };

                requestCurrentUser = function (options) {

                    var defaults = {
                            failOnError: false,
                            serverCheck: false
                        },

                        deferred = $q.defer();

                    options = options || defaults;

                    if (isAuthenticated()) {
                        if (!$cookies.get(authCookieName)) {
                            $log.debug('currentUser variable is authenticated but security cookie not exist');
                            $window.location.reload();
                        }
                        return $q.when(getCurrentUser());
                    }

                    if (!options.serverCheck && !$cookies.get(authCookieName)) {
                        return $q.when(getCurrentUser());
                    }

                    $http.get(apiURL + CURRENT_USER_URL)
                        .success(function (user) {
                            currentUser = user;
                            deferred.resolve(getCurrentUser());
                        })
                        .error(function () {

                            if ($cookies.get(authCookieName)) {
                                $cookies.remove(authCookieName);
                            }

                            currentUser = null;

                            if (options.failOnError) {
                                deferred.reject();
                            } else {
                                deferred.resolve(getCurrentUser());
                            }
                        });

                    return deferred.promise;
                };

                requestToken = function () {
                    if (isAuthenticated()) {
                        return 'Bearer ' + $cookies.get(authCookieName);
                    }
                    return undefined;
                };

                login = function (params, onError) {
                    var options = {};

                    if (params.rememberMe) {
                        _.assign(options, { expires: moment().add(COOKIE_EXPIRES, 'day').toDate() });
                    }

                    options.path = '/';

                    return $http.post(oauthURL + LOGIN_URL, JSON.stringify(params), {})
                        .then(function (response) {
                            $cookies.put(authCookieName, response.data[ACCESS_TOKEN_FIELD], options);
                            $window.location.reload();
                        }, onError);
                };

                logout = function () {
                    $cookies.remove(authCookieName, { path: '/' });
                    currentUser = null;
                   // $state.go('unauthenticated-home');
                    console.log($state);
                    $window.location.reload();
                };

                // clean = function () {
                //     $cookies.remove(authCookieName, { path: '/' });
                //     currentUser = null;
                //     $state.go('unauthenticated-home', null, { location: false });
                //     //location.reload();
                // };

                return {
                    requestCurrentUser: requestCurrentUser,
                    login: login,
                    logout: logout,
                    requestToken: requestToken
                };
            }]);

}(require, angular));