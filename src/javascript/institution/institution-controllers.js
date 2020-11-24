/*global require, angular, _*/

(function (require, angular) {
    'use strict';

    var adminApp = require('../admin/admin-app');

    angular.module(adminApp.name)

        .controller('InstitutionCreateController', [
            '$scope',
            'InstitutionService',
            '$stateParams',
            'PendencyService',
            'currentUser',
            function ($scope, InstitutionService, $stateParams, pendencyService, currentUser) {
                $scope.form = {
                    institutionName: $stateParams.institutionName,
                    acronym: '',
                    maxLength: 255,
                    maxAcronymLength: 20
                };
                $scope.showResult = false;
                $scope.hasError = true;

                $scope.instValidate = function () {
                    var newInstitution = {
                        name: $scope.form.institutionName,
                        acronym: $scope.form.acronym
                    };
                    InstitutionService.instValidate(newInstitution).then(function() {
                        $scope.createInstitutionForm.name.$setValidity('unique', true);
                    }, function (response) {
                        $scope.createInstitutionForm.name.$setValidity('unique', true);
                        _.each(response.data.errors, function (it) {
                            if(it.code === 304011) {
                                $scope.createInstitutionForm.name.$setValidity('unique', false);
                            }
                        });
                    });
                };

                $scope.sendInstitution = function () {
                    if (!$scope.createInstitutionForm.$valid) {
                        _(_.keys($scope.createInstitutionForm)).forEach(function (field) {
                            if (field[0] !== '$') {
                                $scope.createInstitutionForm[field].$setDirty();
                            }
                        });
                    } else {
                        var newInstitution = {
                            name: $scope.form.institutionName,
                            acronym: $scope.form.acronym
                        };
                        InstitutionService.save(newInstitution).then(
                            function (response) {
                                var newPendency = {user: currentUser,
                                    institution: response.data,
                                    group: [],
                                    kind : 'INSTITUTION_APPROVAL'
                                };
                                pendencyService.save(newPendency).then(
                                    function () {
                                        $scope.hasError = false;
                                        $scope.showResult = true;
                                    },
                                    function () {
                                        $scope.hasError = true;
                                        $scope.showResult = true;
                                    }
                                );
                            },
                            function () {
                                $scope.hasError = true;
                                $scope.showResult = true;
                            }
                        );
                    }
                };
            }
        ])

        .controller('InstitutionShowController', [
            '$scope',
            'institution',
            'apiURL',
            '$state',
            'currentUser',
            '$timeout',
            'Page',
            function ($scope, institution, apiURL, $state, currentUser, $timeout, Page) {
                $scope.institution = institution;
                $timeout(function() {
                    if($scope.institution.acronym) {
                        Page.setTitle($scope.institution.acronym);
                    } else {
                        Page.setTitle($scope.institution.name);
                    }
                });
                $scope.apiURL = apiURL;
                $scope.$state = $state;
                $scope.currentUser = currentUser;
            }
        ])

        .controller('InstitutionShowStudentsController', [
            '$scope',
            'InstitutionService',
            'institution',
            function ($scope, InstitutionService, institution) {

                $scope.institution = institution;

                $scope.paginationData = {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 0,
                    max: 10,
                    offset: 0
                };

                $scope.searchParams = {
                    'order' : 'asc',
                    'sort' : 'name'
                };

                $scope.search = function () {
                    InstitutionService.getStudents($scope.institution.id, {
                        max: $scope.paginationData.max,
                        offset: $scope.paginationData.offset,
                        sort: $scope.searchParams.sort,
                        order: $scope.searchParams.order
                    }).then(
                        function (response) {
                            $scope.students = response.data;
                            $scope.paginationData.totalItems  = response.headers('total') || 0;
                        }
                    );
                };
                $scope.search();
            }
        ])

        .controller('InstitutionShowUsersController', [
            '$scope',
            'InstitutionService',
            'institution',
            'paginationData',
            '$location',
            'usSpinnerService',
            'currentUser',
            'role',
            function ($scope, InstitutionService, institution, paginationData, $location, usSpinnerService, currentUser, role) {
                $scope.role = role;
                $scope.currentUser = currentUser;
                $scope.institution = institution;
                $scope.selectedAll = false;
                $scope.userList = [];
                $scope.userSelected = [];
                $scope.userRemoved = [];
                $scope.paginationData = paginationData;
                $scope.searched = false;
                $scope.searchParams = {};
                $scope.search = function () {
                    usSpinnerService.spin('spinner');
                    InstitutionService.getUsers($scope.institution.id, {
                        max: $scope.paginationData.itemsPerPage,
                        offset: ($scope.paginationData.currentPage - 1) * $scope.paginationData.itemsPerPage,
                        role: $scope.role
                    }).then(function (request) {
                        $scope.userList = request.data;
                        $scope.paginationData.totalItems = request.headers('total') || 0;
                        _(request.data).forEach(function (it) {
                            $scope.userSelected[it.id] = false;
                            $scope.userRemoved[it.id] = false;
                        });
                        $location.search({page: $scope.paginationData.currentPage});
                        $scope.searched = true;
                        usSpinnerService.stop('spinner');
                    }, function () {
                        usSpinnerService.stop('spinner');
                    });
                };

                $scope.search();


                $scope.pageChanged = function () {
                    $scope.search();
                };

                $scope.selectAll = function () {
                    _(_.keys($scope.userSelected)).forEach(function (it) {
                        if (!$scope.userRemoved[it]) {
                            $scope.userSelected[it] = $scope.searchParams.selectedAll;
                        }
                    });
                };

                $scope.searchParams.checkSelectAll = function () {
                    $scope.searchParams.selectedAll = _.values($scope.userSelected).indexOf(true) !== -1;
                };

                $scope.removeAll = function () {
                    _(_.keys($scope.userSelected)).forEach(function (it) {
                        if ($scope.userSelected[it]) {
                            InstitutionService.removeUserFromInstitution($scope.institution.id, it).then(function () {
                                $scope.userRemoved[it] = true;
                                $scope.userSelected[it] = false;
                            });
                        }
                    });
                };

            }])

        .controller('InstitutionAddMembersController', [
            '$scope',
            'InstitutionService',
            function ($scope, InstitutionService) {
                $scope.userList = [];
                $scope.addMap = {users: []};
                $scope.saved = false;
                $scope.error = false;
                $scope.roleList = {
                    'TEACHER': 'institution.teacher',
                    'ADMIN_INST': 'institution.adminInst'
                };
                $scope.inviteUsers = function () {
                    _($scope.userList).forEach(function (it) {
                        if (it.id === undefined) {
                            if (it.valid === true) {
                                $scope.addMap.users.push({email: it.email, role: $scope.role});
                            }
                        } else {
                            $scope.addMap.users.push({id: it.id, role: $scope.role});
                        }
                    });
                    InstitutionService.addUsersToInstitution($scope.institution.id, $scope.addMap).then(function () {
                        $scope.userList = [];
                        $scope.saved = true;
                        $scope.error = false;
                    }, function () {
                        $scope.saved = false;
                        $scope.error = true;
                    });

                };
            }
        ])

        .controller('InstitutionShowTeachersAssistantsController', [
            '$scope',
            'InstitutionService',
            'institution',
            function ($scope, InstitutionService, institution) {

                $scope.institution = institution;

                $scope.paginationData = {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 0,
                    max: 10,
                    offset: 0
                };

                $scope.searchParams = {
                    'order' : 'asc',
                    'sort' : 'name'
                };

                $scope.search = function () {
                    InstitutionService.getTeachersAssistants($scope.institution.id, {
                        max: $scope.paginationData.max,
                        offset: $scope.paginationData.offset,
                        sort: $scope.searchParams.sort,
                        order: $scope.searchParams.order
                    }).then(
                        function (response) {
                            $scope.teachersAssistants = response.data;
                            $scope.paginationData.totalItems  = response.headers('total') || 0;
                        }
                    );
                };
                $scope.search();
            }
        ])

        .controller('InstitutionShowGroupsController', [
            '$scope',
            'InstitutionService',
            'institution',
            function ($scope, InstitutionService, institution) {

                $scope.institution = institution;

                $scope.paginationData = {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 0,
                    max: 10,
                    offset: 0
                };

                $scope.searchParams = {
                    'order' : 'desc',
                    'sort' : 'name'
                };

                $scope.search = function () {
                    InstitutionService.getGroups($scope.institution.id, {
                        max: $scope.paginationData.max,
                        offset: $scope.paginationData.offset,
                        sort: $scope.searchParams.sort,
                        order: $scope.searchParams.order
                    }).then(
                        function (response) {
                            $scope.groups = response.data;
                            $scope.paginationData.totalItems  = response.headers('total') || 0;
                        }
                    );
                };
                $scope.search();

                $scope.paginationChanged = function () {
                    $scope.paginationData.offset = ($scope.paginationData.currentPage - 1) * $scope.paginationData.max;
                    $scope.search();
                };
            }
        ])

        .controller('InstitutionEditController', [
            '$scope',
            'InstitutionService',
            'institution',
            '$modal',
            function ($scope, InstitutionService, institution, $modal) {
                $scope.institution = institution;
                $scope.saved = false;
                $scope.enableConfirm = false;
                $scope.avatar = $scope.institution.logo + '?width=330';

                $scope.cropper = {
                    sourceImage : $scope.avatar,
                    croppedImage : null,
                    open : false
                };

                var delay = (function () {
                    var timer = 0;

                    return function (callback, ms) {
                        clearTimeout(timer);
                        timer = setTimeout(callback, ms);
                    };
                }());

                $scope.form = {
                    institutionName: $scope.institution.name,
                    acronym: $scope.institution.acronym,
                    avatar : $scope.cropper.croppedImage,
                    maxLength: 255,
                    maxAcronymLength: 20
                };

                $scope.instValidate = function () {
                    if($scope.form.institutionName === $scope.institution.name) {
                        $scope.checkChanges();
                    } else {
                        var newInstitution = {
                            name: $scope.form.institutionName,
                            acronym: $scope.form.acronym
                        };
                        delay(function () {
                            InstitutionService.instValidate(newInstitution).then(function() {
                                $scope.editProfileForm.name.$setValidity('unique', true);
                            }, function (response) {
                                $scope.editProfileForm.name.$setValidity('unique', true);
                                if ($scope.form.institutionName === $scope.institution.name) {
                                    $scope.checkChanges();
                                } else {
                                    _.each(response.data.errors, function (it) {
                                        if(it.code === 304011) {
                                            $scope.editProfileForm.name.$setValidity('unique', false);
                                        }
                                    });
                                    $scope.checkChanges();
                                }
                            });

                        }, 200);
                    }
                };

                $scope.checkChanges= function() {
                    if($scope.editProfileForm.$valid) {
                        if($scope.editProfileForm.name.$dirty && $scope.form.institutionName !== $scope.institution.name) {
                            $scope.enableConfirm = true;
                        } else if($scope.editProfileForm.acronym.$dirty && $scope.form.acronym !== $scope.institution.acronym) {
                            $scope.enableConfirm = true;
                        } else {
                            $scope.enableConfirm = false;
                        }
                    } else {
                        $scope.enableConfirm = false;
                    }
                };

                $scope.sendInstitution = function () {
                    InstitutionService.put($scope.institution.id, {name: $scope.form.institutionName,
                        acronym: $scope.form.acronym
                        }).then(function (response) {
                            $scope.institution = response.data;
                            $scope.enableConfirm = false;
                            $scope.saved = true;
                    });
                };

                $scope.sendImage = function (files) {
                    var formData = new FormData();
                    $scope.cropper.croppedImage = files[files.length - 1];
                    $scope.$apply();
                    formData.append('file', $scope.cropper.croppedImage);
                    $scope.loading = true;
                    InstitutionService.sendImage($scope.institution.id, formData).then(function (response) {
                        $scope.loading = false;
                        $scope.cropper.croppedImage = response.data._links.self;
                        $scope.imageName = response.data.name;
                        $scope.cropper.open = true;
                        $scope.imageError = null;
                        $scope.open();
                    }, function (response) {
                        $scope.imageName = null;
                        $scope.loading = false;
                        _.each(response.data.errors, function (error) {
                            $scope.imageError = error.code;
                        });
                    });
                };

                $scope.open = function () {
                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: 'institutionModal.html',
                        controller: 'institutionModal',
                        backdrop: 'static',
                        resolve: {
                            image: function () {
                                return $scope.cropper.croppedImage;
                            },
                            onload: function () {
                                return $scope.loading;
                            }
                        }
                    });

                    modalInstance.result.then(function (data) {
                        $scope.data = data;
                        InstitutionService.cropImage($scope.institution.id, {
                            filename: $scope.imageName,
                            x: $scope.data.x,
                            y: $scope.data.y,
                            width: $scope.data.width,
                            height: $scope.data.height
                        }).then(function (response) {
                            $scope.cropper.sourceImage = response.data.logo;
                        });
                        $scope.loading = false;
                        $scope.imageName = null;
                    }, function () {
                        $scope.loading = false;
                        $scope.imageName = null;
                    });
                };
            }
        ])

        .controller('institutionModal', [
            '$scope',
            'image',
            'onload',
            '$modalInstance',
            function ($scope, image, onload, $modalInstance) {
                $scope.image = image;
                $scope.onload = onload;


                $scope.ok = function () {
                    $scope.data = angular.element('#cropper').cropper('getData');
                    $modalInstance.close($scope.data);
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }
        ])

        .controller('InstitutionListController', [
            '$scope',
            'InstitutionService',
            'searchParams',
            'paginationData',
            '$location',
            function ($scope, InstitutionService, searchParams, paginationData, $location) {
                $scope.paginationData = paginationData;
                $scope.searchParams = searchParams;
                $scope.searched = false;
                var errorFunction, successFunction, delay;

                delay = (function () {
                    var timer = 0;
                    return function (callback, ms) {
                        clearTimeout(timer);
                        timer = setTimeout(callback, ms);
                    };
                }());

                successFunction =  function (response) {
                    $scope.institutions = response.data;
                    $scope.paginationData.totalItems  = response.headers('total') || 0;
                    $scope.searched = true;
                    $scope.searchParams.page = $scope.paginationData.currentPage;
                    $location.search($scope.searchParams);
                    $scope.loading = false;
                };

                errorFunction = function () {
                    $scope.loading = false;
                };

                $scope.searchByName = function () {
                    delay(function () {
                        $scope.paginationData.currentPage = 1;
                        $scope.search();
                    }, 200);

                };

                $scope.approveStatus = function (institution) {
                    InstitutionService.changeStatus(institution.id, {status: 'APPROVED'}).then(
                        function () {
                            institution.status = 'APPROVED';
                        }
                    );
                };

                $scope.rejectStatus = function (institution) {
                    InstitutionService.changeStatus(institution.id, {status: 'REJECTED'}).then(
                        function () {
                            institution.status = 'REJECTED';
                        }
                    );
                };
                $scope.setStatusPending = function (institution) {
                    InstitutionService.changeStatus(institution.id, {status: 'PENDING'}).then(
                        function () {
                            institution.status = 'PENDING';
                        }
                    );
                };

                $scope.search = function () {
                    var searchParams = _.clone($scope.searchParams, true);
                    $scope.loading = true;
                    searchParams.offset = ($scope.paginationData.currentPage - 1) * $scope.paginationData.itemsPerPage;
                    searchParams.max = $scope.paginationData.itemsPerPage;
                    searchParams.page = undefined;
                    searchParams.all = undefined;
                    if ($scope.searchParams.all) {
                        InstitutionService.list(searchParams).then(successFunction, errorFunction);
                    } else {
                        InstitutionService.listUserInstitutions(searchParams).then(successFunction, errorFunction);
                    }
                };

                $scope.pageChanged = function () {
                    $scope.search();
                };

                $scope.search();
            }
        ]);
}(require, angular));
