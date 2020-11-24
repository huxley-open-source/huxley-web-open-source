/*global angular, require, moment,  _*/

(function (angular, require) {
    'use strict';

    var submissionApp = require('./submission-app');

    angular.module(submissionApp.name)

        .controller('SubmissionListController', [
            '$scope',
            'SubmissionService',
            'searchParams',
            'paginationData',
            '$location',
            'currentUser',
            function ($scope, SubmissionService, searchParams, paginationData, $location, currentUser){
                $scope.currentUser = currentUser;
                $scope.problemList = [];
                $scope.loading = false;

                $scope.problemDropdown = false;
                $scope.searchParams = searchParams[0];
                if ($scope.currentUser.atLeastAdmin()) {
                    $scope.searchParams.user = searchParams[1];
                }

                $scope.paginationData = paginationData;
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

                $scope.list = function () {
                    if (!!$scope.searchParams.submissionDateGe) {
                        $scope.searchParams.submissionDateGe = moment($scope.searchParams.submissionDateGe).format('YYYY-MM-DDTHH:mm:ssZ');
                    }
                    if (!!$scope.searchParams.submissionDateLe) {
                        $scope.searchParams.submissionDateLe = moment($scope.searchParams.submissionDateLe).format('YYYY-MM-DDTHH:mm:ssZ');
                    }

                    var searchParams = _.clone($scope.searchParams, true);
                    searchParams.offset = ($scope.paginationData.currentPage - 1) * $scope.paginationData.itemsPerPage;
                    searchParams.max = $scope.paginationData.itemsPerPage;
                    searchParams.page = undefined;

                    if (searchParams.problem[0]) {
                        searchParams.problem = searchParams.problem[0].id;
                    }

                    if (searchParams.evaluations === 'ALL') {
                        delete searchParams.evaluations;
                    }

                    $scope.loading = true;
                    if ($scope.currentUser.atLeastAdmin()) {
                        if (searchParams.user[0]) {
                            searchParams.user = searchParams.user[0].id;
                        }
                        SubmissionService.list(searchParams).then(function (response) {
                            $scope.paginationData.totalItems = response.headers('total') || 0;
                            $scope.submissions = response.data;

                            $scope.searched = true;
                            $scope.searchParams.page = $scope.paginationData.currentPage;

                            $scope.loading = false;

                            searchParams.offset = undefined;
                            searchParams.max = undefined;
                            searchParams.page = $scope.paginationData.currentPage;
                            $location.search(searchParams);
                        }, function () {
                            $scope.loading = false;
                        });
                    } else {
                        SubmissionService.listUserSubmissions(searchParams).then(function (response) {
                            $scope.paginationData.totalItems = response.headers('total') || 0;
                            $scope.submissions = response.data;

                            $scope.searched = true;
                            $scope.searchParams.page = $scope.paginationData.currentPage;

                            $scope.loading = false;

                            searchParams.offset = undefined;
                            searchParams.max = undefined;
                            searchParams.page = $scope.paginationData.currentPage;
                            $location.search(searchParams);

                        }, function () {
                            $scope.loading = false;
                        });
                    }

                };

                $scope.paginationChanged = function () {
                    $scope.list();
                };

                $scope.reevaluateOne = function (submission) {
                    SubmissionService.reevaluateOne(submission.id).then(
                        function () {
                            submission.evaluation = 'WAITING';
                        }
                    );
                };

                $scope.list();

            }]);

}(angular, require));