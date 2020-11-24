/*global angular, require*/

(function (angular, require) {
    'use strict';

    var topcoderApp = require('./topcoder-app');

    angular.module(topcoderApp.name)

        .controller('topcoderShowController', [
            '$scope',
            'UserService',
            'SecurityService',
            'currentUser',
            function ($scope, UserService, SecurityService, currentUser) {
                $scope.currentUser = currentUser;
                $scope.loading = true;
                $scope.loadingFocused = true;
                $scope.loadingGroup = true;

                $scope.selected = {
                    group: null
                };

                $scope.focusSearch = function () {
                    UserService.getTopCoders({
                        max: 15,
                        focused: true
                    }).then(function (response) {
                        $scope.loadingFocused = false;
                        $scope.focusedTopCoder = response.data;
                    });
                };

                $scope.searchAll = function () {
                    UserService.getTopCoders({
                        max: 30
                    }).then(function (response) {
                        $scope.loading = false;
                        $scope.topCoders = response.data;
                    });
                };

                $scope.groupSearch = function () {
                    $scope.loadingGroup = true;
                    UserService.getTopCoders({
                        max: 100,
                        group: $scope.selected.group.id
                    }).then(function (response) {
                        $scope.loadingGroup = false;
                        $scope.groupTopCoders = response.data;
                    });
                };

                if($scope.currentUser !== null) {
                    if(currentUser && !currentUser.atLeastTeacherAssistant()) {
                        $scope.focusSearch();
                    }
                    $scope.searchAll();
                    if ($scope.currentUser.isAuthenticated()) {
                        UserService.getCurrentUserGroups({ max: 1000 }).then(function (response) {
                            $scope.groups = response.data;
                            $scope.selected.group = $scope.groups[0];
                            $scope.groupSearch();
                        });
                    }
                } else {
                    UserService.getTopCoders({
                        max: 15,
                        focused: true
                    }).then(function (response) {
                        $scope.loading = false;
                        $scope.topCoders = response.data;
                    });
                }
            }
        ]);

}(angular, require));
