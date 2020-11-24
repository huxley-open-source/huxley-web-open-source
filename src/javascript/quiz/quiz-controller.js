/*global angular, require, _, moment, d3, $*/


(function (angular, require) {
    'use strict';

    var quizApp = require('./quiz-app');

    angular.module(quizApp.name)

        .controller('QuizCreateController', [
            '$scope',
            'UserService',
            function ($scope, UserService) {
                $scope.clone = false;
                $scope.groupMap = {};
                UserService.getCurrentUserGroups().then(
                    function (response) {
                        _.each(response.data, function (group) {
                            $scope.groupMap[group.id] = group.name;
                            $scope.group = group.id;
                        });
                    }
                );

            }])

        .controller('QuizCloneController', [
            '$scope',
            function ($scope) {
                $scope.clone = true;
            }])

        .controller('QuizListController', [
            '$scope',
            'QuizService',
            'searchParams',
            'paginationData',
            '$location',
            'currentUser',
            function ($scope, QuizService, searchParams, paginationData, $location, currentUser) {
                $scope.currentUser = currentUser;
                $scope.date = {};
                $scope.disableDropdown = function ($event) {
                    $event.stopPropagation();
                };
                $scope.loading = false;

                $scope.quizScreen = {
                    showAdvancedFilter : false
                };

                $scope.validateStartDate = function (value) {
                    if ((new Date(value)).toString() !== 'Invalid Date' && $scope.searchParams.endPeriod !== undefined) {
                        return moment($scope.searchParams.endPeriod).isAfter(moment(value));
                    }
                    return true;
                };
                $scope.validateEndDate = function (value) {
                    if ((new Date(value)).toString() !== 'Invalid Date' && $scope.searchParams.startPeriod !== undefined) {
                        return moment(value).isAfter(moment($scope.searchParams.startPeriod));
                    }
                    return true;
                };

                $scope.paginationData = paginationData;

                $scope.searchParams = searchParams;
                $scope.searchParams.order = 'desc';
                $scope.searchParams.sort = 'endDate';

                $scope.toggleAdvancedFilter = function () {
                    $scope.quizScreen.showAdvancedFilter = !$scope.quizScreen.showAdvancedFilter;
                };

                $scope.paginationChanged = function () {
                    $scope.search();
                };

                $scope.search = function () {
                    $scope.loading = true;
                    if (!!$scope.searchParams.startPeriod) {
                        $scope.searchParams.startPeriod = moment($scope.searchParams.startPeriod).format('YYYY-MM-DDTHH:mm:ssZ');
                        $scope.searchParams.filter = 'INTERSECT';
                    }
                    if (!!$scope.searchParams.endPeriod) {
                        $scope.searchParams.endPeriod = moment($scope.searchParams.endPeriod).format('YYYY-MM-DDTHH:mm:ssZ');
                        $scope.searchParams.filter = 'INTERSECT';
                    }
                    var searchParams = _.clone($scope.searchParams, true);
                    searchParams.offset = ($scope.paginationData.currentPage - 1) * $scope.paginationData.itemsPerPage;
                    searchParams.max = $scope.paginationData.max;
                    searchParams.page = undefined;
                    QuizService.listUserQuizzes(searchParams).then(function (response) {
                        $scope.paginationData.totalItems = response.headers('total') || 0;
                        $scope.quizScreen.showAdvancedFilter = false;
                        $scope.quizzes = [];
                        _(response.data).forEach(function (it) {
                            var quiz = it;
                            quiz.startDate = new Date(it.startDate);
                            quiz.endDate = new Date(it.endDate);
                            quiz.serverTime = moment(response.headers('TH-Date'));

                            $scope.quizzes.push(quiz);
                        });
                        if ($scope.quizzes[0]) {
                            $scope.date.today = new Date($scope.quizzes[0].serverTime);
                        }
                        $scope.searchParams.page = $scope.paginationData.currentPage;
                        $location.search($scope.searchParams);
                        $scope.searched = true;
                        $scope.loading = false;
                    }, function () {
                        $scope.loading = false;
                    });
                };

                $scope.search();
            }])

        .controller('QuizShowController', [
            '$scope',
            'quiz',
            '$state',
            'currentUser',
            'QuizService',
            '$timeout',
            '$q',
            function ($scope, quiz, $state, currentUser, QuizService, $timeout, $q) {
                $scope.today = new Date();
                $scope.quiz = quiz;
                $scope.quiz.startDate = new Date($scope.quiz.startDate);
                $scope.quiz.endDate = new Date($scope.quiz.endDate);
                $scope.quiz.serverTime = new Date($scope.quiz.serverTime);
                $scope.$state = $state;
                $scope.currentUser = currentUser;
                $scope.loadingShow = false;
                $scope.loadingStats = true;
                $scope.quizReview = {quizList:[], sortStudents:'name', userReviewed: {}, navigate: {}};
                $scope.quizReview.updateNavigate = function () {
                    if ($scope.quizReview.quizList !== undefined && $scope.quizReview.quizList.length !== 0) {
                        for (var i = 0; i < $scope.quizReview.quizList.length ; i++) {
                            if ($scope.quizReview.quizList[i].id === $scope.quizReview.userReviewed.id) {
                                if (i > 0) {
                                    $scope.quizReview.navigate.b = $scope.quizReview.quizList[i - 1].id;
                                } else {
                                    $scope.quizReview.navigate.b = undefined;
                                }
                                if (i < $scope.quizReview.quizList.length -1 && $scope.quizReview.quizList[i + 1].id !== undefined) {
                                    $scope.quizReview.navigate.a = $scope.quizReview.quizList[i + 1].id;
                                } else {
                                    $scope.quizReview.navigate.a = undefined;
                                }
                                break;
                            }
                        }
                    }
                };
                $scope.loadingStudents = true;
                $scope.loadingProblems = true;
                $scope.quizReview.sortStudents = 'name';
                if (!$scope.quizReview.userReviewed) {
                    $scope.loadingUserReview = true;
                }

                $scope.shouldShowPresence = quiz.startDate > new Date(2017, 4, 15);

                var i = 0, p = 0;

                $scope.scorePromise = $q.defer();

                $scope.studentFilter = { presence: false };

                $scope.shouldShowStudent = function(student) {
                    return !$scope.studentFilter.presence || student.present;
                };

                $scope.populateStudents = function (offset) {
                    offset = offset? 0 : offset;
                    $timeout(function () {
                        QuizService.getStudents(quiz.id, {
                            max:100,
                            offset:offset
                        }).then(function (response) {
                            _.each(response.data, function(quiz) {
                                if ($scope.quizReview.quizList.indexOf(quiz) === -1) {
                                    $scope.quizReview.quizList.push(quiz);
                                }
                            });
                            i += 100;
                            if (!$scope.quizReview.userReviewed) {
                                $scope.quizReview.userReviewed = $scope.quizReview.quizList[0];
                            }
                            if (response.headers('total') > i) {
                                $scope.populateStudents(i);
                            } else {
                                $scope.loadingStudents = false;
                                $scope.quizReview.updateNavigate();

                                QuizService.getQuizScores(quiz.id).then(function(resp) {
                                    var byUser = _.indexBy(resp.data, 'userId');

                                    if (resp.data.length > 0) {
                                        quiz.largeProblemSet = resp.data[0].correctProblems.length > 15;
                                    }
                                    $scope.quizReview.quizList.forEach(function(u) {
                                        u.scores = byUser[u.id];
                                        u.scores.totalScore = 0;
                                        u.scores.restrictionPenalty = false;

                                        var penaltiesByProblem = _.indexBy(u.scores.penalties, 'questionnaireProblemId');

                                        u.scores.correctProblems.forEach(function(score) {
                                            var penalty = penaltiesByProblem[score.questionnaireProblemId];
                                            if (!penalty) {
                                                var pScore = quiz.partialScore ? score.partialScore : score.score;

                                                if (score.restrictionPenalty && (score.restrictionErrorCount === null || score.restrictionErrorCount > 0)) {
                                                    u.scores.restrictionPenalty = true;
                                                    pScore = pScore * (1 - (score.restrictionPenalty / 100));

                                                }

                                                u.scores.totalScore += pScore;
                                            }

                                        });

                                        u.scores.penalties.forEach(function(penalty) {
                                           u.scores.totalScore += penalty.penalty;
                                        });


                                   });

                                    $scope.scorePromise.resolve($scope.quizReview.quizList);
                                });

                                QuizService.getPresentUsers(quiz.id).then(function(resp) {
                                    $scope.presentUsers = resp.data;
                                    var presentById = _.indexBy($scope.presentUsers, 'userId');

                                    $scope.quizReview.quizList.forEach(function(u) {
                                        u.present = presentById[u.id];
                                    });
                                });
                            }
                        });
                    });

                };

                $scope.problemListPromise = $q.defer();

                $scope.populateProblems = function (offset) {
                    if (!$scope.quiz.problemList) {
                        $scope.quiz.problemList = [];
                    }
                    offset = offset? 0 : offset;

                    function onProblemsSuccess(response) {
                        _.each(response.data, function(problem) {
                            if ($scope.quiz.problemList.indexOf(problem) === -1) {
                                $scope.quiz.problemList.push(problem);
                            }
                        });
                        p += 100;
                        if (response.headers('total') > p) {
                            $scope.populateProblems(p);
                        }

                        $scope.loadingProblems = false;

                        $scope.problemListPromise.resolve($scope.problemList);
                    }

                    function onProblemsError() {
                        $scope.loadingProblems = false;
                        $scope.errorOnLoadProblems = true;
                    }

                    $timeout(function () {
                        var promise;
                        if (!currentUser.isStudent(quiz.group)) {
                            promise = QuizService.getProblems($scope.quiz.id, {offset:offset, max:100}).then(onProblemsSuccess, onProblemsError);
                        }

                        if (promise) {
                            $scope.quiz.problemList.$promise = promise;
                        }
                    });
                };

                $scope.populateProblems(p);

                if(currentUser.atLeastTeacherAssistant($scope.quiz.group)) {
                    $scope.populateStudents(i);
                }

                $scope.canEditProblems = function() {
                    return currentUser.atLeastTeacherAssistant($scope.quiz.group) && quiz.endDate.getTime() > new Date().getTime();
                };
            }])

        .controller('QuizEditProblemsController', [
            '$scope',
            'QuizService',
            'TopicService',
            'ProblemService',
            'currentUser',
            'GroupService',
            '$modal',
            function ($scope, quizService,  topicService, problemService, currentUser, GroupService, $modal) {
                $scope.loading = true;
                $scope.loading2 = true;
                $scope.saving = false;
                $scope.saved = false;
                $scope.lock = -1;

                $scope.showHideFilter = function () {
                    $scope.problemScreen.showFilter = !$scope.problemScreen.showFilter;
                };

                var delay = (function () {
                    var timer = 0;

                    return function (callback, ms) {
                        clearTimeout(timer);
                        timer = setTimeout(callback, ms);
                    };
                }());

                $scope.problemScreen = {
                    showFilter : false,
                    selectAllTopics : false,
                    selectedTopics : {},
                    excludedTopics : {},
                    selectedTopicsSize : 0,
                    excludedTopicsSize : 0,
                    difficultyLevel: [1, 10],
                    excludeCorrect: false,
                    quizOnly: false
                };


                $scope.disableDropdown = function ($event) {
                    $event.stopPropagation();
                };

                topicService.list({max: 100}).then(function (response) {
                    $scope.allTopics = response.data;
                    $scope.updateTopics();
                });

                $scope.updateTopics = function () {
                    topicService.list({haveInCommon: _.keys($scope.problemScreen.selectedTopics), max: 100}).then(function (response) {
                        $scope.excludableTopics = response.data;
                    });
                };

                $scope.problemSearchList = [];
                $scope.problemChosenList = [];

                quizService.getProblems($scope.quiz.id, {max: 100}).then(function (response) {
                    $scope.problemChosenList = response.data;
                    $scope.loading2 = false;
                }, function () {
                    $scope.loading2 = false;
                });

                $scope.isAuthenticated = function () {
                    return currentUser.isAuthenticated();
                };

                $scope.filterTopic = function (topicId) {
                    if ($scope.problemScreen.selectedTopics.hasOwnProperty(topicId)) {
                        delete $scope.problemScreen.selectedTopics[topicId];
                    } else {
                        $scope.problemScreen.selectedTopics[topicId] = true;
                    }
                    $scope.problemScreen.selectedTopicsSize = _.keys($scope.problemScreen.selectedTopics).length;
                    $scope.updateTopics();
                };

                $scope.excludeTopic = function (topicId) {
                    if ($scope.problemScreen.excludedTopics.hasOwnProperty(topicId)) {
                        delete $scope.problemScreen.excludedTopics[topicId];
                    } else {
                        $scope.problemScreen.excludedTopics[topicId] = true;
                    }
                    $scope.problemScreen.excludedTopicsSize = _.keys($scope.problemScreen.excludedTopics).length;
                    $scope.updateTopics();
                };

                $scope.selectAllTopics = function () {
                    var i, topicId;
                    for (i = 0; i < $scope.allTopics.length; i += 1) {
                        topicId = $scope.allTopics[i].id;
                        $scope.problemScreen.selectedTopics[topicId] = $scope.problemScreen.selectAllTopics;
                    }
                    $scope.problemScreen.selectedTopicsSize = _.keys($scope.problemScreen.selectedTopics).length;
                    $scope.updateTopics();
                };

                $scope.problemsResult = [];

                $scope.pagination = {
                    page: 1,
                    max: 10,
                    total: 0
                };

                var pagesCache = {};

                function updateSelected(problems) {

                    if (!problems.length) {
                        return;
                    }

                    problemService.countGroupResolvers($scope.quiz.group.id, _.pluck(problems, 'id')).then(function(counters) {
                        counters.data.forEach(function(count) {
                            problems.forEach(function(p) {
                               if (p.id === count[0]) {
                                p.studentsSolvedList = new Array(count[1]);
                               }
                            });
                        });

                    });

                    problems.forEach(function(p) {
                        p.selected = false;
                        $scope.quiz.problemList.forEach(function(s) {
                            if (p.id === s.id) {
                                p.selected = true;
                            }
                        });
                    });
                    return problems;
                }

                $scope.fetchProblemsPage = function() {

                    var pagination = _.extend({}, $scope.pagination);
                    pagination.offset = (pagination.page - 1) * pagination.max; // 0 based

                    var cached = pagesCache['page#' + pagination.page];

                    if (cached) {
                        $scope.problemsResult = updateSelected(cached);
                        return;
                    }

                    problemService.list(pagination).then(function(response) {
                        $scope.pagination.total = parseInt(response.headers('total'));
                        $scope.problemsResult = updateSelected(response.data);
                        pagesCache['page#' + pagination.page] = response.data;
                    });
                };

                $scope.fetchProblemsPage();

               $scope.filter = {
                    q: '',
                    ndGe : 0,
                    ndLe : 0,
                    topics: [],
                    excludedTopics: [],
                    excludeCorrect: false
                };

                function search(params) {

                    if (!params){
                        params = {};
                    }

                    params = _.extend({}, $scope.pagination, params);
                    params.page = 1;
                    pagesCache = {};

                    $scope.pagination = params;

                    if ($scope.pagination.quizOnly === 'false') {
                        delete $scope.pagination.quizOnly;
                    }

                    $scope.fetchProblemsPage();
                }

                $scope.simpleSearch = function () {
                    search({q: $scope.query});
                };

                $scope.advancedSearch = function () {
                    $scope.filter.topics = _.keys($scope.problemScreen.selectedTopics);
                    $scope.filter.excludeTopics = _.keys($scope.problemScreen.excludedTopics);
                    $scope.filter.ndGe = $scope.problemScreen.difficultyLevel[0];
                    $scope.filter.ndLe = $scope.problemScreen.difficultyLevel[1];
                    $scope.problemScreen.showFilter = false;
                    $scope.filter.group = $scope.problemScreen.group;
                    $scope.filter.excludeCorrect = $scope.problemScreen.excludeCorrect;
                    console.log($scope.problemScreen.quizOnly);
                    $scope.filter.quizOnly = $scope.problemScreen.quizOnly;

                    if (!$scope.filter.quizOnly) {
                        delete $scope.filter.quizOnly;
                    }

                    search($scope.filter);
                };

                GroupService.getGroupStats($scope.quiz.group.id, {key: 'student'}).then(
                    function (response) {
                        $scope.groupUsers = response.data.student;
                        $scope.groupUsersId = [];
                        _.each($scope.groupUsers, function (user) {
                            $scope.groupUsersId.push(user.id);
                        });
                        /*$scope.groupStats.usersWhoSolvedByProblemCount = {};
                        _(_.keys($scope.groupStats.problemsSolvedByUser)).forEach(function (key) {
                            _.each($scope.groupStats.problemsSolvedByUser[key], function(problem) {
                                if (!$scope.groupStats.usersWhoSolvedByProblemCount[problem.id]) {
                                    $scope.groupStats.usersWhoSolvedByProblemCount[problem.id] = 0;
                                }
                                $scope.groupStats.usersWhoSolvedByProblemCount[problem.id]++;
                            });
                        });*/
                    }
                );

                $scope.$watch('query', function () {
                    delay(function () {
                        if (typeof $scope.query === 'undefined') {
                            return;
                        }

                        search({q: $scope.query});
                    }, 1000);

                });

                $scope.addProblem = function (problem, score) {
                    $scope.lock = problem.id;
                    if(!score) {
                        score = 1;
                    }
                    problem.score = score;
                    $scope.saving = true;
                    $scope.saved = false;
                    quizService.addProblem($scope.quiz.id, problem, 100).then(
                        function() {
                            $scope.saving = false;
                            $scope.saved = true;
                            problem.selected = true;
                            if (!problem.score) {
                                problem.score = 0;
                            }
                            $scope.quiz.problemList.push(problem);

                            $scope.updateTotalScore($scope.quiz);
                            $scope.lock = -1;
                        }
                    );

                };
                $scope.updateTotalScore = function (quiz) {
                    var score = 0, temp;
                    _.each($scope.quiz.problemList, function (problem) {
                        temp = problem.score + '';
                        temp = temp.replace(',','.');
                        score += parseFloat(temp);
                    });
                    quiz.score = score;
                };

                $scope.removeProblem = function (problem) {
                    $scope.saving = true;
                    $scope.saved = false;
                    $scope.lock = problem.id;
                    quizService.removeProblem($scope.quiz.id, problem).then(
                        function () {
                            $scope.saving = false;
                            $scope.saved = true;

                            problem.selected = false;
                            // mantem o objeto "promise" entre as chamadas do "removeProblem"
                            var promise = $scope.quiz.problemList.$promise; // pra que isso?
                            $scope.quiz.problemList = _.reject($scope.quiz.problemList, function(problemToRemove) {
                                return problemToRemove.id === problem.id; // or some complex logic
                            });
                            $scope.quiz.problemList.$promise = promise;
                            $scope.updateTotalScore($scope.quiz);
                            $scope.lock = -1;
                        }
                    );
                };

                var quizRestrictions;

                quizService.findRestrictions($scope.quiz.id).then(function(resp) {
                    quizRestrictions = _.indexBy(resp.data, 'problemId');
                    console.log(quizRestrictions);
                });

                $scope.addRestrictions = function(problem) {

                    var quiz = $scope.quiz;

                    var restrictionsModal = $modal.open({
                        windowClass: 'small-modal',
                        size: 'sm',
                        animation: true,
                        templateUrl: 'quiz/templates/quiz-problem-restrictions.tpl.html',
                        backdrop: 'static',
                        controller: function ($scope) {

                            $scope.quizRestrictions = {
                                penalty: 0
                            };
                            $scope.restrictions = {
                                restricaoFuncoes: [],
                                restricaoWhile: {},
                                restricaoFor: {},
                                restricaoIf: {},
                                restricaoLista: { possuiLista: false },
                                restricaoTupla: {possuiTupla: false },
                                restricaoDicionario: { possuiDicionari: false },
                                restricaoBlocosVazios: {
                                    possuiBlocosVazios: false
                                },
                                restricaoFuncaoChamada: {}
                            };


                            var existingRestrictions = quizRestrictions[problem.id];
                            var rest = existingRestrictions ? JSON.parse(existingRestrictions.restrictions) : [];

                            $scope.options = {
                                penalty: 0
                            };

                            $scope.funcOptions = {};

                            Object.keys($scope.restrictions).forEach(function(key) {
                                $scope.funcOptions[key] = !!rest[key];
                            });

                            if (existingRestrictions) {
                                $scope.options.penalty = existingRestrictions.penalty;
                            }

                            $scope.restrictions = _.extend({}, $scope.restrictions, rest);
                            var myRestrictions = $scope.restrictions;
                            $scope.addFunction = function() {
                                var functionModal = $modal.open({
                                    windowClass: 'small-modal',
                                    size: 'sm',
                                    animation: true,
                                    templateUrl: 'quiz/templates/quiz-problem-restrictions-function.tpl.html',
                                    backdrop: 'static',
                                    controller: function ($scope) {

                                        $scope.func = {
                                            qtdParametros: 0,
                                            type: 'exist'
                                        };

                                        $scope.close = function () {
                                            functionModal.dismiss();
                                        };

                                        $scope.save = function() {
                                            console.log($scope.func);
                                            if ($scope.func.type === 'exist') {
                                                if (!myRestrictions.restricaoFuncoes) {
                                                    myRestrictions.restricaoFuncoes = [];
                                                }
                                                myRestrictions.restricaoFuncoes.push($scope.func);
                                            } else {
                                                if (!myRestrictions.restricaoFuncaoChamada) {
                                                    myRestrictions.restricaoFuncaoChamada = [];
                                                }
                                                myRestrictions.restricaoFuncaoChamada.push($scope.func);
                                            }
                                            functionModal.dismiss();
                                        };
                                    }
                                });
                            };

                            $scope.removeFunction = function(funcoes, idx) {
                                funcoes.splice(idx, 1);
                            };

                            $scope.save = function() {

                                $scope.saving = true;
                                $scope.error = false;

                                var restrictions = {};
                                Object.keys($scope.restrictions).forEach(function(k) {
                                   var val = $scope.restrictions[k];

                                    if (val.length || !_.isEmpty(val)) {
                                        restrictions[k] = val;
                                    }
                                });

                                function copyIfEnabled(name) {
                                    if ($scope.funcOptions[name]) {
                                        restrictions[name] = $scope.restrictions[name];

                                        if (restrictions[name].minimo === null) {
                                            restrictions[name].minimo = restrictions[name].maximo;
                                        }

                                        if (restrictions[name].maximo === null) {
                                            restrictions[name].maximo = restrictions[name].minimo;
                                        }

                                    } else {
                                        delete restrictions[name];
                                    }
                                }

                                copyIfEnabled('restricaoIf');
                                copyIfEnabled('restricaoFor');
                                copyIfEnabled('restricaoWhile');

                                if (!restrictions.restricaoLista.possuiLista) {
                                    delete restrictions.restricaoLista;
                                }

                                if (!restrictions.restricaoTupla.possuiTupla) {
                                    delete restrictions.restricaoTupla;
                                }

                                if (!restrictions.restricaoDicionario.possuiDicionario) {
                                    delete restrictions.restricaoDicionario;
                                }

                                quizService.addRestriction(quiz.id, problem.id, {
                                    restrictions: restrictions,
                                    penalty: $scope.options.penalty
                                }).then(function(resp) {
                                    $scope.saving = false;
                                    quizRestrictions[problem.id] = resp.data;
                                    $scope.close();
                                }, function() {
                                    $scope.saving = false;
                                    $scope.error = true;
                                });

                            };

                            $scope.close = function () {
                                restrictionsModal.dismiss();
                            };
                        }
                    });
                };

                $scope.updateScore = function (problem) {
                    $scope.saving = true;
                    $scope.saved = false;
                    $scope.lock = 0;
                    quizService.updateProblem($scope.quiz.id, problem).then(
                        function() {
                            $scope.saving = false;
                            $scope.saved = true;
                            $scope.updateTotalScore($scope.quiz);
                            $scope.lock = -1;
                        }
                    );


                };

            }])

        .controller('QuizSimilarityController', [
            '$scope',
            'quiz',
            'QuizService',
            'usSpinnerService',
            '$modal',
            function ($scope, quiz, quizService, usSpinnerService, $modal) {
                $scope.quiz = quiz;
                $scope.searched = false;
                $scope.paginationData = {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 0,
                    maxSize: 10,
                    offset: 0
                };

                $scope.quizScreen = {
                    matchVisible :  {}
                };

                $scope.problemList = [];
                $scope.smilaritiesSortedByProblem = undefined;
                $scope.list = function () {
                    $scope.loading = true;

                    $scope.paginationData.offset = ($scope.paginationData.currentPage - 1) * $scope.paginationData.itemsPerPage;
                    $scope.smilaritiesSortedByProblem = {};
                    $scope.similarities = {};
                    $scope.problemList = [];

                    quizService.getSimilarities(quiz.id, {
                        max: $scope.paginationData.maxSize,
                        offset: $scope.paginationData.offset
                    }).then(function (response) {
                        $scope.smilaritiesSortedByProblem = [];
                        $scope.paginationData.totalItems = response.headers('total') || 0;
                        $scope.similarities = response.data;
                        $scope.searched = true;
                        $scope.similarities.forEach(function (similarity) {
                            if (_.has($scope.smilaritiesSortedByProblem, similarity.suspiciousSubmission.problem.id)) {
                                $scope.smilaritiesSortedByProblem[similarity.suspiciousSubmission.problem.id].push(similarity);
                            } else {
                                $scope.smilaritiesSortedByProblem[similarity.suspiciousSubmission.problem.id] = [similarity];
                                $scope.problemList.push(similarity.suspiciousSubmission.problem);
                            }
                        });
                        $scope.loading = false;
                    });
                };
                $scope.list();

                $scope.$on('UPDATE_SIMILARITY', function () {
                    $scope.problemList = [];
                    $scope.list();
                });

                $scope.paginationChanged = function () {
                    $scope.list();
                };

                $scope.showMatch = function (similarityId) {
                    $scope.quizScreen.matchVisible[similarityId] = true;
                };

                $scope.hideMatch = function (similarityId) {
                    $scope.quizScreen.matchVisible[similarityId] = false;
                };

                var compareModal;
                $scope.open = function (similarity) {
                    compareModal = $modal.open({
                        animation: true,
                        templateUrl: 'quiz/templates/quiz-similarity-compare.tpl.html',
                        backdrop: 'static',
                        controller: function ($scope, QuizService) {
                            $scope.similarity = similarity;

                            $scope.plagiarizedSubmissionUserAlreadyPunished = false;
                            $scope.suspiciousSubmissionUserAlreadyPunished = false;

                            QuizService.getPenalty(similarity.plagiarizedSubmission.user.id, quiz.id, similarity.plagiarizedSubmission.problem.id).then(function (response) {
                                console.log(response.data.penalty);
                                if (response.data.penalty === 0) {
                                    $scope.plagiarizedSubmissionUserAlreadyPunished = true;
                                }
                            });

                            QuizService.getPenalty(similarity.suspiciousSubmission.user.id, quiz.id, similarity.suspiciousSubmission.problem.id).then(function (response) {
                                console.log(response.data.penalty);
                                if (response.data.penalty === 0) {
                                    $scope.suspiciousSubmissionUserAlreadyPunished = true;
                                }
                            });

                            $scope.close = function () {
                                compareModal.dismiss();
                            };

                            $scope.confirmar = function () {
                                if ($scope.similarity.option > 0) {
                                    QuizService.confirmSimilarity(quiz.id, similarity.id, $scope.similarity.option).then( function () {
                                        $scope.$parent.$broadcast('UPDATE_SIMILARITY');
                                        compareModal.dismiss();
                                    });
                                } else {
                                    QuizService.discardSimilarity(quiz.id, similarity.id).then( function () {
                                        $scope.$parent.$broadcast('UPDATE_SIMILARITY');
                                        compareModal.dismiss();
                                    });
                                }
                            };

                            $scope.cancelar = function () {
                                compareModal.dismiss();
                            };
                        }
                    });
                };


            }])

        .controller('QuizStatsController', [
            '$scope',
            '$filter',
            'quiz',
            '$translate',
            'QuizService',
            '$q',
            'currentUser',
            function ($scope, $filter, quiz, $translate, QuizService, $q, currentUser) {
                $scope.startDate = moment(quiz.startDate);
                $scope.endDate = moment(quiz.endDate);
                $scope.totalDays = $scope.endDate.diff($scope.startDate, 'days') + 1;
                $scope.totalUsers = 0;

                var colors = ['#FF0000', '#5CADFF']; //vermelho, azul

                $scope.average = parseInt(quiz.score * 0.7);

                $translate('quiz.smallerThan').then(function (translated) {
                    $scope.smallerThanLabel = translated + ' (' + $scope.average + ')';
                });
                $translate('quiz.greaterThan').then(function (translated) {
                    $scope.greaterThanLabel = translated + ' (' + $scope.average + ')';
                });

                $scope.statsFilter = { presence: false};

                $scope.fillGraphs = function (stats) {
                    var usersWhoTried = 0;
                    $scope.greaterThanAverage = 0;
                    $scope.smallerThanAverage = 0;
                    $scope.submissionsCount = 0;

                    Object.keys(stats).forEach(function(key) {
                        if (stats[key] && stats[key].submissionsCount) {
                            usersWhoTried++;
                            $scope.submissionsCount += stats[key].submissionsCount;
                        }
                    });

                    $scope.submissionsAvgPerDay = ($scope.submissionsCount / $scope.totalDays).toFixed(1);

                    var totalUsers = $scope.statsFilter.presence ? $scope.presentUsers.length : $scope.quizReview.quizList.length;
                    var score70perc = $scope.quiz.score * 0.7;

                    $scope.quizReview.quizList.forEach(function (user) {
                        if ($scope.statsFilter.presence && !user.present) {
                            return;
                        }
                        if(user.scores.totalScore >= score70perc) {
                            $scope.greaterThanAverage++;
                        } else {
                            $scope.smallerThanAverage++;
                        }
                    });

                    $scope.gradeThreshold = 7;

                    $scope.stats = {
                        'submissionsCount' : stats.submissionsCount,
                        'submissionsAvgPerDay' : parseInt(stats.submissionsCount/$scope.totalDays),
                        'gradeProportion' : [
                            {'label' : 'quiz.smaller', 'value' : ($scope.smallerThanAverage/totalUsers)},
                            {'label' : 'quiz.greater', 'value' : ($scope.greaterThanAverage/totalUsers)}
                        ],
                        'studentsTried'  : [
                            {'label' : 'quiz.studentsTried', 'value' : usersWhoTried/totalUsers },
                            {'label' : 'quiz.studentsNotTried', 'value' : 1 - usersWhoTried/totalUsers }
                        ],
                        'submissionsPerProblem': {},
                        'topicsRequired': {},
                        'topicsSolved': {},
                        'topics': [],
                        'problemsSolvedCount': {},
                        'problemsSolvedByNDAverage': {},
                        'problemsSolvedByNDAverageKeys': []
                    };

                    _.each($scope.quiz.problemList, function(problem) {
                        _.each(problem.topics, function(topic) {

                            if (topic === '') {
                                return;
                            }

                            if(!$scope.stats.topicsRequired[topic.name]) {
                               $scope.stats.topicsRequired[topic.name] = 0;
                            }
                            $scope.stats.topicsRequired[topic.name]++;
                        });
                    });

                    Object.keys(stats).forEach(function(key) {
                        if (!stats[key] || !stats[key].solvedProblemsCountByTopic) {
                            return;
                        }
                        Object.keys(stats[key].solvedProblemsCountByTopic).forEach(function(topic) {
                            if(!$scope.stats.topicsSolved[topic]) {
                                $scope.stats.topicsSolved[topic] = 0;
                                $scope.stats.topics.push(topic);
                            }

                            $scope.stats.topicsSolved[topic] += stats[key].solvedProblemsCountByTopic[topic];
                        });
                    });

                    var solvedProblemsCountByTopic = [], value = 0;
                    _.each($scope.stats.topics, function(topic) {
                        value = 0;
                        if (topic === '') {
                            return;
                        }
                        if ($scope.stats.topicsRequired[topic] && $scope.stats.topicsSolved[topic] && $scope.stats.topicsSolved[topic] !== 0) {
                            value = (($scope.stats.topicsSolved[topic] / totalUsers) * 100) / $scope.stats.topicsRequired[topic];
                        }
                        solvedProblemsCountByTopic.push({label: topic, value: value});
                    });
                    $scope.profileTopics = {};
                    $scope.profileTopics.data = [
                        {
                            'keys': 'Acertos por Topico',
                            'values': solvedProblemsCountByTopic
                        }
                    ];
                    $scope.profileTopics.options = {
                        chart: {
                            type: 'discreteBarChart',
                            height: 450,
                            margin : {
                                top: 20,
                                right: 40,
                                bottom: 135,
                                left: 55
                            },
                            x: function (d) {return d.label; },
                            y: function (d) {return d.value; },
                            showValues: true,
                            valueFormat: function (d) {
                                return d3.format('f')(d) + '%';
                            },
                            transitionDuration: 500,
                            xAxis: {
                                axisLabel: '',
                                rotateLabels: 45

                            },
                            yAxis: {
                                tickFormat: function (d) {
                                    return d3.format('f')(d) + '%';
                                },
                                axisLabel: 'Porcentagem de acertos',
                                axisLabelDistance: 30
                            },
                            forceY: [100, 0]
                        }
                    };

                    var ndRequiredCount = {};
                    _.each($scope.quiz.problemList, function(problem) {
                        if(!ndRequiredCount[problem.nd]) {
                            ndRequiredCount[problem.nd] = 0;
                        }
                        ndRequiredCount[problem.nd]++;
                    });

                    var ndResolvedCount = {};

                    Object.keys(stats).forEach(function(key) {
                        if (!stats[key] || !stats[key].solvedProblemsCountByNd) {
                            return;
                        }
                        Object.keys(stats[key].solvedProblemsCountByNd).forEach(function(nd) {
                            if(!ndResolvedCount[nd]) {
                                ndResolvedCount[nd] = 0;
                            }

                            ndResolvedCount[nd] += stats[key].solvedProblemsCountByNd[nd];
                        });
                    });

                    var solvedProblemsCountByNd = [];

                    Object.keys(ndRequiredCount).forEach(function(nd) {
                        value = 0;

                        if (ndResolvedCount[nd] && ndResolvedCount[nd] !== 0) {
                            value = (((ndResolvedCount[nd] / totalUsers) * 100) / ndRequiredCount[nd]);
                        }
                        solvedProblemsCountByNd.push({label: nd, value: value});
                    });

                    $scope.ndChart = {};
                    $scope.ndChart.data = [
                        {
                            'keys': 'Acertos por Nd',
                            'values': solvedProblemsCountByNd
                        }
                    ];
                    $scope.ndChart.options = {
                        chart: {
                            type: 'discreteBarChart',
                            height: 450,
                            margin : {
                                top: 20,
                                right: 20,
                                bottom: 60,
                                left: 55
                            },
                            x: function (d) {return d.label; },
                            y: function (d) {return d.value; },
                            showValues: true,
                            valueFormat: function (d) {
                                return d3.format('f')(d) + '%';
                            },
                            transitionDuration: 500,
                            xAxis: {
                                axisLabel: 'Nivel de dificuldade (ND)',
                                tickFormat: function (d) {
                                    return 'ND: ' + d3.format('d')(d);
                                }
                            },
                            yAxis: {
                                tickFormat: function (d) {
                                    return d3.format('f')(d) + '%';
                                },
                                axisLabel: 'Porcentagem de acertos',
                                axisLabelDistance: 30
                            },
                            forceY: [100, 0]
                        }
                    };

                };

                $scope.getQuizStats = function () {

                    QuizService.getStats(quiz.id, $scope.statsFilter.presence).then(function (response) {
                        $scope.fillGraphs(response.data);
                        $scope.loadingStats = false;
                    }, function() {
                        $scope.loadingStats = 'fail';
                    });
                };

                if(currentUser.atLeastTeacherAssistant(quiz.group)) {
                    $q.all([$scope.scorePromise.promise, $scope.problemListPromise.promise]).then(function() {
                        $scope.getQuizStats();
                    });
                }

                $scope.xFunction = function () {
                    return function (data) {
                        return $filter('translate')(data.label);
                    };
                };

                $scope.yFunction = function () {
                    return function (data) {
                        return data.value;
                    };
                };

                $scope.percentToolTipContentFunction = function () {
                    return function (key, x) {
                        return '<h3>' + key + '</h3>' +
                            '<p>' + (x * 100) + '%</p>';
                    };
                };

                $scope.colorFunction = function () {
                    return function (d, i) {
                        return colors[i];
                    };
                };

                $scope.statsOptions = {
                    studentPieChart: {
                        chart: {
                            type: 'pieChart',
                            donut: true,
                            width: 450,
                            height: 390,
                            x: $scope.xFunction(),
                            y: $scope.yFunction(),
                            donutRatio: 0.25,
                            showLegend: true,
                            interactive: true,
                            tooltips: true,
                            tooltipContent: $scope.percentToolTipContentFunction(),
                            showLabels: true,
                            labelType: 'percent'
                        }
                    },

                    gradePieChart: {}
                };

                $scope.statsOptions.gradePieChart.chart = angular.extend({}, $scope.statsOptions.studentPieChart.chart, {
                    color: $scope.colorFunction(),
                    legendColor: $scope.colorFunction()
                });
            }
        ])

        .controller('QuizReviewListController', [
            '$scope',
            'quiz',
            'QuizService',
            'GroupService',
            function ($scope, quiz, QuizService, groupService) {
                $scope.searchParams = {
                    order: false
                };
                $scope.quiz = quiz;
                groupService.getKey($scope.quiz.group.id).then(
                    function (response) {
                        $scope.key = response.data.key;
                    }
                );
                $scope.changeSearchScope = function () {
                    if ($scope.quizReview.sortStudents === 'score') {
                        $scope.quizReview.sortStudents = 'name';
                        $scope.quizReview.quizList = _.sortBy($scope.quizReview.quizList, 'name');
                    } else {
                        $scope.quizReview.sortStudents = 'score';
                        $scope.quizReview.quizList = _.sortBy($scope.quizReview.quizList, function (student) {
                            return - student.scores.totalScore;
                        });
                    }
                };
                $scope.quizReview.userReviewed = $scope.quizReview.quizList[0];
                $scope.exportXLS = function () {
                    QuizService.exportXLS($scope.quiz.id).then(function(response) {
                        window.location = window.th.apiRootPath + /download/ + response.data.key;
                    });
                };
            }])

        .controller('QuizReviewController', [
            '$scope',
            'quiz',
            'SubmissionService',
            'userReviewed',
            'QuizService',
            'UserService',

            function ($scope, quiz, SubmissionService, userReviewed, QuizService, UserService) {
                if (userReviewed) {
                    $scope.quizReview.userReviewed = userReviewed;
                }
                $scope.quiz = quiz;
                $scope.problemSubmissions = {};
                $scope.predicate = 'tries';

                $scope.listUserProblems = function (offset) {
                    if (!offset) {
                        offset = 0;
                    }
                    $scope.loadingUserReview = true;

                    QuizService.getUserQuizScores($scope.quiz.id, $scope.quizReview.userReviewed.id).then(
                        function (response) {
                            var problemById = _.indexBy(response.data.problems, 'id');

                            var totalUserScore = 0;

                            /*jshint camelcase: false */
                            response.data.scores.forEach(function(score) {
                                var problem = problemById[score.problem_id];

                                if (problem) {
                                    problem.userScore = score;
                                    problem.finalUserScore = $scope.quiz.partialScore ? score.partial_score : score.user_score;

                                    if (score.penalty >= 0) {
                                        problem.finalUserScore = score.penalty;
                                    }

                                    problem.score = score.problem_score;

                                    if (score.restriction_penalty && (score.restriction_error_count === null || score.restriction_error_count > 0)) {
                                        problem.finalUserScore = problem.finalUserScore * (1 - (score.restriction_penalty / 100));
                                    }

                                    totalUserScore += problem.finalUserScore;

                                    problem.finalUserScore = problem.finalUserScore.toFixed(1);

                                    if (score.user_score === score.problem_score) {
                                        problem.susbmissionStatus = 'CORRECT';
                                    } else if (score.submission_count > 0) {
                                        problem.susbmissionStatus = 'WRONG';
                                    }

                                } else {
                                    console.log('no-problem-for', score.problem_id);
                                }
                            });

                            $scope.problemList = response.data.problems;
                            $scope.totalUserScore = +totalUserScore.toFixed(1);
                            $scope.loadingUserReview = false;
                            if(response.data.length === 100) {
                                $scope.listUserProblems(offset + 100);
                            }
                        });

                };

                $scope.totalUserScore = 0;

                $scope.$watch('quizReview.quizList', function (quizList) {
                    if (quizList) {
                        $scope.quizReview.updateNavigate();
                    }
                });

                $scope.codeReviewUser = function (id) {

                    SubmissionService.list({user: $scope.quizReview.userReviewed.id, problem: id, submissionDateLe: moment(quiz.endDate).format('YYYY-MM-DDTHH:mm:ssZ')}).then(function (response) {
                        $scope.problemSubmissions[id] = response.data;


                        if ($scope.quizScreen.matchVisible[id]) {
                            $scope.quizScreen.matchVisible[id] = false;
                        } else {
                            $scope.quiz.problemList.forEach(function (problem) {
                                $scope.quizScreen.matchVisible[problem.id] = false;
                            });
                            $scope.quizScreen.matchVisible[id] = true;
                        }
                    });

                };

                if (userReviewed) {
                    $scope.quizReview.userReviewed = userReviewed;
                }

                $scope.$watch('quizReview.userReviewed', function (newValue, oldValue) {
                    if ($scope.quizReview.userReviewed && newValue.id !== oldValue.id) {
                        $scope.listUserProblems();
                        $scope.quizReview.updateNavigate();
                    }
                });

                /*jshint camelcase: false */
                function updateScore(problem) {

                    var userScore = $scope.quiz.partialScore ? +problem.userScore.partial_score.toFixed(1) : +problem.userScore.user_score;
                    var oldScore = (problem.userScore.penalty >= 0) ? problem.userScore.penalty : userScore;
                    var penalty = (+problem.finalUserScore === userScore) ? -1 : +problem.finalUserScore;

                    QuizService.addPenalty(userReviewed.id, quiz.id, problem.id, penalty).then(
                        function () {
                            problem.userScore.penalty = penalty;
                            if(penalty === -1) {
                                $scope.totalUserScore = $scope.totalUserScore - oldScore + problem.userScore.user_score;
                            } else if(penalty <= problem.userScore){
                                $scope.totalUserScore = $scope.totalUserScore + oldScore - penalty;
                            } else {
                                $scope.totalUserScore = $scope.totalUserScore - oldScore + penalty;
                            }

                            UserService.get(userReviewed.id).then(function (response) {
                                $scope.populateStudents();
                                $scope.quizReview.userReviewed = response.data;
                            });
                        }
                    );
                }

                $scope.updateScore = _.debounce(updateScore, 1000);

                $scope.failQuizz = function() {
                    QuizService.failQuizz(userReviewed.id, quiz.id).then(function(response) {
                        $scope.quizReview.userReviewed = response.data;
                        $scope.problemList.forEach(function (problem) {
                            problem.userScore.penalty = problem.finalUserScore;
                            problem.finalUserScore = 0;
                        });
                        $scope.populateStudents();
                    });
                };


                $scope.quizScreen = {
                    matchVisible :  {},
                    problem : {},
                    submission: {},
                    bestEvaluation: {}
                };

                $scope.listUserProblems();
                $scope.quizReview.updateNavigate();

            }])
        .controller('QuizImportController', [
            '$scope',
            'currentUser',
            'UserService',
            'GroupService',
            '$modal',
            '$filter',
            'QuizService',
            '$state',
            function ($scope, currentUser, UserService, GroupService, $modal, $filter, QuizService, $state) {
                $scope.groups = [];
                $scope.groupExpand = null;
                $scope.loadingGroup = true;
                $scope.loadingQuizzes = true;
                $scope.selectGroups = [];
                $scope.selectGroupsId = [];
                $scope.showExportedQuizzes = false;
                $scope.excludedGroups = [];

                $scope.selectedQuizzes = [];
                $scope.selectedQuizzesId = [];

                $scope.initialDate = new Date();

                $scope.myConfig = {
                    create: false
                };

                $scope.myOptions = [];

                $scope.pagination = {
                    page: 1,
                    max: 17,
                    total: 0
                };

                $scope.expandGroup = function (group) {
                    if($scope.groupExpand === group.id) {
                        $scope.groupExpand = null;
                    }
                    else {
                        $scope.groupExpand = group.id;
                    }
                    if(group.quests === undefined) {
                        group.quests = [];
                        $scope.loadingQuizzes = true;
                        GroupService.getQuestionnaires(group.id, {
                            sort: 'startDate',
                            order: 'desc',
                            max: 10000
                        }).then(function (response) {
                            _(response.data).forEach(function (it) {
                                var temp = it;
                                temp.startDate = new Date(it.startDate);
                                temp.endDate = new Date(it.endDate);
                                temp.serverTime = new Date(it.serverTime);
                                group.quests.push(temp);
                            });
                            $scope.loadingQuizzes = false;
                        }, function () {
                        });
                    }
                };

                $scope.compare = function (a,b) {
                    if (a.startDate < b.startDate) {
                        return -1;
                    }

                    if (a.startDate > b.startDate) {
                        return 1;
                    }
                    return 0;
                };

                $scope.addQuiz = function (quiz) {
                    $scope.selectedQuizzes.push(quiz);
                    $scope.selectedQuizzesId[quiz.id] = true;
                    $scope.selectedQuizzes.sort($scope.compare);
                    if($scope.excludedGroups[quiz.group.id]) {
                        $scope.excludedGroups[quiz.group.id]++;
                    } else {
                        for (var i = 0; i < $scope.myOptions.length; i++) {
                            if($scope.myOptions[i].value === quiz.group.id) {
                                $scope.myOptions.splice(i, 1);
                                break;
                            }
                        }
                        $scope.excludedGroups[quiz.group.id] = 1;
                    }

                };

                $scope.removeQuiz = function (quiz) {
                    var index = $scope.selectedQuizzes.indexOf(quiz);
                    $scope.selectedQuizzes.splice(index, 1);
                    delete $scope.selectedQuizzesId[quiz.id];
                    $scope.excludedGroups[quiz.group.id]--;
                    if($scope.excludedGroups[quiz.group.id] === 0) {
                        $scope.myOptions.push({value: quiz.group.id, text: quiz.group.name});
                    }
                };



                $scope.searchGroup = function () {
                    $scope.loadingGroup = true;

                    UserService.getCurrentUserGroups({max: 10000}).then(
                        function (response) {
                            $scope.loadingGroup = false;
                            $scope.pagination.total  = response.headers('total') || 0;
                            $scope.groups = response.data;
                            $scope.groups.forEach(function (group) {
                                $scope.myOptions.push({value: group.id, text: group.name});
                            });
                            $scope.updateGroupsPages($scope.groups);
                        }
                    );
                };
                $scope.searchGroup();

                $scope.updateGroupsPages = function (groups) {
                    var begin = (($scope.pagination.page - 1) * $scope.pagination.max),
                        end = begin + $scope.pagination.max;
                    $scope.pagination.total = groups.length;
                    $scope.filteredGroups = groups.slice(begin, end);
                };

                $scope.filterGroups = function() {
                    $scope.searchedGroups = $filter('filter')($scope.groups, {name: $scope.query});
                    $scope.pagination.page = 1;
                    $scope.updateGroupsPages($scope.searchedGroups);
                };

                $scope.selectGroup = function (group) {
                    if($scope.selectGroupsId[group.id] === undefined) {
                        $scope.selectGroups.push(group.id);
                        $scope.selectGroupsId[group.id] = true;
                    } else {
                        $scope.selectGroups.splice($scope.selectedQuizzes.indexOf(group.id), 1);
                        delete $scope.selectGroupsId[group.id];
                    }
                };

                $scope.error = false;
                $scope.formSubmit = function () {
                    $scope.error = $scope.selectedQuizzes.length === 0;
                    if (!$scope.exportQuizzes.$valid) {
                        _(_.keys($scope.exportQuizzes)).forEach(function (field) {
                            if (field[0] !== '$') {
                                $scope.exportQuizzes[field].$setDirty();
                            }
                        });
                    } else if($scope.error === false) {
                        var date = new Date($scope.startDate);
                        var first = true;
                        var previousDate;
                        var nexDate;
                        $scope.clonedQuizzes = _.clone($scope.selectedQuizzes, true);
                        $scope.clonedQuizzes.forEach(function (quiz) {
                            var startDate = new Date(quiz.startDate);
                            quiz.hours = startDate.getHours();
                            quiz.minutes = startDate.getMinutes();
                            quiz.duration = quiz.endDate - quiz.startDate;
                            if (first) {
                                first = false;
                                date.setHours(quiz.hours, quiz.minutes);
                                quiz.startDate = moment(date).format('YYYY-MM-DDTHH:mm:ssZ');
                                previousDate = quiz.endDate;
                                quiz.endDate = moment(quiz.startDate).add(quiz.duration, 'ms').format('YYYY-MM-DDTHH:mm:ssZ');
                                nexDate = quiz.endDate;
                            } else {
                                var interval = quiz.startDate - previousDate;
                                quiz.startDate = moment(nexDate).add(interval, 'ms').format('YYYY-MM-DDTHH:mm:ssZ');
                                previousDate = quiz.endDate;
                                quiz.endDate = moment(quiz.startDate).add(quiz.duration, 'ms').format('YYYY-MM-DDTHH:mm:ssZ');
                                nexDate = quiz.endDate;
                                console.log(interval);
                            }
                            $scope.showExportedQuizzes = true;
                        });
                    }
                };

                $scope.importQuizzes = function () {
                    var objectToSave = {
                        quizzes : $scope.clonedQuizzes,
                        groups : $scope.selectGroups
                    };
                    $scope.responseError = false;
                    QuizService.importQuizzes(objectToSave).then(function () {
                        $state.go('quiz-list');
                    }, function () {
                        $scope.responseError = true;
                    });
                };

                var changeDateModal;
                $scope.open = function (quiz, index) {
                    changeDateModal = $modal.open({
                        animation: true,
                        templateUrl: 'dateModal.html',
                        backdrop: 'static',
                        size: 'sm',
                        windowClass: 'change-date-modal',
                        controller: function ($scope, $modalInstance) {
                            $scope.quiz = _.clone(quiz, true);
                            $scope.close = function () {
                                changeDateModal.dismiss();
                            };

                            $scope.confirm = function () {
                                var date = new Date($scope.quiz.startDate);
                                date.setHours($scope.quiz.hours, $scope.quiz.minutes);
                                $modalInstance.close({'newDate': moment(date).format('YYYY-MM-DDTHH:mm:ssZ'), 'index': index});
                            };
                        }
                    });

                    changeDateModal.result.then(function (result) {
                        var quizz = $scope.clonedQuizzes[result.index];
                        quizz.startDate = result.newDate;
                        quizz.endDate = moment(quiz.startDate).add(quizz.duration, 'ms').format('YYYY-MM-DDTHH:mm:ssZ');
                        $scope.clonedQuizzes.sort($scope.compare);
                    });
                };

            }])
            .directive('ngFloatingScroll', function(){
                return {
                    restrict: 'A',
                    link: function (scope, el){
                        $(el).floatingScroll('init');
                        scope.element = el[0];
                        scope.$watch('element.clientHeight', function(newVal, oldVal) {
                            if (newVal !== oldVal) {
                                $(el).floatingScroll('update');
                            }
                        });
                    }
                };
            });

}(angular, require));
