/*global module, require, angular, _*/

(function (module, angular) {
    'use strict';

    var messagesPtBr = require('./i18n/messages_pt_BR'),
        messagesEnUs = require('./i18n/messages_en_US'),
        securityModule = require('../security/security-module'),
        componentsModule = require('../components/components-module');

    module.exports = angular.module('thehuxley.admin', [
        securityModule.name,
        componentsModule.name,
        'thehuxley.templates',
        'pascalprecht.translate',
        'ngRoute',
        'ngResource',
        'ui.bootstrap',
        'ui.router',
        'angularMoment',
        'ui.bootstrap.tpls',
        'restangular'
    ])
        .config([
            'apiURL',
            '$stateProvider',
            'RestangularProvider',
            '$translateProvider',
            function (apiURL, $stateProvider, RestangularProvider, $translateProvider) {

                RestangularProvider.setBaseUrl(apiURL);

                $translateProvider.translations('pt_BR', messagesPtBr);
                $translateProvider.translations('en_US', messagesEnUs);
                $translateProvider.preferredLanguage('pt_BR');

                RestangularProvider.setBaseUrl(apiURL);
                RestangularProvider.setFullResponse(true);

                $stateProvider

                    .state('admin', {
                        url: '/admin',
                        abstract : true,
                        templateUrl: 'admin/templates/admin-list.tpl.html',
                        controller: 'AdminController',
                        resolve: {
                            currentUser: function (SecurityService, $q, $state) {
                                var deferred = $q.defer();

                                SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.atLeastAdmin()) {
                                        deferred.resolve(currentUser);
                                    } else {
                                        $state.go('not-found', null, { location: false });
                                        deferred.reject();
                                    }
                                });

                                return deferred.promise;
                            },
                            institution: function () {
                                return '';
                            }
                        }
                    })

                    .state('admin.pendency', {
                        url: '/pendency/institution-documentation',
                        templateUrl: 'pendency/templates/pendency-list.tpl.html',
                        controller: 'PendencyController',
                        resolve : {
                            kind : function () {
                                return 'INSTITUTION_DOCUMENT';
                            }
                        }
                    })

                    .state('admin.pendency-institution-approval', {
                        url: '/pendency/institution-approval',
                        templateUrl: 'pendency/templates/pendency-list.tpl.html',
                        controller: 'PendencyController',
                        resolve : {
                            kind : function () {
                                return 'INSTITUTION_APPROVAL';
                            }
                        }
                    })

                    .state('admin.pendency-teacher-document', {
                        url: '/pendency/teacher-document',
                        templateUrl: 'pendency/templates/pendency-list.tpl.html',
                        controller: 'PendencyController',
                        resolve : {
                            kind : function () {
                                return 'TEACHER_DOCUMENT';
                            }
                        }
                    })

                    .state('admin.pendency-teacher-approval', {
                        url: '/pendency/teacher-approval',
                        templateUrl: 'pendency/templates/pendency-list.tpl.html',
                        controller: 'PendencyController',
                        resolve : {
                            kind : function () {
                                return 'TEACHER_APPROVAL';
                            }
                        }
                    })

                    .state('admin.pendency-group-invitation', {
                        url: '/pendency/group-invitation',
                        templateUrl: 'pendency/templates/pendency-list.tpl.html',
                        controller: 'PendencyController',
                        resolve : {
                            kind : function () {
                                return 'USER_GROUP_INVITATION';
                            }
                        }
                    })

                    .state('admin.pendency-group-join', {
                        url: '/pendency/group-join',
                        templateUrl: 'pendency/templates/pendency-list.tpl.html',
                        controller: 'PendencyController',
                        resolve : {
                            kind : function () {
                                return 'USER_GROUP_JOIN_REQUEST';
                            }
                        }
                    })

                    .state('admin.pendency-create', {
                        url: '/pendency/create',
                        templateUrl: 'pendency/templates/pendency-create.tpl.html',
                        controller: 'PendencyAddController'
                    })

                    .state('admin.submission-show', {
                        url: '/submission/:subId',
                        templateUrl: 'group/templates/group-submission-show.tpl.html',
                        controller: 'AdminSubmissionShowController',
                        resolve:{
                            submission: function ($stateParams, SubmissionService, currentUser, $state, $q){
                                var submission, deferred = $q.defer();
                                SubmissionService.get($stateParams.subId).then(
                                    function (response) {
                                        submission = response.data;
                                        if (currentUser.atLeastTeacher() || submission.user.id === currentUser.id) {
                                            deferred.resolve(submission);
                                        } else {
                                            $state.go('not-found');
                                        }
                                    },
                                    function () {
                                        $state.go('not-found');
                                    }
                                );
                                return deferred.promise;
                            },
                            problem: function (ProblemService, $q, submission, $state) {
                                var deferred = $q.defer();
                                ProblemService.get(submission.problem.id).then(
                                    function (response) {
                                        deferred.resolve(response.data);
                                    },
                                    function () {
                                        $state.go('not-found', null, { location: false });
                                    }
                                );
                                return deferred.promise;

                            }
                        }
                    })

                    .state('admin.institutions', {
                        url: '/institutions?q&sort&order&page&all',
                        templateUrl: 'institution/templates/institution-list.tpl.html',
                        controller: 'InstitutionListController',
                        reloadOnSearch: false,
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },
                            canList: function (currentUser, $state) {
                                if (!currentUser.atLeastAdmin()) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return true;
                                }
                            },
                            searchParams: function ($stateParams) {
                                var params = _.clone($stateParams, true);
                                if (params.sort === undefined) {
                                    params.sort = 'name';
                                }
                                if (params.order === undefined) {
                                    params.order = 'desc';
                                }
                                params.all = true;

                                return params;
                            },
                            paginationData: function ($stateParams) {
                                return {
                                    currentPage: $stateParams.page ? parseInt($stateParams.page) : 1,
                                    totalItems: $stateParams.page ? parseInt($stateParams.page) * 10 : 0,
                                    itemsPerPage: 10,
                                    offset: 0,
                                    maxSize: 5
                                };
                            },

                        }
                    })

                    .state('admin.reevaluate', {
                        url: '',
                        templateUrl: 'admin/templates/admin-reevaluate.tpl.html',
                        controller: 'AdminReevaluateController'
                    })

                    .state('institution-show', {
                        url: '/institutions/:id',
                        templateUrl: 'institution/templates/institution-show.tpl.html',
                        controller: 'InstitutionShowController',
                        abstract : true,
                        resolve: {
                            institution: function (InstitutionService, $stateParams, $q, $state) {
                                var deferred = $q.defer();
                                InstitutionService.getInstitution($stateParams.id).then(
                                    function (result) {
                                        deferred.resolve(result.data);
                                    },
                                    function () {
                                        $state.go('not-found', null, { location: false });
                                    }
                                );
                                return deferred.promise;
                            },
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            }
                        }
                    })

                    .state('institution-edit', {
                        url: '/institutions/:id/edit',
                        templateUrl: 'institution/templates/institution-edit.tpl.html',
                        controller: 'InstitutionEditController',
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },
                            institution: function (InstitutionService, $stateParams, $q, $state, currentUser) {
                                var deferred = $q.defer();
                                InstitutionService.getInstitution($stateParams.id).then(
                                    function (result) {
                                        if(currentUser.atLeastAdminInst(result.data)) {
                                            deferred.resolve(result.data);
                                        } else {
                                            $state.go('not-found', null, { location: false });
                                        }
                                    },
                                    function () {
                                        $state.go('not-found', null, { location: false });
                                    }
                                );
                                return deferred.promise;
                            }
                        }
                    })

                    .state('institution-show.groups', {
                        url: '',
                        controller: 'InstitutionShowGroupsController',
                        templateUrl: 'institution/templates/institution-show-groups.tpl.html'
                    })

                    .state('institution-show.teachers', {
                        url: '/teachers?page',
                        controller: 'InstitutionShowUsersController',
                        templateUrl: 'institution/templates/institution-show-users.tpl.html',
                        resolve: {
                            paginationData: function ($stateParams) {
                                return {
                                    currentPage: $stateParams.page ? parseInt($stateParams.page) : 1,
                                    totalItems: $stateParams.page ? parseInt($stateParams.page) * 10 : 0,
                                    itemsPerPage: 30,
                                    offset: 0,
                                    maxSize: 5
                                };
                            },
                            role: function () {
                                return 'TEACHER';
                            }
                        }
                    })

                    .state('institution-show.students', {
                        url: '/students',
                        controller: 'InstitutionShowUsersController',
                        templateUrl: 'institution/templates/institution-show-users.tpl.html',
                        resolve: {
                            paginationData: function ($stateParams) {
                                return {
                                    currentPage: $stateParams.page ? parseInt($stateParams.page) : 1,
                                    totalItems: $stateParams.page ? parseInt($stateParams.page) * 10 : 0,
                                    itemsPerPage: 30,
                                    offset: 0,
                                    maxSize: 5
                                };
                            },
                            role: function () {
                                return 'STUDENT';
                            }
                        }
                    })

                    .state('institution-show.admins-inst', {
                        url: '/admins-inst',
                        controller: 'InstitutionShowUsersController',
                        templateUrl: 'institution/templates/institution-show-users.tpl.html',
                        resolve: {
                            paginationData: function ($stateParams) {
                                return {
                                    currentPage: $stateParams.page ? parseInt($stateParams.page) : 1,
                                    totalItems: $stateParams.page ? parseInt($stateParams.page) * 10 : 0,
                                    itemsPerPage: 30,
                                    offset: 0,
                                    maxSize: 5
                                };
                            },
                            role: function () {
                                return 'ADMIN_INST';
                            },
                            membersInfo: function (currentUser, institution, paginationData, InstitutionService, $location, $q, role) {
                                var deferred = $q.defer(), userList = [], userSelected = [], userRemoved = [];
                                InstitutionService.getUsers(institution.id, {
                                    max: paginationData.itemsPerPage,
                                    offset: (paginationData.currentPage - 1) * paginationData.itemsPerPage,
                                    role: role
                                }).then(function (request) {
                                    userList = request.data;
                                    paginationData.totalItems = request.headers('total') || 0;
                                    _(request.data).forEach(function (it) {
                                        if (currentUser.atLeastTeacher()) {
                                            userSelected[it.id] = false;
                                            userRemoved[it.id] = false;
                                        }
                                    });
                                    $location.search({page: paginationData.currentPage});
                                    deferred.resolve([userList, userSelected, userRemoved]);
                                });
                                return deferred.promise;

                            }
                        }
                    })

                    .state('institution-show.teacher-assistants', {
                        url: '/teacher-assistants',
                        controller: 'InstitutionShowUsersController',
                        templateUrl: 'institution/templates/institution-show-users.tpl.html',
                        resolve: {
                            paginationData: function ($stateParams) {
                                return {
                                    currentPage: $stateParams.page ? parseInt($stateParams.page) : 1,
                                    totalItems: $stateParams.page ? parseInt($stateParams.page) * 10 : 0,
                                    itemsPerPage: 30,
                                    offset: 0,
                                    maxSize: 5
                                };
                            },
                            role: function () {
                                return 'TEACHER_ASSISTANT';
                            },
                            membersInfo: function (currentUser, institution, paginationData, InstitutionService, $location, $q, role) {
                                var deferred = $q.defer(), userList = [], userSelected = [], userRemoved = [];
                                InstitutionService.getUsers(institution.id, {
                                    max: paginationData.itemsPerPage,
                                    offset: (paginationData.currentPage - 1) * paginationData.itemsPerPage,
                                    role: role
                                }).then(function (request) {
                                    userList = request.data;
                                    paginationData.totalItems = request.headers('total') || 0;
                                    _(request.data).forEach(function (it) {
                                        if (currentUser.atLeastTeacher()) {
                                            userSelected[it.id] = false;
                                            userRemoved[it.id] = false;
                                        }
                                    });
                                    $location.search({page: paginationData.currentPage});
                                    deferred.resolve([userList, userSelected, userRemoved]);
                                });
                                return deferred.promise;

                            }
                        }
                    })

                    .state('institution-show.add-members', {
                        url: '/add',
                        templateUrl: 'institution/templates/institution-add-members.tpl.html',
                        controller: 'InstitutionAddMembersController',
                        resolve: {
                            currentUser: function (SecurityService, $q, $state, institution) {
                                var deferred = $q.defer();

                                SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.atLeastTeacher(institution)) {
                                        deferred.resolve(currentUser);
                                    } else {
                                        $state.go('not-found', null, { location: false });
                                        deferred.reject();
                                    }
                                });

                                return deferred.promise;
                            }
                        }
                    })

                    .state('institution-show.pendency', {
                        url: '/pendency',
                        templateUrl: 'pendency/templates/pendency-list.tpl.html',
                        controller: 'PendencyController',
                        resolve : {
                            kind : function (currentUser, institution, $state) {
                                if (currentUser.atLeastAdminInst(institution)) {
                                    return 'TEACHER_APPROVAL';
                                } else {
                                    $state.go('not-found', null, { location: false });
                                }
                                return '';
                            }
                        }
                    })

                    .state('admin.institution-create', {
                        url: '/create',
                        templateUrl: 'admin/templates/admin-institution-create.tpl.html',
                        controller: 'InstitutionCreateController'
                    })

                    .state('admin.topics', {
                        url: '/topics/',
                        templateUrl: 'admin/templates/topics-manage.tpl.html',
                        controller : 'TopicsController',
                        resolve: {
                            currentUser: ['SecurityService', '$state', function (SecurityService, $state) {
                                return SecurityService.requestCurrentUser()
                                    .then(function (currentUser) {
                                        if (!currentUser.atLeastAdmin()) {
                                            $state.go('not-found', null, { location: false });
                                        }
                                        return currentUser;
                                    });
                            }]
                        }
                    })

                    .state('admin.topics-create', {
                        url : '/topics/create',
                        templateUrl: 'admin/templates/topics-create.tpl.html',
                        controller : 'TopicsCreateController',
                        resolve: {
                            currentUser: ['SecurityService', '$state', function (SecurityService, $state) {
                                return SecurityService.requestCurrentUser()
                                    .then(function (currentUser) {
                                        if (!currentUser.atLeastAdmin()) {
                                            $state.go('not-found', null, { location: false });
                                        }
                                        return currentUser;
                                    });
                            }]
                        }
                    })

                    .state('admin.topics-edit', {
                        url : '/topics/edit/:topicId',
                        templateUrl: 'admin/templates/topics-create.tpl.html',
                        controller : 'TopicsEditController',
                        resolve: {
                            currentUser: ['SecurityService', '$state', function (SecurityService, $state) {
                                return SecurityService.requestCurrentUser()
                                    .then(function (currentUser) {
                                        if (!currentUser.atLeastAdmin()) {
                                            $state.go('not-found', null, { location: false });
                                        }
                                        return currentUser;
                                    });
                            }],
                            topic : function (TopicService, $q, $stateParams, $state) {
                                var topic, deferred = $q.defer();
                                TopicService.get($stateParams.topicId).then(
                                    function (response) {
                                        topic = response.data;
                                        deferred.resolve(topic);
                                    },
                                    function () {
                                        $state.go('not-found');
                                    }
                                );
                                return deferred.promise;
                            }
                        }
                    })

                    .state('admin.language-edit', {
                        url: '/language/edit/:id',
                        templateUrl: 'language/templates/language-edit.tpl.html',
                        controller: 'LanguageCreateController',
                        resolve: {
                            language: function (LanguageService, $stateParams) {
                                return LanguageService.get($stateParams.id);
                            },
                            currentUser: function (SecurityService, $q, $state) {
                                var deferred = $q.defer();
                                SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.atLeastAdmin()) {
                                        deferred.resolve(currentUser);
                                    } else {
                                        $state.go('not-found', null, { location: false });
                                        deferred.reject();
                                    }
                                });
                                return deferred.promise;
                            }
                        }
                    })

                    .state('admin.language-create', {
                        url: '/language/create',
                        templateUrl: 'language/templates/language-edit.tpl.html',
                        controller: 'LanguageCreateController',
                        resolve: {
                            language: function () {
                                return {};
                            },
                            currentUser: function (SecurityService, $q, $state) {
                                var deferred = $q.defer();
                                SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.atLeastAdmin()) {
                                        deferred.resolve(currentUser);
                                    } else {
                                        $state.go('not-found', null, { location: false });
                                        deferred.reject();
                                    }
                                });
                                return deferred.promise;
                            }
                        }
                    })

                    .state('admin.language', {
                        url: '/language',
                        templateUrl: 'language/templates/language.tpl.html',
                        controller: 'LanguageListController',
                        resolve: {
                            currentUser: function (SecurityService, $q, $state) {
                                var deferred = $q.defer();
                                SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.atLeastAdmin()) {
                                        deferred.resolve(currentUser);
                                    } else {
                                        $state.go('not-found', null, { location: false });
                                        deferred.reject();
                                    }
                                });
                                return deferred.promise;
                            }
                        }
                    })

                    .state('institution-create', {
                        url: '/institution/create/:institutionName',
                        templateUrl: 'institution/templates/institution-create.tpl.html',
                        controller: 'InstitutionCreateController',
                        resolve: {
                            currentUser: ['SecurityService', '$state', function (SecurityService, $state) {
                                return SecurityService.requestCurrentUser()
                                    .then(function (currentUser) {
                                        if (!currentUser.isAuthenticated()) {
                                            $state.go('not-found', null, { location: false });
                                        }
                                        return currentUser;
                                    });
                            }]
                        }
                    });
            }
        ]);

}(module, angular));

require('./admin-controllers');
require('../pendency/pendency-controllers');
require('../pendency/pendency-service');
require('../institution/institution-controllers');
require('../institution/institution-service');
require('../language/language-controllers');
require('../language/language-service');


