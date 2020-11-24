/*global require, angular*/

(function (require, angular) {
    'use strict';

    var adminApp = require('../admin/admin-app');

    angular.module(adminApp.name)

        .controller('PendencyAddController', [
            '$scope',
            'PendencyService',
            function ($scope,  PendencyService) {


                $scope.searchParams = {
                    userToSearch : '',
                    groupToSearch : '',
                    institutionToSearch : '',
                    max : 5
                };


                $scope.checkKind = function () {
                    if ($scope.toEditParams.pendencyKind === 'INSTITUTION_DOCUMENT' || $scope.toEditParams.pendencyKind === 'INSTITUTION_APPROVAL' || $scope.toEditParams.pendencyKind === 'TEACHER_DOCUMENT' || $scope.toEditParams.pendencyKind === 'TEACHER_APPROVAL') {
                        return 'INSTITUTION';
                    }
                    if ($scope.toEditParams.pendencyKind === 'USER_GROUP_INVITATION' || $scope.toEditParams.pendencyKind === 'USER_GROUP_JOIN_REQUEST') {
                        return 'GROUP';
                    }
                    return false;

                };

                $scope.sendPendency = function () {
                    var newPendency = {user: $scope.toEditParams.user[0],
                        institution: $scope.toEditParams.institution[0],
                        kind: $scope.toEditParams.pendencyKind,
                        group: $scope.toEditParams.group[0]
                        };
                    PendencyService.save(newPendency);
                };

                $scope.toEditParams = {
                    institution : {},
                    group : {},
                    user : {},
                    pendencyKind : 'INSTITUTION_DOCUMENT'
                };

            }
        ])

        .controller('PendencyController', [
            '$scope',
            'PendencyService',
            '$timeout',
            'kind',
            'institution',
            function ($scope, PendencyService, $timeout, kind, institution) {

                var filterTextTimeoutPromise;
                $scope.kind = kind;
                $scope.institution = institution;
                $scope.loading = true;
                $scope.status = '';
                $scope.paginationData = {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 0,
                    max: 10,
                    offset: 0
                };

                $scope.searchParams = {
                    'order' : 'asc',
                    'sort' : 'status',
                    'q' : ''
                };

                $scope.approveStatus = function (pendency) {
                    PendencyService.put(pendency.id, {status: 'APPROVED'}).then(
                        function () {
                            pendency.status = 'APPROVED';
                        }
                    );
                };

                $scope.rejectStatus = function (pendency) {
                    PendencyService.put(pendency.id, {status: 'REJECTED'}).then(
                        function () {
                            pendency.status = 'REJECTED';
                        }
                    );
                };
                $scope.setStatusPending = function (pendency) {
                    PendencyService.put(pendency.id, {status: 'PENDING'}).then(
                        function () {
                            pendency.status = 'PENDING';
                        }
                    );
                };

                $scope.search = function () {
                    if ($scope.kind === 'INSTITUTION_APPROVAL') {
                        $scope.status = 'PENDING';
                    }
                    if ($scope.kind === 'TEACHER_APPROVAL') {
                        $scope.searchParams.institution = $scope.institution;
                    }
                    PendencyService.list({
                        max: $scope.paginationData.max,
                        offset: $scope.paginationData.offset,
                        order: $scope.searchParams.order,
                        q : $scope.searchParams.q,
                        kind : $scope.kind,
                        sort : $scope.searchParams.sort,
                        status: $scope.status,
                        institution : $scope.institution.id
                    }).then(
                        function (response) {
                            $scope.pendencies = response.data;
                            $scope.paginationData.totalItems  = response.headers('total') || 0;
                            $scope.loading = false;
                        }
                    );
                };

                $scope.searchAll = function () {
                    if (filterTextTimeoutPromise) {
                        $timeout.cancel(filterTextTimeoutPromise);
                    }
                    // só faz a busca depois de algum tempo
                    filterTextTimeoutPromise = $timeout(function () {
                        $scope.search();
                    }, 500);
                };

                $scope.paginationChanged = function () {
                    $scope.paginationData.offset = ($scope.paginationData.currentPage - 1) * $scope.paginationData.max;
                    $scope.search();
                };

                $scope.search();

            }
        ]);

}(require, angular));