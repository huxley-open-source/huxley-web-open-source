/*global module, require, angular, _, moment*/

(function (module, angular) {
    'use strict';

    var messagesPtBr = require('./i18n/messages_pt_BR'),
        messagesEnUs = require('./i18n/messages_en_US');

    module.exports = angular.module('thehuxley.quiz', [
        'pascalprecht.translate',
        'angularMoment',
        'ui.scroll',
        'ui.scroll.jqlite',
        'selectize'
    ])

        .config([
            '$translateProvider',
            '$stateProvider',
            function ($translateProvider, $stateProvider) {
                $translateProvider.translations('pt_BR', messagesPtBr);
                $translateProvider.translations('en_US', messagesEnUs);
                $translateProvider.preferredLanguage('pt_BR');

                $stateProvider
                    .state('quiz-list', {
                        url: '/quizzes?q&startDateGe&endDateLe&sort&order&page',
                        templateUrl: 'quiz/templates/quiz-list.tpl.html',
                        controller: 'QuizListController',
                        reloadOnSearch: false,
                        resolve: {
                            currentUser: function (SecurityService, $state, $stateParams, $location) {
                                return SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (!currentUser.isAuthenticated()) {
                                        $location.path($state.href('quiz-list')).search($stateParams);
                                        $state.go('quiz-unauthenticated', {}, { location: false });
                                    }
                                    else {
                                        return currentUser;
                                    }
                                });
                            },

                            searchParams: function ($stateParams, currentUser) {
                                var params = _.clone($stateParams, true);
                                if (!params.sort) {
                                    params.sort = 'title';
                                }
                                if (!params.order) {
                                    params.order = 'asc';
                                }
                                if (currentUser.atLeastTeacherAssistant()) {
                                    params.filter = 'OWN';
                                }
                                return params;
                            },

                            paginationData: function ($stateParams) {
                                return {
                                    currentPage: $stateParams.page ? parseInt($stateParams.page, 10) : 1,
                                    totalItems: $stateParams.page ? parseInt($stateParams.page, 10) * 10 : 0,
                                    itemsPerPage: 10,
                                    offset: 0,
                                    maxSize: 10
                                };
                            }
                        }

                    })

                    .state('quiz-import', {
                        url: '/quiz/import',
                        templateUrl: 'quiz/templates/quiz-import.tpl.html',
                        controller: 'QuizImportController',
                        resolve: {
                            currentUser: function (SecurityService, $state) {
                                return SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.isAuthenticated() && currentUser.atLeastTeacherAssistant()) {
                                        console.log(currentUser);
                                        return currentUser;
                                    }
                                    $state.go('not-found', {}, {location: false});
                                });
                            }
                        }
                    })

                    .state('quiz-show', {
                        url: '/quiz/:id',
                        templateUrl: 'quiz/templates/quiz-show.tpl.html',
                        controller: 'QuizShowController',
                        abstract : true,
                        resolve : {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },

                            quiz : function ($q, QuizService, $stateParams, currentUser, $state) {
                                var deferred = $q.defer(), quest;
                                QuizService.get($stateParams.id).then(function (response) {
                                    quest = response.data;
                                    if (response.headers('TH-Date')) {
                                        quest.serverTime = moment(response.headers('TH-Date'));
                                    }
                                    deferred.resolve(quest);
                                }, function () {
                                    $state.go('not-found', {}, {location: false});
                                });

                                return deferred.promise;
                            }
                        }
                    })

                    .state('quiz-clone', {
                        url: '/quiz/:id/clone',
                        templateUrl: 'quiz/templates/clone-quiz.tpl.html',
                        controller: 'QuizCloneController',
                        abstract : true
                    })

                    .state('quiz-clone.edit', {
                        url: '',
                        templateUrl: 'quiz/templates/create-quiz-1.tpl.html',
                        controller: 'GroupCreateQuizController',
                        resolve : {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },

                            quiz : function ($q, QuizService, $stateParams, currentUser, $state) {
                                var deferred = $q.defer(), quest;
                                QuizService.get($stateParams.id).then(function (response) {
                                    quest = response.data;
                                    if (currentUser.atLeastTeacherAssistant()) {
                                        deferred.resolve(quest);
                                    } else {
                                        $state.go('not-found', {}, {location: false});
                                    }
                                }, function () {
                                    $state.go('not-found', {}, {location: false});
                                });

                                return deferred.promise;
                            },
                            group : function () {
                                return undefined;
                            }
                        }

                    })

                    .state('quiz-show.reviews', {
                        url: '',  //default
                        templateUrl: 'quiz/templates/quiz-review.tpl.html',
                        controller: 'QuizReviewListController',
                        reloadOnSearch: false,
                        resolve: {
                            quiz: function (quiz, currentUser, $state) {
                                if (currentUser.atLeastStudent(quiz.group)) {
                                    if (!currentUser.atLeastTeacherAssistant(quiz.group)) {
                                        $state.go('quiz-show.review-user', {id: quiz.id, userid: currentUser.id});
                                    }
                                    return quiz;
                                } else {
                                    $state.go('quiz-show.problems', {id:quiz.id}, {location: false});
                                }

                            }
                        }
                    })

                    .state('quiz-show.submissions', {
                        //templateUrl: 'quiz/templates/quiz-review.tpl.html',
                        //controller: 'QuizReviewListController',
                        url: '/submissions?sort&order&submissionGe&submissionLe&evaluation&problem&page&user',
                        templateUrl: 'group/templates/group-submission.tpl.html',
                        controller: 'GroupSubmissionController',
                        reloadOnSearch: false,
                        resolve: {
                            quiz: function (quiz, currentUser, $state) {
                                if (!currentUser.atLeastTeacherAssistant(quiz.group)) {
                                    $state.go('not-found', {}, {location: false});
                                }
                                return quiz;


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
                            },
                            group: function (quiz, $q, GroupService) {
                                var group = quiz.group;
                                    group.quiz = quiz.id;
                                if (group.students && group.problems) {
                                    return group;
                                } else {
                                    var deferred = $q.defer();
                                    group.problems = quiz.problemList;
                                    GroupService.listStudents(group.id, {max:100}).then (function(response) {
                                        group.students = response.data;
                                        deferred.resolve(group);
                                    });
                                    return deferred.promise;
                                }
                            }
                        }
                    })


                    .state('quiz-show.problems', {
                        url: '/problems',
                        templateUrl: 'quiz/templates/quiz-problems.tpl.html'
                    })

                    .state('quiz-show.similarity', {
                        url: '/similarity',
                        templateUrl: 'quiz/templates/quiz-similarity.tpl.html',
                        controller: 'QuizSimilarityController',
                        resolve: {
                            canEdit: function(quiz, currentUser, $state) {
                                if(!currentUser.atLeastTeacherAssistant(quiz.group)) {
                                    $state.go('not-found', {}, {location: false});
                                }
                                return true;
                            }
                        }
                    })

                    .state('quiz-show.score', {
                        url: '/score',
                        templateUrl: 'quiz/templates/quiz-score.tpl.html',
                        controller: 'QuizScoreController'
                    })

                    .state('quiz-show.stats', {
                        url: '/stats',
                        templateUrl: 'quiz/templates/quiz-stats.tpl.html',
                        controller: 'QuizStatsController',
                        resolve: {
                            quiz: function (currentUser, quiz, $state) {
                                if(!currentUser.atLeastTeacherAssistant(quiz.group)) {
                                    $state.go('not-found', {}, {location: false});
                                }
                                return quiz;
                            }                        }
                    })

                    .state('quiz-show.edit-problems', {
                        url: '/edit-problems',
                        templateUrl: 'quiz/templates/quiz-edit-problems.tpl.html',
                        controller: 'QuizEditProblemsController',
                        resolve: {
                            canEdit: function(quiz, currentUser, $state) {
                                if(!currentUser.atLeastTeacherAssistant(quiz.group)) {
                                    $state.go('not-found', {}, {location: false});
                                }
                                return true;
                            }
                        }
                    })

                    .state('quiz-show.edit', {
                        url: '/edit',
                        templateUrl: 'quiz/templates/create-quiz-1.tpl.html',
                        controller: 'GroupCreateQuizController',
                        resolve: {
                            quiz: function (quiz) {
                                return quiz;
                            },
                            group: function(quiz) {
                                return quiz.group;
                            },
                            canUpdate: function(quiz, currentUser, $state) {
                                if(!currentUser.atLeastTeacherAssistant(quiz.group)) {
                                    $state.go('not-found', {}, {location: false});
                                }
                                return true;
                            }
                        }
                    })

                    .state('quiz-show.review-user', {
                        url: '/review/:userid',
                        templateUrl: 'quiz/templates/quiz-review-user.tpl.html',
                        controller: 'QuizReviewController',
                        resolve: {
                            userReviewed: function ($q, $stateParams, QuizService, UserService, currentUser, $state, quiz) {
                                var deferred = $q.defer(), canGet = false;
                                if (!currentUser.atLeastTeacherAssistant(quiz.group)) { //Testa se é um aluno
                                    if  ($stateParams.userid) { //Se for um aluno e tiver colocado o id no link
                                        if (currentUser.id + '' !== $stateParams.userid + '') { //Se o id for de outro aluno not found
                                            $state.go('not-found', {}, {location: false});
                                        } else { //Se não, pode visualizar
                                            canGet = true;
                                        }

                                    } else { //Caso não tenha colocado id, vai ser o próprio id
                                        $stateParams.id = currentUser.id;
                                        canGet = true;
                                    }
                                } else { //Se não for aluno, pode visualizar
                                    canGet = true;
                                }
                                if ($stateParams.userid && canGet) {
                                    UserService.get($stateParams.userid).then(
                                        function (response) {
                                            deferred.resolve(response.data);
                                        },
                                            function (){
                                                $state.go('not-found', {}, {location: false});
                                        });
                                } else {
                                    deferred.resolve(false);
                                }

                                return deferred.promise;
                            }
                        }
                    })

                    .state('quiz-create', {
                        url: '/quizzes/create',
                        templateUrl: 'quiz/templates/create-quiz.tpl.html',
                        controller: 'QuizCreateController',
                        abstract: true,
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },
                            canUpdate: function (currentUser, $state) {
                                if (!currentUser.atLeastTeacherAssistant()) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return undefined;
                                }
                            },
                            quiz: function () {
                                return undefined;
                            }
                        }
                    })

                    .state('quiz-create.aux', {
                        url: '',
                        templateUrl: 'quiz/templates/create-quiz-1.tpl.html',
                        controller: 'GroupCreateQuizController',
                        resolve: {
                            quiz: function () {
                                return undefined;
                            },
                            group: function () {
                                return undefined;
                            }
                        }
                    })

                    .state('quiz-unauthenticated', {
                        templateUrl: 'layout/templates/unauthenticated.tpl.html'
                    });
            }]);

}(module, angular));

require('./quiz-service');
require('./quiz-controller');
