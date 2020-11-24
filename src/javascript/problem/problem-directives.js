/*global require, angular*/

(function (require, angular) {
    'use strict';

    var problemApp = require('./problem-app');

    angular.module(problemApp.name)

        .directive('thProblemStatus', function () {
            return {
                restrict: 'E',
                templateUrl: 'problem/templates/problem-status.tpl.html',
                scope : {
                    problemStatus : '=?status',
                    withArrowBox: '=?withArrowBox',
                    withCircle: '=?withCircle',
                    direction: '=?direction',
                    withoutPopover: '=?withoutPopover',
                    onQuiz: '=?onQuiz'
                },
                controller : function ($scope) {
                    $scope.status = 'NOT_TRIED';
                    $scope.$watch('problemStatus', function () {
                        if ($scope.problemStatus) {
                            if ($scope.problemStatus === 'CORRECT') {
                                $scope.status = 'CORRECT';
                            } else if($scope.problemStatus === 'WAITING') {
                                $scope.status = 'WAITING';
                            } else {
                                $scope.status = 'WRONG';
                            }
                            $scope.updateViewInfo();
                        }
                    });
                    $scope.updateViewInfo = function () {
                        $scope.class = 'status-not-tried';
                        $scope.icon = '';
                        $scope.popoverMessage = 'problem.notTried';
                        $scope.box = '';

                        if ($scope.status === 'CORRECT') {
                            $scope.class = 'status-correct';
                            $scope.icon = 'glyphicon glyphicon-ok';
                            $scope.popoverMessage = 'problem.solved';
                        } else if ($scope.status === 'WRONG') {
                            $scope.class = 'status-not-correct';
                            $scope.icon = 'glyphicon glyphicon-remove';
                            if ($scope.onQuiz) {
                                $scope.popoverMessage = 'problem.notSolvedInTime';
                            } else {
                                $scope.popoverMessage = 'problem.notCorrect';
                            }
                        } else if ($scope.status === 'WAITING') {
                            if ($scope.onQuiz) {
                                $scope.popoverMessage = 'problem.notSolvedInTime';
                            } else {
                                $scope.popoverMessage = 'submission.status.waiting';
                            }
                        }

                        if ($scope.withArrowBox) {
                            $scope.box = 'problem-status-box';
                        } else if ($scope.withCircle) {
                            $scope.box = 'problem-status-circle';
                        }



                    };
                    $scope.updateViewInfo();
                }

            };
        })
        .directive('thProblemBox', function () {
            return {
                restrict: 'E',
                templateUrl: 'problem/templates/problem-box.tpl.html',
                scope: {
                    problem : '=?problem',
                    showStatus: '=?showStatus',
                    showScore: '=?showScore',
                    showRank: '=?showRank',
                    topics: '=?showTopics',
                    'nolink': '=?nolink',
                    countTestCases: '=?countTestCases',
                    approvedBy: '=?approvedBy',
                    onQuiz: '=?onQuiz',
                    quizId: '=?quizId',
                    locale: '=?locale'
                },
                controller: function ($scope, SecurityService) {
                    SecurityService.requestCurrentUser().then(function (currentUser) {
                        $scope.isAuthenticated = currentUser.isAuthenticated;
                    });
                }
            };
        })

        .directive('thChoiceBox', [
            function () {

                return {
                    restrict: 'E',
                    templateUrl: 'problem/templates/problem-choices-box.tpl.html',

                    scope: {
                        problem: '=?',
                        isAuthenticated: '=?',
                        isSelected: '=?checked',
                        showTopics: '=?',
                        showStatus: '=?',
                        onClickProblem: '&'
                    },

                    link: function (scope, elem, attr) {
                        scope.hasProblemClick = !!attr.onProblemClick;
                        scope.displayInline = true;
                        scope.expand = attr.expand !== 'false';
                    }
                };
            }])

        .directive('thChoiceHeader', [
            function () {
                return {
                    restrict: 'E',
                    templateUrl: 'problem/templates/problem-choices-entry-header.tpl.html'
                };
            }
        ])
        .directive('thChoiceContent', [
            function () {
                return {
                    restrict: 'E',
                    templateUrl: 'problem/templates/problem-choices-entry-content.tpl.html'
                };
            }
        ]).directive('focusIf', function($timeout) {
            function link($scope, $element, $attrs) {
                var dom = $element[0];

                function focus(condition) {
                    if (condition) {
                        $timeout(function() {
                            dom.focus();
                        }, $scope.$eval($attrs.focusDelay) || 0);
                    }
                }

                if ($attrs.focusIf) {
                    $scope.$watch($attrs.focusIf, focus);
                } else {
                    focus(true);
                }

            }
            return {
                restrict: 'A',
                link: link
            };
        });


}(require, angular));