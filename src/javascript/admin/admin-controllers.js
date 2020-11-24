/*global angular, require, moment*/

(function (require, angular) {
    'use strict';

    var adminApp = require('./admin-app');

    angular.module(adminApp.name)

        .controller('AdminReevaluateController', [
            '$scope',
            'SubmissionService',
            'ProblemService',
            function ($scope, submissionService, problemService) {
                $scope.evaluation = '';
                $scope.showReevaluations  = false;
                $scope.evaluationsCount = '';
                $scope.evaluationsErrors = '';
                $scope.searchParams = {
                    evaluations: [],
                    submissionDateGe: '',
                    submissionDateLe: ''
                };
                $scope.problem = '';
                $scope.evaluationList = {
                    'ALL': 'submission.status.all',
                    'CORRECT': 'submission.status.correct',
                    'WRONG_ANSWER': 'submission.status.wrongAnswer',
                    'RUNTIME_ERROR': 'submission.status.runtimeError',
                    'COMPILATION_ERROR': 'submission.status.compilationError',
                    'EMPTY_ANSWER': 'submission.status.emptyAnswer',
                    'TIME_LIMIT_EXCEDEED': 'submission.status.timeLimitExceed',
                    'WAITING': 'submission.status.waiting',
                    'PRESENTATION_ERROR': 'submission.status.presentationError'
                };

                $scope.runReevaluate = function () {
                    if (!!$scope.searchParams.submissionDateGe) {
                        $scope.searchParams.submissionDateGe = moment($scope.searchParams.submissionDateGe).format('YYYY-MM-DDTHH:mm:ssZ');
                    }
                    if (!!$scope.searchParams.submissionDateLe) {
                        $scope.searchParams.submissionDateLe = moment($scope.searchParams.submissionDateLe).format('YYYY-MM-DDTHH:mm:ssZ');
                    }
                    $scope.searchParams.evaluations = [];
                    if ($scope.evaluation !== 'ALL') {
                        $scope.searchParams.evaluations.push($scope.evaluation);
                    }

                    $scope.reevaluateByProblem($scope.problem[0].id, $scope.searchParams);

                };


                $scope.reevaluateByProblem = function (problemId, params) {
                    submissionService.reevaluateByProblem(problemId, params).then(
                        function (response) {
                            $scope.evaluationsCount = response.data.total;
                            $scope.evaluationsErrors = response.data.errorCount;
                            $scope.showReevaluations = true;
                        }
                    );
                };

                $scope.search = function () {
                    problemService.list({ q : $scope.searchParams.problem}).then(
                        function (response) {
                            $scope.problems = response.data;
                        }
                    );
                };

            }
        ])

        .controller('AdminSubmissionShowController', [
            '$scope',
            'submission',
            'SubmissionService',
            'problem',
            'ProblemService',
            function ($scope, submission, SubmissionService, problem, ProblemService) {
                $scope.submission = submission;
                $scope.problem = problem;
                $scope.showDiff = false;
                if(submission.evaluation === 'WRONG_ANSWER') {
                    ProblemService.getTestCase(submission.problem.id, submission.testCase.id).then(
                        function (response) {
                            if(response.data.tip !== null) {
                                $scope.showTip = true;
                                $scope.tip = response.data.tip;
                            }
                            if(response.data.input !== null) {
                                $scope.showDiff = true;
                                $scope.input = response.data.input;
                            }
                        }
                    );
                }
                if (submission !== undefined) {
                    SubmissionService.getSubmissionCode(submission.id).then(
                        function (response) {
                            submission.code = response.data;
                            submission.mode = 'c_cpp';
                            if (submission.language.name === 'Java') {
                                submission.mode = 'java';
                            } else if (submission.language.name === 'Python') {
                                submission.mode = 'python';
                            } else if (submission.language.name === 'Pascal') {
                                submission.mode = 'pascal';
                            }
                        },
                        function () {
                            submission.code = 'Code Not Found';
                        }
                    );
                }

            }
        ])

        .controller('TopicsController', [
            '$scope',
            'TopicService',
            '$state',
            function ($scope, topicService, $state) {
                $scope.$state = $state;
                var delay;

                delay = (function () {
                    var timer = 0;
                    return function (callback, ms) {
                        clearTimeout(timer);
                        timer = setTimeout(callback, ms);
                    };
                }());
                $scope.loading = true;
                $scope.paginationData = {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 0,
                    max: 10,
                    offset: 0,
                    sort: ''
                };

                $scope.toEditParams = {
                    name: '',
                    id: ''
                };

                $scope.searchParams = {
                    q : ''
                };

                $scope.search = function () {
                    $scope.loading = true;
                    $scope.searched = true;
                    topicService.list({q: $scope.searchParams.q,
                        max: $scope.paginationData.max,
                        offset: $scope.paginationData.offset}).then(function (response) {
                        $scope.topics = response.data;
                        $scope.paginationData.totalItems  = response.headers('total') || 0;
                        $scope.loading = false;
                    });
                };
                $scope.doSearch = function () {
                    delay(function () {
                        $scope.search();
                    }, 200);
                };

                $scope.search();

                $scope.paginationChanged = function () {
                    $scope.paginationData.offset = ($scope.paginationData.currentPage - 1) * $scope.paginationData.max;
                    $scope.search();
                };

                $scope.deleteTopic = function (id) {
                    topicService.remove(id).then(
                        function () {
                            $scope.search();
                        }
                    );
                };
            }
        ])

        .controller('TopicsCreateController', [
            '$scope',
            'TopicService',
            '$state',
            function ($scope, topicService, $state) {
                $scope.$state = $state;
                $scope.topicName = '';
                $scope.searched = false;
                $scope.topicSaved = false;
                $scope.sendTopic = function () {
                    $scope.topicSaved = false;
                    topicService.save({name: $scope.topicName}).then(
                        function () {
                            $scope.topicSaved = true;
                        },
                        function () {
                            $scope.searched = true;
                        }
                    );
                };
            }
        ])

        .controller('TopicsEditController', [
            '$scope',
            'TopicService',
            'topic',
            '$state',
            function ($scope, topicService, topic, $state) {
                $scope.$state = $state;
                $scope.searched = false;
                $scope.editTopic = true;
                $scope.topicName = topic.name;
                $scope.topicSaved = false;
                $scope.usedTopic = true;
                $scope.sendTopic = function () {
                    $scope.searched = false;
                    topicService.put(topic.id, {
                        name: $scope.topicName
                    }).then(
                        function () {
                            $scope.topicSaved = true;
                            $scope.search();
                        },
                        function () {
                            $scope.searched = true;
                            $scope.topicSaved = false;
                        }
                    );
                };
            }
        ])

        .controller('AdminController', [
            '$scope',
            '$state',
            'SubmissionService',
            'TopicService',
            'LanguageService',
            function ($scope, $state, submissionService, topicService, languageService) {
                $scope.$state = $state;
                $scope.idSubmission = '';
                $scope.idTopic = '';
                $scope.idLanguage = '';
                $scope.usedTopic = true;
                submissionService.list({
                    sort: 'submissionDate',
                    order: 'desc',
                    max: 1,
                    problem: [],
                    user: []
                }).then(function (response) {
                    $scope.idSubmission = response.data[0].id;
                });
                topicService.list({order: 'desc', max: 1}
                    ).then(function (response) {
                    $scope.idTopic = response.data[0].id;
                });
                languageService.list({order: 'desc', max: 1}
                    ).then(function (response) {
                    $scope.idLanguage = response.data[0].id;
                });
            }
        ]);
}(require, angular));
