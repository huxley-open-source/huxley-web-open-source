/*global require, angular*/

(function (require, angular) {
    'use strict';

    var componentsApp = require('./submission-app');

    angular.module(componentsApp.name)

        .directive('thSubmissionStatus', function ($timeout) {
            return {
                restrict: 'E',
                scope: {
                    submission: '=?submission'
                },
                transclude: true,
                templateUrl: 'submission/templates/submission-status.tpl.html',
                link: function(scope) {
                    scope.lookForReevaluation = true;
                    scope.$on('$destroy', function() {
                        scope.lookForReevaluation = false;
                    });
                },
                controller: function ($scope, SubmissionService) {
                    $scope.class = 'img-small-alert';
                    $scope.msg = '';
                    $scope.backgroundImg = '  background-img';
                    $scope.updatingStatus = false;
                    $scope.updateStatus = function () {
                        if ($scope.submission.evaluation === 'WAITING' && !$scope.updatingStatus) {
                            $scope.updatingStatus = true;
                            SubmissionService.getEvaluation($scope.submission.id).then(function(response) {
                                $scope.updatingStatus = false;
                                if (response.data.evaluation === 'WAITING' && $scope.lookForReevaluation) {
                                    $timeout($scope.updateStatus, 10000);
                                } else {
                                    $scope.submission.evaluation = response.data.evaluation;
                                }
                            });

                        }
                    };
                    $scope.$watch('submission.evaluation', function () {
                        if ($scope.submission !== undefined) {
                            if ($scope.submission.evaluation === 'WAITING') {
                                $scope.class = 'img-medium-submission-waiting';
                                $scope.msg = 'submission.status.waiting';
                                $scope.updateStatus();
                            } else if ($scope.submission.evaluation === 0 || $scope.submission.evaluation === 'CORRECT') {
                                $scope.class = 'img-medium-submission-correct';
                                $scope.msg = 'submission.status.correct';
                            } else if ($scope.submission.evaluation === 1 || $scope.submission.evaluation === 'WRONG_ANSWER') {
                                $scope.class = 'img-medium-submission-wrong-answer';
                                $scope.msg = 'submission.status.wrongAnswer';
                            } else if ($scope.submission.evaluation === 2 || $scope.submission.evaluation === 'RUNTIME_ERROR') {
                                $scope.class = 'img-medium-submission-runtime-error';
                                $scope.msg = 'submission.status.runtimeError';
                            } else if ($scope.submission.evaluation === 3 || $scope.submission.evaluation === 'COMPILATION_ERROR') {
                                $scope.class = 'img-medium-submission-compilation-error';
                                $scope.msg = 'submission.status.compilationError';
                            } else if ($scope.submission.evaluation === 4 || $scope.submission.evaluation === 'EMPTY_ANSWER') {
                                $scope.class = 'img-medium-submission-empty-answer';
                                $scope.msg = 'submission.status.emptyAnswer';
                            } else if ($scope.submission.evaluation === 5 || $scope.submission.evaluation === 'TIME_LIMIT_EXCEEDED') {
                                $scope.class = 'img-medium-submission-time-limit-exceeded';
                                $scope.msg = 'submission.status.timeLimitExceeded';
                            } else if ($scope.submission.evaluation === 6 || $scope.submission.evaluation === 'WAITING') {
                                $scope.class = 'img-medium-submission-waiting';
                                $scope.msg = 'submission.status.waiting';
                            } else if ($scope.submission.evaluation === 7 || $scope.submission.evaluation === 'EMPTY_TEST_CASE') {
                                $scope.class = 'img-medium-submission-empty-test-case';
                                $scope.msg = 'submission.status.emptyTestCase';
                                $scope.backgroundImg = '  new-submission-img';
                            } else if ($scope.submission.evaluation === 8 || $scope.submission.evaluation === 'WRONG_FILE_NAME') {
                                $scope.class = 'img-medium-submission-wrong-file-name';
                                $scope.msg = 'submission.status.wrongFileName';
                                $scope.backgroundImg = '  new-submission-img';
                            } else if ($scope.submission.evaluation === 9 || $scope.submission.evaluation === 'PRESENTATION_ERROR') {
                                $scope.class = 'img-medium-submission-presentation-error';
                                $scope.msg = 'submission.status.presentationError';
                                $scope.backgroundImg = '  new-submission-img';
                            } else if ($scope.submission.evaluation === 10 || $scope.submission.evaluation === 'HUXLEY_ERROR') {
                                //$scope.class = 'img-small-alert';
                                $scope.class = 'img-medium-submission-huxley-error';
                                $scope.msg = 'submission.status.huxleyError';
                                $scope.backgroundImg = '  new-submission-img';
                            }
                        }

                        $scope.class += $scope.backgroundImg;
                    });
                    /*$scope.$on('USER_SUBMISSION_STATUS', function (event, message) {
                        var submission = message.body.submission;
                        if ($scope.submission.id === submission.id) {
                            $scope.submission.evaluation = submission.evaluation;
                            $scope.$apply();
                        }
                    });*/

                }
            };
        });

}(require, angular));