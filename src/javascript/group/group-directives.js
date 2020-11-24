/*global require, angular*/

(function (require, angular) {
    'use strict';

    var groupApp = require('./group-app');

    angular.module(groupApp.name)

        .directive('thGroupUserBox', ['GroupService', 'InstitutionService', function (GroupService, InstitutionService) {
            return {
                restrict: 'E',
                scope: {
                    user: '=?user',
                    isChecked: '=?isChecked',
                    all: '=?all',
                    userRemoved: '=?userRemoved',
                    group: '=?updateGroup',
                    institution: '=?updateInstitution',
                    hideCheckBox: '=?hideCheckBox'
                },
                templateUrl: 'group/templates/group-user-box.tpl.html',
                controller: function ($scope, $timeout) {
                    if ($scope.user.role === 'TEACHER') {
                        $scope.icon = 'group.teacher.icon';
                    } else if ($scope.user.role === 'TEACHER_ASSISTANT') {
                        $scope.icon = 'group.teacher.assistant.icon';
                    }
                    $scope.removeItem = function () {
                        if ($scope.group) {
                            GroupService.removeUserFromGroup($scope.group.id, $scope.user.id).then(function () {
                                $scope.userRemoved[$scope.user.id] = true;
                            });
                        }
                        if ($scope.institution) {
                            InstitutionService.removeUserFromInstitution($scope.institution.id, $scope.user.id).then(function () {
                                $scope.userRemoved[$scope.user.id] = true;
                            });
                        }

                    };
                    $scope.addUser = function () {
                        if ($scope.group) {
                            GroupService.addUsersToGroup($scope.group.id, {
                                users: [{
                                    id: $scope.user.id,
                                    role: $scope.user.role
                                }]
                            }).then(function () {
                                $scope.userRemoved[$scope.user.id] = false;
                                $scope.isChecked[$scope.user.id] = false;
                            });
                        }
                        if ($scope.institution) {
                            InstitutionService.addUserToInstitution($scope.institution.id, {
                                id: $scope.user.id,
                                role: $scope.user.role
                            }).then(function () {
                                $scope.userRemoved[$scope.user.id] = false;
                                $scope.isChecked[$scope.user.id] = false;
                            });
                        }

                    };
                    $scope.updateCheck = function () {
                        $timeout($scope.all);
                    };

                }
            };
        }])
        .directive('thGroupPendencyBox', ['GroupService', function (groupService) {
            return {
                restrict: 'E',
                scope: {
                    user: '=?user',
                    isChecked: '=?isChecked',
                    all: '=?all',
                    userRemoved: '=?userRemoved',
                    userAccepted: '=?userAccepted'
                },
                templateUrl: 'group/templates/group-pendency-box.tpl.html',
                controller: function ($scope, $timeout) {
                    $scope.temp = groupService;
                    if ($scope.user.role === 'TEACHER') {
                        $scope.icon = 'group.teacher.icon';
                    } else if ($scope.user.role === 'TEACHER_ASSISTANT') {
                        $scope.icon = 'group.teacher.assistant.icon';
                    }
                    $scope.removeUser = function () {
                        //groupService.removeUserFromGroup({'userId': $scope.user.user.id, 'groupId': $scope.user.group.id}, function () {
                        $scope.userRemoved[$scope.user.id] = true;
                        $scope.isChecked[$scope.user.id] = false;
                        $scope.$emit('UPDATE_GROUP');
                        //});
                    };
                    $scope.addUser = function () {
                        //groupService.addUserToGroup({userId: $scope.user.user.id, groupId: $scope.user.group.id, role: $scope.user.role}, function () {
                        $scope.userRemoved[$scope.user.id] = false;
                        $scope.userAccepted[$scope.user.id] = true;
                        $scope.isChecked[$scope.user.id] = false;
                        $scope.$emit('UPDATE_GROUP');
                        //});
                    };
                    $scope.revert = function () {
                        //groupService.addUserToGroup({userId: $scope.user.user.id, groupId: $scope.user.group.id, role: $scope.user.role}, function () {
                        $scope.userRemoved[$scope.user.id] = false;
                        $scope.isChecked[$scope.user.id] = false;
                        $scope.$emit('UPDATE_GROUP');
                        //});
                    };
                    $scope.updateCheck = function () {
                        $timeout($scope.all);
                    };

                }
            };
        }]);

}(require, angular));

