/*global angular, require, moment, d3,  _*/

(function (angular, require) {
    'use strict';

    var userApp = require('./user-app');

    angular.module(userApp.name)

        .controller('ProfileShowController', [
            '$scope',
            '$state',
            'profileUser',
            'currentUser',
            'UserService',
            '$stateParams',
            '$interval',
            'Page',
            '$timeout',
            '$translate',
            function ($scope, $state, profileUser, currentUser, UserService, $stateParams, $interval, Page, $timeout, $translate) {
                $timeout(function() {
                    Page.setTitle(profileUser.data.name);
                });
                $scope.loading = true;
                $scope.slider = 0;
                $scope.canSlide = true;
                $interval(function () {
                    if ($scope.canSlide) {
                        $scope.slider = ($scope.slider + 1) % 2;
                    }
                }, 7000);

                $scope.stopSlide = function () {
                    $scope.canSlide = false;
                };

                $scope.continueSlide = function () {
                    $scope.canSlide = true;
                };

                $scope.rightSlide = function () {
                    $scope.slider = ($scope.slider + 1) % 2;
                };

                $scope.leftSlide = function () {
                    $scope.slider = Math.abs(($scope.slider + 2) % 2);
                };

                $scope.currentUser = currentUser;
                $scope.profileUser = profileUser.data;

                $scope.profileUser.bigAvatar = $scope.profileUser.avatar.replace('thumbs/', '');

                console.log($scope.profileUser.bigAvatar);
                $scope.$state = $state;
                $scope.graphsControl = {
                    current : 'TOPICS_GRAPH'
                };
                $scope.profileNd = {};
                $scope.profileTopics = {};
                $scope.profileSolvedNd = {};

                $scope.getProfileChartInfo = function () {
                    var userId = currentUser.id;
                    if ($stateParams.id) {
                        userId = $stateParams.id;
                    } else {
                        $scope.profileUser = currentUser;
                     }
                    UserService.getProfileUser(userId).then(
                        function (response) {
                            if (response.data.status === 'building') {
                                $scope.loading = 'building';
                                $timeout($scope.getProfileChartInfo, 5000);
                            } else {
                                $scope.fillGraphs(response);
                            }

                        }, function () {
                            $scope.loading = 'fail';
                        }
                    );
                };
                $scope.getProfileChartInfo();
                $scope.fillGraphs = function (response) {
                    $scope.profileUserComplete = response.data;

                    var ndCountHistory = [], solvedProblemsCountByTopic = [], solvedProblemsCountByNd = [], index, value, total, cumulativeValue = 0;

                    _.forIn(response.data.history, function (value, key) {
                        cumulativeValue += value.ndCount;
                        ndCountHistory.push([key, cumulativeValue]);
                    });
                    for (index = 1; index <= 5; index += 1) {
                        total = response.data.totalProblemsByNd[index] || 0;
                        value = response.data.solvedProblemsCountByNd[index] || 0;
                        if (value !== 0) {
                            value = (value * 100) / total;
                        }

                        solvedProblemsCountByNd.push({label: index, value: value});
                    }
                    _.forIn(response.data.solvedProblemsCountByTopic, function (value, key) {
                        var tried = response.data.triedProblemsCountByTopic[key] || 0;
                        var total = response.data.totalProblemsByTopic[key] || 0;
                        var oldValue = value;
                        if (value !== 0) {
                            value = (value * 100) / total;
                        }
                        // solvedProblemsCountByTopic.push({label: key, value: value});
                        solvedProblemsCountByTopic.push({topic: key, percentage: value, correct: oldValue, tried: tried, total: total});
                    });
                    $scope.profileNd.data = [
                        {
                            'key': 'Pontuação no Topcoder',
                            'values': ndCountHistory
                        }
                    ];

                    $scope.profileTopics.data = [
                        {
                            'keys': 'Acertos por Topico',
                            'values': solvedProblemsCountByTopic
                        }
                    ];

                    $scope.profileSolvedNd.data = [
                        {
                            'keys': 'Acertos por Nd',
                            'values': solvedProblemsCountByNd
                        }
                    ];

                    $translate('user.graph.topcoder').then(function (translated) {
                        $scope.profileNd.data[0].key = translated;
                    });

                    $translate('user.graph.topics').then(function (translated) {
                        $scope.profileTopics.data[0].key = translated;
                    });

                    $translate('user.graph.scoreNd').then(function (translated) {
                        $scope.profileSolvedNd.data[0].key = translated;
                    });

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
                                axisLabel: 'Topicos',
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

                    $scope.profileNd.options = {
                        chart: {
                            type: 'stackedAreaChart',
                            height: 450,
                            margin : {
                                top: 0,
                                right: 40,
                                bottom: 60,
                                left: 60
                            },
                            x: function (d) { return d[0]; },
                            y: function (d) { return d[1]; },
                            useVoronoi: false,
                            clipEdge: true,
                            transitionDuration: 500,
                            useInteractiveGuideline: true,
                            xAxis: {
                                tickFormat: function (d) {
                                    return d3.time.format('%d/%m/%Y')(moment(d, 'YYYYMMDD').toDate());
                                },
                                axisLabel: 'Pontuação por Data'
                            },
                            yAxis: {
                                tickFormat: function (d) {
                                    return d3.format('f')(d);
                                },
                                axisLabel: 'Pontuação',
                                axisLabelDistance: 30
                            },
                            showControls: false
                        }
                    };

                    $translate('user.graph.scoreByDate').then(function (translated) {
                        $scope.profileNd.options.chart.xAxis.axisLabel = translated;
                    });

                    $scope.profileSolvedNd.options = {
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

                    $translate('user.graph.ndTitle').then(function (translated) {
                        $scope.profileSolvedNd.options.chart.xAxis.axisLabel = translated;
                    });

                    $scope.loading = false;
                };


            }
        ])

        .controller('adSearchController', [
            '$scope',
            'InstitutionService',
            'GroupService',
            'UserService',

            function ($scope, InstitutionService, GroupService, UserService) {
                $scope.filter = {
                    institution : false,
                    group : false
                };

                $scope.searchParams = {
                    group: '',
                    institution: '',
                    user: '',
                    groupId: '',
                    institutionId: ''
                };

                $scope.changeGroupId = function (id) {
                    $scope.searchParams.groupId = id;
                };

                $scope.changeInstitutionId = function (id) {
                    $scope.searchParams.institutionId = id;
                };

                $scope.searchMode = function () {
                    if (!$scope.filter.institution) {
                        $scope.filter.group = false;
                        $scope.searchParams.institution = '';
                        $scope.searchParams.institutionId = '';
                        $scope.searchParams.group = '';
                        $scope.searchParams.groupId = '';
                    }
                };
                $scope.institutionSearch = function () {
                    InstitutionService.list({q: $scope.searchParams.institution}).then(
                        function (response) {
                            $scope.institutions = response.data;
                        }
                    );
                };

                $scope.groupSearch = function () {
                    GroupService.list({
                        q : $scope.searchParams.group,
                        institution : $scope.searchParams.institutionId
                    }).then(
                        function (response) {
                            $scope.groups = response.data;
                        }
                    );
                };

                $scope.userSearch = function () {
                    if ($scope.searchParams.groupId === '') {
                        UserService.list({
                            q: $scope.searchParams.user,
                            institution: $scope.searchParams.institutionId
                        }).then(function (response) {
                            $scope.users = response.data;
                        });
                    } else {
                        GroupService.getUserList($scope.searchParams.groupId, {
                            q: $scope.searchParams.user
                        }).then(function (response) {
                            $scope.users = response.data;
                        });
                    }
                };
            }
        ])

        .controller('ProfileShowQuizzesController', [
            '$scope',
            'QuizService',
            '$stateParams',
            'currentUser',
            function ($scope, QuizService, $stateParams, currentUser) {
                $scope.loading = true;
                $scope.searchParams = {
                    sort: 'startDate',
                    order: 'asc',
                    'page': $stateParams.page || 1
                };

                $scope.paginationData = {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 0,
                    maxSize: 5,
                    offset: 0
                };


                $scope.paginationChanged = function () {
                    $scope.paginationData.offset = ($scope.paginationData.currentPage - 1) * $scope.paginationData.itemsPerPage;
                    $scope.search();
                };

                $scope.search = function () {
                    QuizService.getUserQuizzes($stateParams.id || currentUser.id, {
                        q : $scope.query,
                        startDateGe: $scope.searchParams.startDate,
                        order: $scope.searchParams.order,
                        max: $scope.paginationData.itemsPerPage,
                        offset: $scope.paginationData.offset,
                        sort: $scope.searchParams.sort
                    }).then(
                        function (response) {
                            $scope.quizzes = response.data;
                            $scope.paginationData.totalItems  = response.headers('total') || 0;
                            $scope.loading = false;
                        }
                    );
                };
                $scope.search();

            }
        ])

        .controller('ProfileShowSolvedByTopicsController', [
            '$scope',
            'QuizService',
            '$stateParams',
            'currentUser',
            function ($scope) {
                $scope.topics = $scope.profileTopics;
                $scope.reverse = false;
                $scope.searchParams = {
                    sort: 'topics',
                    order: 'asc'
                };

                $scope.search = function () {
                    $scope.reverse = $scope.searchParams.order === 'desc';
                };

            }
        ])

        .controller('ProfileShowProblemController', [
            '$scope',
            'UserService',
            '$stateParams',
            '$location',
            'currentUser',
            function ($scope, UserService, $stateParams, $location, currentUser) {
                $scope.loading = true;
                $scope.searchParams = {
                    order: 'asc',
                    'page': $stateParams.page || 1
                };

                $scope.paginationData = {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 0,
                    maxSize: 5,
                    offset: 0
                };

                $scope.paginationChanged = function () {
                    $scope.paginationData.offset = ($scope.paginationData.currentPage - 1) * $scope.paginationData.itemsPerPage;
                    $scope.search();
                };

                $scope.search = function () {
                    UserService.getAttemptedProblems($stateParams.id || currentUser.id, {
                        q : $scope.query,
                        order: $scope.searchParams.order,
                        max: $scope.paginationData.itemsPerPage,
                        offset: $scope.paginationData.offset
                    }).then(
                        function (response) {
                            $scope.loading = false;
                            $scope.problems = response.data;
                            $scope.paginationData.totalItems  = response.headers('total') || 0;
                            $location.search({page: $scope.paginationData.currentPage});
                        }
                    );
                };

                $scope.search();



            }
        ])
        .controller('ProfileShowGroupsController', [
            '$scope',
            'UserService',
            '$location',
            'currentUser',
            '$stateParams',
            function ($scope, UserService, $location, currentUser, $stateParams) {
                $scope.loading = true;
                $scope.paginationData = {
                    currentPage: 1,
                    itemsPerPage: 5,
                    totalItems: 0,
                    maxSize: 5,
                    offset: 0
                };

                $scope.searchParams = {
                    sort: 'dateCreated',
                    order: 'desc'
                };


                $scope.changeSearch = function () {
                    if ($scope.searchParams.sort === 'dateCreated') {
                        $scope.searchParams.sort = 'lastUpdated';
                    } else {
                        $scope.searchParams.sort = 'dateCreated';
                    }

                    $scope.search();
                };

                $scope.search = function () {
                    UserService.getUserGroups($stateParams.id || currentUser.id, {
                        q : $scope.query,
                        startDateGe: $scope.searchParams.startDate,
                        endDateLe: $scope.searchParams.endDate,
                        sort: $scope.searchParams.sort,
                        order: $scope.searchParams.order,
                        max: $scope.paginationData.itemsPerPage,
                        offset: $scope.paginationData.offset
                    }).then(function (response) {
                        $scope.loading = false;
                        $scope.groups = response.data;
                        $scope.paginationData.totalItems  = response.headers('total') || 0;
                        $location.search({page: $scope.paginationData.currentPage});
                    });
                };

                $scope.paginationChanged = function () {
                    $scope.paginationData.offset = ($scope.paginationData.currentPage - 1) * $scope.paginationData.itemsPerPage;
                    $scope.search();
                };

                $scope.search();

            }
        ])

        .controller('ProfileShowNotificationsController', [
            '$scope',
            'UserService',
            '$stateParams',
            '$location',
            function ($scope, UserService, $stateParams, $location) {
                $scope.searchParams = {
                    order: 'asc',
                    'page': $stateParams.page || 1
                };

                $scope.paginationData = {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 0,
                    maxSize: 5,
                    offset: 0
                };

                $scope.paginationChanged = function () {
                    $scope.paginationData.offset = ($scope.paginationData.currentPage - 1) * $scope.paginationData.itemsPerPage;
                    $scope.search();
                };

                $scope.search = function () {
                    UserService.getAttemptedProblems({
                        q : $scope.query,
                        order: $scope.searchParams.order,
                        max: $scope.paginationData.itemsPerPage,
                        offset: $scope.paginationData.offset
                    }).then(
                        function (response) {
                            $scope.notifications = response.data = [
                                {
                                    kind: '1',
                                    date: '2014-08-26T11:11:30-03:00',
                                    message: 'Reposição de aula marcada para sábado (21/08), às 8horas o Tarefa número 6 devera ser'
                                },
                                {
                                    kind: '1',
                                    date: '2014-08-26T11:11:30-03:00',
                                    message: 'Informo que a aula foi cancelada, sorry people'
                                },
                                {
                                    kind: '2',
                                    date: '2014-08-26T11:11:30-03:00',
                                    message: 'Nova tarefa adicionado a turma',
                                    entityId: 3
                                },
                                {
                                    kind: '2',
                                    date: '2014-08-26T11:11:30-03:00',
                                    message: 'Nova tarefa adicionado a turma',
                                    entityId: 4
                                },
                                {
                                    kind: '2',
                                    date: '2014-08-26T11:11:30-03:00',
                                    message: 'Nova tarefa adicionado a turma',
                                    entityId: 5
                                },
                                {
                                    kind: '3',
                                    date: '2014-08-26T11:11:30-03:00',
                                    message: 'Nova tarefa adicionado ao sistema',
                                    entityId: 2
                                },
                                {
                                    kind: '3',
                                    date: '2014-08-26T11:11:30-03:00',
                                    message: 'Nova tarefa adicionado ao sistema',
                                    entityId: 2
                                },
                                {
                                    kind: '3',
                                    date: '2014-08-26T11:11:30-03:00',
                                    message: 'Nova tarefa adicionado ao sistema',
                                    entityId: 2
                                }
                            ];
                            $scope.paginationData.totalItems  = 20;
                            $location.search({page: $scope.paginationData.currentPage});
                        }
                    );
                };
                $scope.search();

            }
        ])

        .controller('TopCoderController', [
            '$scope',
            'UserService',

            function ($scope, UserService) {

                $scope.searchParams = {
                    sort: 'topCoderScore',
                    order: 'desc',
                    max: 10
                };

                UserService.list({
                    q : $scope.query,
                    sort: $scope.searchParams.sort,
                    order: $scope.searchParams.order,
                    max: $scope.searchParams.max,
                    limit: false
                }).then(function (response) {
                    $scope.users = response.data;
                });

                $scope.search = function () {
                    UserService.list({
                        q : $scope.query,
                        sort: $scope.searchParams.sort,
                        order: $scope.searhParams.order,
                        max: $scope.searchParams.max
                    }).then(function (response) {
                        $scope.users = response.data;
                    });
                };

                $scope.plusSearch = function () {
                    if ($scope.searchParams.max < 50) {
                        $scope.searchParams.max += 10;
                        if ($scope.searchParams.max === 50) {
                            $scope.limit = true;
                        }
                        $scope.search();
                    } else {
                        $scope.limit = false;
                        $scope.searchParams.max = 10;
                        $scope.search();
                    }
                };
            }
        ])

        .controller('ProfileEditController', [
            '$scope',
            'institutions',
            'currentUser',
            'UserService',
            '$modal',
            '$window',
            '$translate',
            'SecurityService',
            function ($scope, institutions, currentUser, UserService, $modal, $window, $translate, SecurityService) {
                $scope.institutions = {};
                $scope.enableConfirm = false;
                $scope.selectedInstitution = 0;
                $scope.emailError = '';
                $scope.decoded = '';
                $scope.loading = false;
                $scope.avatar = currentUser.avatar.replace('thumbs/', '') + '?width=330';
                $scope.imageName = null;
                $scope.imageError = null;
                $scope.cropper = {
                    sourceImage : $scope.avatar,
                    croppedImage : null,
                    open : false
                };
                $scope.original = _.clone(currentUser, true);

                $scope.notificationTypes = {
                    QUESTIONNAIRE_CREATED: { email: false },
                    NEW_MESSAGE: { email: false }
                };

                UserService.getNotificationPreferences().then(function(resp) {
                   if (resp.data.length) {
                       resp.data.forEach(function(np) {
                           $scope.notificationTypes[np.notificationType] = np;
                       });
                   }
                });

                $scope.saveNotificationPreference = function(type, val) {
                    val.saving = true;
                    val.saved = false;
                    UserService.saveNotificationPreferences( {
                        type: type,
                        email: val.email
                    }).then(function() {
                        val.saving = false;
                        val.saved = true;
                    }, function(err) {
                        console.log('err', err);
                        val.saving = false;
                    });
                };

                $scope.checkChanges = function () {
                    if($scope.editProfileForm.$valid) {
                        if($scope.editProfileForm.name.$dirty && $scope.form.name !== $scope.original.name) {
                            $scope.enableConfirm = true;
                        } else if($scope.editProfileForm.username.$dirty &&  $scope.form.username !== $scope.original.username) {
                            $scope.enableConfirm = true;
                        } else if($scope.editProfileForm.Email.$dirty &&  $scope.form.email !== $scope.original.email) {
                            $scope.enableConfirm = true;
                        } else if($scope.form.institution.id !== $scope.original.institution.id && $scope.form.institution.id !== 0) {
                            $scope.enableConfirm = true;
                        } else if($scope.form.locale !== $scope.original.locale) {
                            $scope.enableConfirm = true;
                        } else {
                            $scope.enableConfirm = false;
                        }
                    } else {
                        $scope.enableConfirm = false;
                    }
                };

                $scope.$watch('form.institution.id', function (after, before) {
                    if(after !== before) {
                        $scope.checkChanges();
                    }
                });

                UserService.getCurrentUserInstitutions().then( function (response) {
                    $scope.userInstitutions = response.data;
                });

                $scope.languages = {
                    'pt_BR' : 'user.languages.ptBR',
                    'en_US' : 'user.languages.enUS'
                };

                $scope.changeLanguage = function (key) {
                    if(_.findWhere($scope.languages, {key: key}) !== undefined) {
                        $translate.use(key);
                    } else {
                        $translate.use('pt_BR');
                    }
                };


                $scope.sendImage = function (files) {
                    var formData = new FormData();
                    $scope.cropper.croppedImage = files[files.length - 1];
                    $scope.$apply();
                    formData.append('file', $scope.cropper.croppedImage);
                    $scope.loading = true;
                    UserService.sendImage(formData).then(function (response) {
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

                angular.forEach(institutions.data, function (item) {
                    $scope.institutions[item.id] = item.name;
                });

                if (!$scope.institutions || _.isEmpty($scope.institutions)) {
                    $scope.institutions[0] = 'Não há instituições disponíveis';
                }

                $scope.form = {
                    name : currentUser.name,
                    email : currentUser.email,
                    username : currentUser.username,
                    institution : currentUser.institution,
                    avatar : $scope.cropper.croppedImage,
                    locale: currentUser.locale,
                    maxLength: 255,
                    done : false
                };

                $scope.userValidate = function () {
                    UserService.userValidate({
                        name : $scope.form.name,
                        email : $scope.form.email,
                        institution : $scope.form.institution !== 0? $scope.form.institution : undefined,
                        username : $scope.form.username
                    }).then(function () {
                            $scope.editProfileForm.username.$setValidity('used', true);
                            $scope.editProfileForm.username.$setValidity('pattern', true);
                    },
                    function (response) {
                        var valid = true;
                        _.each(response.data.errors, function (error) {
                            if (error.code === 301011) {
                                valid = false;
                            }
                        });
                        $scope.editProfileForm.username.$setValidity('used', valid);

                    });
                    $scope.checkChanges();
                };

                $scope.emailValidate = function () {
                    UserService.userValidate({
                        name : $scope.form.name,
                        email : $scope.form.email,
                        institution : $scope.form.institution !== 0? $scope.form.institution : undefined,
                        username : $scope.form.username
                    }).then(function () {
                            $scope.editProfileForm.Email.$setValidity('used', true);
                        },
                        function (response) {
                            var valid = true;
                            _.each(response.data.errors, function (error) {
                                if (error.code === 301021) {
                                    valid = false;
                                }
                            });
                            $scope.editProfileForm.Email.$setValidity('used', valid);
                        });
                    $scope.checkChanges();
                };

                $scope.formSubmit = function () {
                    if (!$scope.editProfileForm.$valid) {
                        _(_.keys($scope.editProfileForm)).forEach(function (field) {
                            if (field[0] !== '$') {
                                $scope.editProfileForm[field].$setDirty();
                            }
                        });
                    } else {
                        if($scope.form.institution.id !== 0) {
                            UserService.put({
                                name : $scope.form.name,
                                email : $scope.form.email,
                                institution : $scope.form.institution,
                                username : $scope.form.username,
                                locale : $scope.form.locale
                            }).then(function () {
                                $scope.form.done = true;
                                $scope.editProfileForm.Email.$setValidity('used', true);

                                if ($scope.original.username !== $scope.form.username) {
                                    SecurityService.logout();
                                } else {
                                    $window.location.reload();
                                }
                            }, function (response) {
                                var errorCode = response.data.errors[0].code;
                                if (errorCode === 301020) {
                                    $scope.editProfileForm.Email.$setValidity('used', false);
                                }
                            });
                        } else {
                            UserService.put({
                                name : $scope.form.name,
                                email : $scope.form.email,
                                username : $scope.form.username,
                                locale : $scope.form.locale
                            }).then(function () {
                                $scope.form.done = true;
                                $scope.editProfileForm.Email.$setValidity('used', true);

                                if ($scope.original.username !== $scope.form.username) {
                                    SecurityService.logout();
                                } else {
                                    $window.location.reload();
                                }

                            }, function (response) {
                                var errorCode = response.data.errors[0].code;
                                if (errorCode === 301020) {
                                    $scope.editProfileForm.Email.$setValidity('used', false);
                                }
                            });
                        }
                    }

                };

                $scope.open = function () {
                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: 'myModalContent.html',
                        controller: 'avatarModal',
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
                        UserService.cropImage({
                            filename: $scope.imageName,
                            x: $scope.data.x,
                            y: $scope.data.y,
                            width: $scope.data.width,
                            height: $scope.data.height
                        }).then(function (response) {
                            $scope.cropper.sourceImage = response.data.avatar;
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

        .controller('avatarModal', [
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

        .controller('ProfileChangePasswordController', [
            '$scope',
            'currentUser',
            'UserService',
            function ($scope, currentUser, UserService) {
                $scope.user = currentUser;

                $scope.form = {
                    newPassword : '',
                    confirmNewPassword : '',
                    password : '',
                    minLength : 6,
                    maxLength : 255,
                    submitted : false,
                    changePass: false
                };

                $scope.validatePassword = function () {
                    if($scope.form.newPassword === $scope.form.confirmNewPassword) {
                        $scope.changePasswordForm.confimNewPassword.$setValidity('match', true);
                    } else {
                        $scope.changePasswordForm.confimNewPassword.$setValidity('match', false);
                    }
                };

                $scope.formSubmit = function () {
                    if (!$scope.changePasswordForm.$valid) {
                        _(_.keys($scope.changePasswordForm)).forEach(function (field) {
                            if (field[0] !== '$') {
                                $scope.changePasswordForm[field].$setDirty();
                            }
                        });
                    } else {
                        UserService.putPassword({
                            newPassword : $scope.form.newPassword,
                            confirmNewPassword : $scope.form.confirmNewPassword,
                            password : $scope.form.password
                        }).then(function () {
                            $scope.form.submitted = true;
                            $scope.form.changePass = true;
                        }, function () {
                            $scope.form.submitted = true;
                            $scope.form.changePass = false;
                        });
                    }
                };
            }
        ]);


}(angular, require));
