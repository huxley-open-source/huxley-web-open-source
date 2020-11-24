/*global module, angular, require, _*/

(function (module, angular) {
    'use strict';

    var messagesPtBr = require('./i18n/messages_pt_BR'),
        messagesEnUs = require('./i18n/messages_en_US'),
        userApp = require('../user/user-app'),
        languageApp = require('../language/language-app'),
        securityModule = require('../security/security-module'),
        componentsModule = require('../components/components-module');

    module.exports = angular.module('thehuxley.group', [
        securityModule.name,
        componentsModule.name,
        userApp.name,
        languageApp.name,
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

                $translateProvider.translations('pt_BR', messagesPtBr);
                $translateProvider.translations('en_US', messagesEnUs);
                $translateProvider.preferredLanguage('pt_BR');

                RestangularProvider.setBaseUrl(apiURL);
                RestangularProvider.setFullResponse(true);
                $stateProvider
                    .state('group-create', {
                        url: '/groups/create',
                        templateUrl: 'group/templates/group-create.tpl.html',
                        controller: 'GroupCreateController',
                        resolve: {
                            currentUser: function (SecurityService, $q, $state) {
                                var deferred = $q.defer();

                                SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.atLeastTeacher()) {
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

                    .state('group-list', {
                        url: '/groups?q&sort&order&page&all',
                        templateUrl: 'group/templates/group-list.tpl.html',
                        controller: 'GroupListController',
                        reloadOnSearch: false,
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },

                            searchParams: function ($stateParams) {
                                var params = _.clone($stateParams, true);
                                if (params.sort === undefined) {
                                    params.sort = 'lastUpdated';
                                }
                                if (params.all === 'true') {
                                    params.all = true;
                                } else if (params.all === 'false') {
                                    params.all = false;
                                }
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
                            }
                        }
                    })

                    .state('group-without-group', {
                        url: '/groups/without-group',
                        templateUrl: 'group/templates/group-without-group.tpl.html',
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },
                            userLogged: function (currentUser, $state) {
                                if (!currentUser.isAuthenticated()) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return true;
                                }

                            }
                        }
                    })

                    .state('group-key', {
                        url: '/groups/key',
                        templateUrl: 'group/templates/group-key.tpl.html',
                        controller: 'GroupKeyController',
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },
                            userLogged: function (currentUser, $state) {
                                if (!currentUser.isAuthenticated()) {
                                    $state.go('group-unauthenticated', null, { location: false });
                                } else {
                                    return true;
                                }

                            }

                        }
                    })

                    .state('group-show', {
                        url: '/group/:id',
                        templateUrl: 'group/templates/group-show.tpl.html',
                        controller: 'GroupShowController',
                        abstract: true,
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },

                            group: function (GroupService, $stateParams, $q, $state) {
                                var deferred = $q.defer();

                                GroupService.get($stateParams.id).then(
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

                    .state('group-show.quizzes', {
                        url: '?page',
                        templateUrl: 'group/templates/group-quest.tpl.html',
                        controller: 'GroupQuestController',
                        reloadOnSearch: false,
                        resolve: {
                            quiz: function () {
                                    return true;
                            },
                            paginationData: function ($stateParams) {
                                return {
                                    currentPage: $stateParams.page ? parseInt($stateParams.page) : 1,
                                    totalItems: $stateParams.page ? parseInt($stateParams.page) * 30 : 0,
                                    itemsPerPage: 30,
                                    offset: 0,
                                    maxSize: 5
                                };
                            },
                            questInfo: function (group, GroupService, currentUser, $state, $q) {
                                var deferred = $q.defer();

                                if (currentUser.isAuthenticated()) {
                                    GroupService.getQuestionnaires(group.id, {max: 1}).then(
                                        function (response) {
                                            if (currentUser.atLeastTeacherAssistant(group) && response.data.length === 0) {
                                                $state.go('group-show.group-quest-empty', {id: group.url});
                                            } else {
                                                deferred.resolve(true);
                                            }
                                        }
                                    );

                                } else {
                                    $state.go('not-found', null, { location: false });
                                }

                                return deferred.promise;
                            }
                        }
                    })

                    .state('group-show.group-quest-empty', {
                        templateUrl: 'group/templates/group-new-quest.tpl.html',
                        controller: 'GroupCreateQuizController',
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },
                            questEmpty: function (currentUser, group, $state) {
                                if (!currentUser.atLeastTeacherAssistant(group)) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return true;
                                }

                            },
                            quiz: function () {
                                return undefined;
                            }
                        }
                    })

                    .state('group-show.quizzes-charts', {
                        url: '/quizzes/charts',
                        templateUrl: 'group/templates/group-quest-chart.tpl.html',
                        resolve: {
                            chart: function (currentUser, group, $state) {
                                if (!currentUser.atLeastTeacherAssistant(group)) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return true;
                                }

                            }
                        }
                    })

                    .state('group-show.submissions', {
                        url: '/submissions?sort&order&submissionGe&submissionLe&evaluation&problem&page&user',
                        templateUrl: 'group/templates/group-submission.tpl.html',
                        controller: 'GroupSubmissionController',
                        reloadOnSearch: false,
                        resolve: {
                            submissions: function (currentUser, group, $state, GroupService, $q) {
                                if (!currentUser.atLeastTeacherAssistant(group)) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    if (group.students) {
                                        return true;
                                    } else {
                                        var deferred = $q.defer();
                                        GroupService.listStudents(group.id, {max:100}).then (function(response) {
                                            group.students = response.data;
                                            deferred.resolve(true);
                                        });
                                        return deferred.promise;
                                    }
                                }

                            },
                            searchParams: function ($q, $stateParams, ProblemService, UserService) {
                                var deferred = $q.defer(), deferred2 = $q.defer(),
                                    params = _.clone($stateParams, true);
                                params.id = undefined;

                                if (!params.sort) {
                                    params.sort = 'submissionDate';
                                }

                                if (!params.order) {
                                    params.order = 'desc';
                                }

                                params.problem = [];
                                if ($stateParams.problem) {
                                    ProblemService.get($stateParams.problem).then( function (response) {
                                        params.problem.push(response.data);
                                        deferred.resolve(params);
                                    });

                                } else {
                                    deferred.resolve(params);
                                }

                                params.user = [];

                                if ($stateParams.user) {
                                    UserService.get($stateParams.user).then(function (response) {
                                        params.user.push(response.data);
                                        deferred2.resolve(params);
                                    });

                                } else {
                                    deferred2.resolve(params);
                                }

                                return $q.all([deferred.promise, deferred2.promise]);
                            },
                            paginationData: function ($stateParams) {
                                return {
                                    currentPage: $stateParams.page ? parseInt($stateParams.page) : 1,
                                    totalItems: $stateParams.page ? parseInt($stateParams.page) * 10 : 0,
                                    itemsPerPage: 10,
                                    offset: 0,
                                    maxSize: 5
                                };
                            }
                        }
                    })

                    .state('group-show.submissions-charts', {
                        url: '/submissions/charts?page',
                        templateUrl: 'group/templates/group-submission-chart.tpl.html',
                        controller: 'GroupSubmissionChartController',
                        resolve: {
                            canSee: function (currentUser, group, $state) {
                                if (!currentUser.atLeastTeacherAssistant(group)) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return true;
                                }

                            },
                            charts: function (currentUser, group, $state) {
                                if (!currentUser.atLeastTeacherAssistant(group)) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return true;
                                }

                            }
                        }
                    })

                    .state('group-show.topcoder-student', {
                        url: '/topcoder',
                        templateUrl: 'group/templates/group-topcoder-student.tpl.html',
                        controller: 'GroupTopcoderStudentController'
                    })

                    .state('group-show.members', {
                        url: '/members?page',
                        templateUrl: 'group/templates/group-user.tpl.html',
                        controller: 'GroupUserController',
                        reloadOnSearch: false,
                        resolve: {
                            paginationData: function ($stateParams) {
                                return {
                                    currentPage: $stateParams.page ? parseInt($stateParams.page) : 1,
                                    totalItems: $stateParams.page ? parseInt($stateParams.page) * 10 : 0,
                                    itemsPerPage: 30,
                                    offset: 0,
                                    maxSize: 5
                                };
                            }
                        }
                    })

                    .state('group-show.group-student-empty', {
                        templateUrl: 'group/templates/group-new-group.tpl.html',
                        url: '/members',
                        resolve: {
                            currentUser: function (currentUser, group, $state) {
                                if (!currentUser.atLeastTeacherAssistant(group)) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return true;
                                }

                            }
                        }
                    })

                    .state('group-show.pendencies', {
                        url: '/members/pendencies?page',
                        templateUrl: 'group/templates/group-pendency.tpl.html',
                        controller: 'GroupPendencyController',
                        reloadOnSearch: false,
                        resolve: {
                            paginationData: function ($stateParams, currentUser, group, $state) {
                                if (!currentUser.atLeastTeacher(group)) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return {
                                        currentPage: $stateParams.page ? parseInt($stateParams.page) : 1,
                                        totalItems: $stateParams.page ? parseInt($stateParams.page) * 30 : 0,
                                        itemsPerPage: 30,
                                        offset: 0,
                                        maxSize: 5
                                    };
                                }

                            }
                        }
                    })

                    .state('group-show.add-members', {
                        url: '/members/add',
                        templateUrl: 'group/templates/group-add-members.tpl.html',
                        controller: 'GroupAddMembersController',
                        resolve: {
                            role: function (currentUser, group, $state) {
                                if (!currentUser.atLeastTeacher(group)) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return 'STUDENT';
                                }
                            }
                        }
                    })

                    .state('group-show.add-teacher', {
                        url: '/members/add-teacher',
                        templateUrl: 'group/templates/group-add-members.tpl.html',
                        controller: 'GroupAddMembersController',
                        resolve: {
                            role: function (currentUser, group, $state) {
                                if (!currentUser.atLeastTeacher(group)) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return 'TEACHER';
                                }
                            }
                        }
                    })

                    .state('group-show.add-teacher-assistant', {
                        url: '/members/add-assistant',
                        templateUrl: 'group/templates/group-add-members.tpl.html',
                        controller: 'GroupAddMembersController',
                        resolve: {
                            role: function (currentUser, group, $state) {
                                if (!currentUser.atLeastTeacher(group)) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return 'TEACHER_ASSISTANT';
                                }
                            }
                        }
                    })

                    .state('group-show.configs-key', {
                        url: '/configs/key?page',
                        templateUrl: 'group/templates/group-config-key.tpl.html',
                        controller: 'GroupConfigKeyController',
                        resolve: {
                            canGenerateKey: function (currentUser, group, $state) {
                                if (!currentUser.atLeastTeacher(group)) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return true;
                                }
                            }
                        }
                    })

                    .state('group-show.edit', {
                        url: '/configs/edit',
                        templateUrl: 'group/templates/group-edit.tpl.html',
                        controller: 'GroupEditController',
                        resolve: {
                            canEdit: function (currentUser, group, $state) {
                                if (!currentUser.atLeastTeacher(group)) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return true;
                                }
                            }
                        }
                    })

                    .state('group-show.create-quiz', {
                        url: '/quiz/create',
                        templateUrl: 'quiz/templates/create-quiz-1.tpl.html',
                        controller: 'GroupCreateQuizController',
                        resolve: {
                            canUpdate: function (currentUser, group, $state) {
                                if (!currentUser.atLeastTeacherAssistant(group)) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return true;
                                }
                            },
                            quiz: function () {
                                return undefined;
                            }
                        }
                    })

                    .state('group-show.delete-group', {
                        url: '/delete-group',
                        templateUrl: 'group/templates/group-delete-group.tpl.html',
                        resolve: {
                            canDelete: function (currentUser, group, $state) {
                                if (!currentUser.atLeastTeacher(group)) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return true;
                                }
                            }
                        }
                    })

                    .state('group-show.stats-general', {
                        url: '/stats',
                        templateUrl: 'group/templates/group-stats.tpl.html',
                        controller: 'GroupStatsController',
                        resolve: {
                            canAccess: function (currentUser, group, $state) {
                                if (!currentUser.atLeastTeacherAssistant(group)) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return true;
                                }
                            }
                        }
                    })
                    .state('group-show.stats-student-list', {
                        url: '/stats/students',
                        templateUrl: 'group/templates/group-stats-student-list.tpl.html',
                        resolve: {
                            canAccess: function (currentUser, group, $state) {
                                if (!currentUser.atLeastTeacherAssistant(group)) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return true;
                                }
                            }
                        }
                    })

                    .state('group-show.stats-student-individual', {
                        url: '/stats/student?userId',
                        templateUrl: 'group/templates/group-review-user.tpl.html',
                        controller: 'GroupStatsUserController',
                        resolve: {
                            canAccess: function (currentUser, group, $state) {
                                if (!currentUser.atLeastTeacherAssistant(group)) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return true;
                                }
                            }
                        }
                    })

                    .state('group-unauthenticated', {
                        templateUrl: 'layout/templates/unauthenticated.tpl.html'
                    })

                    .state('group-show.submission-show', {
                        url: '/submission/:subId',
                        templateUrl: 'group/templates/group-submission-show.tpl.html',
                        controller: 'GroupSubmissionShowController',
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },
                            submissions: function (currentUser, group, $state) {
                                if (!currentUser.atLeastTeacherAssistant(group) && !currentUser.atLeastTeacher()) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return true;
                                }

                            },
                            submission: function ($stateParams, SubmissionService, currentUser, $state, $q, group, GroupService) {
                                var submission, deferred = $q.defer();
                                if ($stateParams.subId) {
                                    SubmissionService.get($stateParams.subId).then(
                                        function (response) {
                                            submission = response.data;
                                            if (currentUser.atLeastTeacherAssistant() || submission.user.id === currentUser.id) {
                                                deferred.resolve(submission);
                                            } else {
                                                $state.go('not-found');
                                            }
                                        },
                                        function () {
                                            $state.go('not-found');
                                        }
                                    );
                                }
                                else {
                                    GroupService.getSubmissions(group.id).then(function (response) {
                                        submission = response.data[0];
                                        $stateParams.subId = submission.id;
                                        deferred.resolve(submission);
                                    }, function () {
                                        $state.go('not-found');
                                    });
                                }
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
                    });
            }]);

}(module, angular));

require('./group-service');
require('./group-controllers');
require('./group-directives');
