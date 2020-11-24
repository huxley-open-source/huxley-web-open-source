/*global angular, require, _, moment, d3*/

(function (angular, require, _) {
    'use strict';

    var groupApp = require('./group-app');

    angular.module(groupApp.name)

        .controller('GroupListController', [
            '$scope',
            'GroupService',
            '$location',
            'searchParams',
            'paginationData',
            'currentUser',
            'UserService',
            function ($scope, groupService, $location, searchParams, paginationData, currentUser, userService) {
                var successFunction, delay, errorFunction;
                $scope.loading = true;
                $scope.searchParams = searchParams;
                $scope.searched = false;
                $scope.currentUser = currentUser;
                $scope.paginationData = paginationData;

                if (currentUser.isAuthenticated() && $scope.searchParams.all === undefined) {
                    $scope.searchParams.all = false;
                } else if (!currentUser.isAuthenticated()) {
                    $scope.searchParams.all = true;
                }

                $scope.view = {
                    sort: false
                };

                $scope.view.sort = $scope.searchParams.sort && $scope.searchParams.sort === 'lastUpdated';

                $scope.changeSearchScope = function () {
                    $scope.paginationData.currentPage = 1;
                    $scope.search();
                };

                delay = (function () {
                    var timer = 0;

                    return function (callback, ms) {
                        clearTimeout(timer);
                        timer = setTimeout(callback, ms);
                    };
                }());

                successFunction =  function (response) {
                    $scope.groups = response.data;
                    $scope.paginationData.totalItems  = response.headers('total') || 0;
                    $scope.searched = true;
                    $scope.searchParams.page = $scope.paginationData.currentPage;
                    $location.search($scope.searchParams);
                    $scope.loading = false;
                };

                errorFunction = function () {
                    $scope.loading = false;
                };

                $scope.search = function () {
                    $scope.searchParams.sort = $scope.view.sort ? 'lastUpdated' : 'name';
                    $scope.searchParams.order = $scope.view.sort ? 'desc' : 'asc';
                    var searchParams = _.clone($scope.searchParams, true);
                    $scope.loading = true;
                    searchParams.offset = ($scope.paginationData.currentPage - 1) * $scope.paginationData.itemsPerPage;
                    searchParams.max = $scope.paginationData.itemsPerPage;
                    searchParams.page = undefined;
                    searchParams.all = undefined;
                    if ($scope.searchParams.all) {
                        groupService.list(searchParams).then(successFunction, errorFunction);
                    } else {
                        userService.getCurrentUserGroups(searchParams).then(successFunction, errorFunction);
                    }
                };

                $scope.searchByName = function () {
                    delay(function () {
                        $scope.paginationData.currentPage = 1;
                        $scope.search();
                    }, 1000);

                };

                $scope.pageChanged = function () {
                    $scope.search();
                };
                $scope.search();
            }])

        .controller('GroupShowController', [
            '$scope',
            'GroupService',
            'UserService',
            'LanguageService',
            'SubmissionService',
            '$state',
            'currentUser',
            'FileSaver',
            '$stateParams',
            '$timeout',
            'Page',
            '$filter',
            '$q',
            '$translate',
            function ($scope, groupService, UserService, LanguageService, SubmissionService, $state, currentUser, FileSaver, $stateParams, $timeout, Page, $filter, $q, $translate) {
                $scope.currentUser = currentUser;
                $scope.$state = $state;
                $scope.loading = true;
                $scope.loadingStats = true;
                $scope.statsList = {sort: 'name', order: 'asc'};
                $scope.statsLoading = true;

                $scope.languages = LanguageService.list();

                var deferredList = [$q.defer(), $q.defer(), $q.defer()];
                $scope.getGroupStats = function () {
                    $scope.group.stats = {};
                    groupService.getUsersStats($scope.group.id).then(
                        function (response) {
                                $scope.group.stats.statsByUser = response.data;
                                deferredList[0].resolve($scope.group.stats);
                        },
                        function () {
                            deferredList[0].reject();
                        }
                    );
                    SubmissionService.list({'group': $scope.group.id, 'sort': 'submissionDate', 'order': 'desc', 'max': 10 }).then(
                        function (result) {
                            $scope.group.stats.lastSubmissions = result.data;
                            deferredList[1].resolve(true);
                        },
                        function () {
                            deferredList[1].reject(false);
                        });
                    SubmissionService.list({'group': $scope.group.id, 'sort': 'time', 'order': 'asc', 'max': 10, 'evaluations': 'CORRECT'}).then(
                        function (result) {
                            $scope.group.stats.fastestSubmissions = result.data;
                            deferredList[2].resolve(true);
                        },
                        function () {
                            deferredList[2].reject(false);
                        });
                };

                groupService.get($stateParams.id).then(
                    function (response) {
                        $scope.group = response.data;
                        $timeout(function() {
                            Page.setTitle($scope.group.name);
                        });
                        $scope.loading = false;

                        groupService.getKey($scope.group.id).then(
                            function (response) {
                                $scope.key = response.data.key;
                            }
                        );

                        groupService.listStudents($scope.group.id, { max: 150 }).then(function (response) {
                            $scope.group.students = response.data;
                            $scope.getGroupStats();
                        });

                        $scope.group.statsList = [];
                    },
                    function () {
                        $scope.loading = true;
                        $state.go('not-found', null, { location: false });
                    }
                );


                $scope.updateGroup = function () {
                    groupService.get($scope.group.id).then(
                        function (response) {
                            $scope.group = response.data;
                        }
                    );
                };

                $scope.getInstitutionUsers = function (val) {
                    return UserService.list({ q: val, max: 5 }).then(
                        function (response) {
                            return response.data;
                        }
                    );
                };

                $scope.disableDropdown = function ($event) {
                    $event.stopPropagation();
                };

                $scope.onSelect = function ($item, role) {
                    if (role === 'TEACHER') {
                        groupService.addUserToGroup($item.id, $scope.group.id, { role: 'TEACHER' }).then(function () {
                            $scope.updateGroup();
                            $scope.userSelected.teacher = '';
                        });

                    } else if (role === 'TEACHER_ASSISTANT') {
                        groupService.addUserToGroup($item.id, $scope.group.id, { role: 'TEACHER_ASSISTANT' }).then(function () {
                            $scope.updateGroup();
                            $scope.userSelected.assistant = '';
                        });

                    }
                };

                $scope.removeItem = function (id) {
                    groupService.removeUserFromGroup($scope.group.id, id).then(function () {
                        $scope.updateGroup();
                    });
                };

                $scope.chooseInstitution = function (id) {
                    $scope.edit.institution = !$scope.edit.institution;
                    groupService.update($scope.group.id, { institution: id }).then(function (response) {
                        $scope.group = response.data;
                    });
                };
                $scope.updateName = function () {
                    $scope.edit.name = false;
                    $scope.name = angular.element('#name').html().trim();
                    if ($scope.name !== $scope.group.name) {
                        groupService.update($scope.group.id, { name: $scope.name}).then(function (response) {
                            $scope.group = response.data;
                        });
                    }
                };
                $scope.updateDescription = function () {
                    $scope.edit.description = false;
                    $scope.description = angular.element('#description').html().trim();
                    if ($scope.description !== $scope.group.description) {
                        groupService.update($scope.group.id, { description: $scope.description}).then(function (response) {
                            $scope.group = response.data;
                        });
                    }
                };

                $scope.edit = { teacher: false, institution: false, assistant: false, description: false };
                $scope.userSelected = { teacher: '', assistant: '', institution: '' };
                $scope.$item = '';
                $scope.info = { expand: false };
                UserService.getCurrentUserInstitutions().then(function (response) {
                    $scope.institutionList = response.data;
                });

                $scope.orderTopcoderList = function () {
                    $scope.group.students = $filter('orderBy')($scope.group.students, $scope.statsList.sort, $scope.statsList.order === 'asc'? true : false);
                };

                $scope.exportQuizes = function() {
                    groupService.exportQuizzes($scope.group.id).then(function(resp) {
                        var blob = new Blob([resp.data], {
                            type: 'application/vnd.ms-excel'
                        });
                        FileSaver.saveAs(blob, 'huxley-group-export.xls');
                    });
                };
                $scope.statsKeyMap = {};
                $q.all([deferredList[0].promise, deferredList[1].promise, deferredList[2].promise]).then(
                    function () {
                        $scope.loadingStats = false;
                        $scope.$parent.statsLoading = 'building';
                        $scope.studentsTotal = 0;
                        $scope.problemsTriedAverage = 0;
                        $scope.problemsSolvedAverage = 0;
                        $scope.submissionCount = 0;
                        $scope.correctSubmissionCount = 0;

                        var submissionByEvaluation = {};
                        var submissionByLanguage = {};

                        $scope.group.students.forEach(function(st) {
                            st.stats = {
                                submissionsCount: 0,
                                triedProblemsCount: 0,
                                solvedProblemsCount: 0,
                                ndCount: 0
                            };
                        });

                        var studentMap = _.indexBy($scope.group.students, 'id');

                        Object.keys($scope.group.stats.statsByUser).forEach(function(key) {
                            var stud = studentMap[key];
                            if (stud) {
                                stud.stats = $scope.group.stats.statsByUser[key];
                            }
                        });

                        $scope.group.students.forEach(function(user) {
                            $scope.studentsTotal++;

                            $scope.problemsSolvedAverage += user.stats.solvedProblemsCount;
                            $scope.problemsTriedAverage += user.stats.triedProblemsCount;
                            $scope.submissionCount += user.stats.submissionsCount;

                            if (!user.stats.languageAndEvaluationMap) {
                                return;
                            }

                            Object.keys(user.stats.languageAndEvaluationMap).forEach(function(key) {

                                var evaluations = user.stats.languageAndEvaluationMap[key];

                                Object.keys(evaluations).forEach(function(ev) {
                                    var evalCount = submissionByEvaluation[ev];

                                    if (!evalCount) {
                                        evalCount = 0;
                                    }

                                    submissionByEvaluation[ev] = evalCount + evaluations[ev];
                                });

                                var languageCount = submissionByLanguage[key];

                                if (!languageCount) {
                                    languageCount = 0;
                                }

                                submissionByLanguage[key] = languageCount + user.stats.languageAndEvaluationMap[key].TOTAL;
                            });
                        });

                        $scope.correctSubmissionCount = submissionByEvaluation.CORRECT;

                        $scope.submissionByLanguage = [];
                        $scope.submissionByEvaluation = [];

                        Object.keys(submissionByEvaluation).forEach(function(key) {
                            if (key === 'CORRECT' || key === 'WRONG_ANSWER' || key === 'TIME_LIMIT_EXCEEDED' || key === 'RUNTIME_ERROR' || key === 'COMPILATION_ERROR') {
                                $translate('submission.status.' + key).then(function (translated) {
                                    if(submissionByEvaluation[key] !== 0) {
                                        $scope.submissionByEvaluation.push({ label: translated, value: submissionByEvaluation[key] });
                                    }
                                });
                            }
                        });

                        $scope.languages.then(function(resp) {
                            var langById = _.indexBy(resp.data, 'id');
                            Object.keys(submissionByLanguage).forEach(function(key) {
                                $scope.submissionByLanguage.push({ label: langById[key].label, value: submissionByLanguage[key] });
                            });
                        });



                        if ($scope.studentsTotal && $scope.studentsTotal > 0) {

                            $scope.submissionAverage = $scope.submissionCount / $scope.studentsTotal;
                            $scope.problemsTriedAverage = $scope.problemsTriedAverage / $scope.studentsTotal;
                            $scope.problemsSolvedAverage = $scope.problemsSolvedAverage / $scope.studentsTotal;
                        } else {
                            $scope.submissionAverage = 0;
                            $scope.problemsTriedAverage = 0;
                            $scope.problemsSolvedAverage = 0;
                        }

                        $scope.statsLoading = false;
                    },
                    function () {
                        $scope.$parent.statsLoading = 'fail';
                        $scope.loadingStats = 'fail';
                    }
                );


            }])

        .controller('GroupNewController', [
            '$scope',
            '$location',
            function ($scope, $location) {
                $scope.urlInfo = { action: $location.path().substring($location.path().lastIndexOf('/') + 1) };
            }
        ])

        .controller('GroupQuestController', [
            '$scope',
            'GroupService',
            '$location',
            'moment',
            'paginationData',
            '$stateParams',
            'group',
            'QuizService',
            function ($scope, groupService, $location, moment, paginationData, $stateParams, group, QuizService) {
                $scope.paginationData = paginationData;
                $scope.searched = false;
                $scope.loading = true;
                $scope.group = group;
                $scope.search = function () {
                    $scope.loading = true;
                    groupService.getQuestionnaires($scope.group.id, {
                        sort: 'startDate',
                        order: 'desc',
                        offset: ($scope.paginationData.currentPage - 1) * $scope.paginationData.itemsPerPage,
                        max: paginationData.itemsPerPage
                    }).then(function (response) {
                        $scope.quests = [];
                        $scope.paginationData.totalItems  = response.headers('total') || 0;
                        _(response.data).forEach(function (it) {
                            var temp = it;
                            temp.startDate = new Date(it.startDate);
                            temp.endDate = new Date(it.endDate);
                            temp.serverTime = new Date(it.serverTime);
                            temp.invalid = it.problemsCount === 0;
                            $scope.quests.push(temp);
                        });
                        $location.search({page: $scope.paginationData.currentPage});
                        $scope.loading = false;
                        $scope.searched = true;
                    }, function () {
                        $scope.loading = false;
                    });
                };

                $scope.pageChanged = function () {
                    $scope.search();
                };
                $scope.removeQuiz = function (id) {
                    QuizService.remove(id).then(function () {
                        $scope.search();
                    });
                };

                $scope.search();
            }])

        .controller('GroupCreateQuizController', [
            '$scope',
            'moment',
            'QuizService',
            '$state',
            'group',
            'quiz',
            'UserService',
            function ($scope, moment, QuizService, $state, group, quiz, UserService) {
                $scope.saving = false;
                $scope.saved = false;
                $scope.enableConfirm = false;
                $scope.quizInfo = {
                    nameMaxSize: 255,
                    descriptionMaxSize: 255,
                    group: ''
                };
                $scope.original = _.clone(quiz, true);
                if (quiz !== undefined) {
                    $scope.quiz = _.clone(quiz, true);
                }
                $scope.clone = $scope.clone === true ? true: false;


                if (group !== undefined) {
                    $scope.group = group;
                } else if ($scope.clone) {
                    $scope.groupList = {};
                    UserService.getCurrentUserGroups({max: 100}).then(
                        function (response) {
                            if (response.data[0]) {
                                $scope.quizInfo.group = response.data[0].id;
                                _.each(response.data, function (group) {
                                    $scope.groupList[group.id] = group.name;
                                });
                            } else {
                                $scope.groupNotFound = true;
                            }
                        }
                    );
                }
                $scope.checkChanges = function () {
                    if($scope.original && $scope.clone === false) {
                        if ($scope.quiz.startDate) {
                            $scope.quiz.startDate.setHours($scope.sHours, $scope.sMinutes);
                        }
                        if ($scope.quiz.endDate) {
                            $scope.quiz.endDate.setHours($scope.eHours, $scope.eMinutes);
                        }

                        console.log($scope.quiz.partialScore.$dirty, $scope.quiz.partialScore, $scope.original.partialScore);
                        if($scope.createQuiz.$valid) {
                            if($scope.createQuiz.quizName.$dirty && $scope.quiz.title !== $scope.original.title) {
                                $scope.enableConfirm = true;
                            } else if($scope.createQuiz.quizDescription.$dirty && $scope.quiz.description !== $scope.original.description) {
                                $scope.enableConfirm = true;
                            } else if (new Date($scope.quiz.startDate).toString() !== new Date($scope.original.startDate).toString()) {
                                $scope.enableConfirm = true;
                            } else if (new Date($scope.quiz.endDate).toString() !== new Date($scope.original.endDate).toString()) {
                                $scope.enableConfirm = true;
                            } else if ($scope.quiz.partialScore !== $scope.original.partialScore) {
                                $scope.enableConfirm = true;
                            } else {
                                $scope.enableConfirm = false;
                            }
                        } else {
                            $scope.enableConfirm = false;
                        }
                    } else {
                        $scope.enableConfirm = true;
                    }
                };
                $scope.create = quiz === undefined;
                $scope.quiz = $scope.quiz ? $scope.quiz : {};
                $scope.sHours = 0;
                $scope.eHours = 23;
                $scope.sMinutes = 0;
                $scope.eMinutes = 59;
                $scope.$watch('[sHours, sMinutes, eHours, eMinutes, quiz.startDate, quiz.endDate]', function () {
                    $scope.saved = false;
                    $scope.error = false;
                    if ($scope.createQuiz) {
                        $scope.createQuiz.quizDate.$setValidity('custom', true);
                        $scope.createQuiz.quizDate.$setValidity('parse', true);
                        var startDate, endDate;
                        if ($scope.quiz.startDate !== undefined && $scope.quiz.endDate !== undefined) {
                            startDate = new Date($scope.quiz.startDate);
                            startDate.setHours($scope.sHours, $scope.sMinutes);
                            endDate = new Date($scope.quiz.endDate);
                            endDate.setHours($scope.eHours, $scope.eMinutes);
                            if (!(moment(startDate).isBefore(moment(endDate)))) {
                                $scope.createQuiz.quizDate.$setValidity('custom', false);
                                $scope.createQuiz.quizDate.$setValidity('parse', false);
                            }
                        }
                        $scope.checkChanges();
                    }


                });
                $scope.formSubmit = function () {
                    $scope.saving = false;
                    $scope.saved = false;
                    $scope.error = false;
                    if (!$scope.createQuiz.$valid) {
                        _(_.keys($scope.createQuiz)).forEach(function (field) {
                            if (field[0] !== '$') {
                                $scope.createQuiz[field].$setDirty();
                            }
                        });
                    } else {
                        if (group === undefined) {
                            if ($scope.$parent.group) {
                                $scope.group = {id: $scope.$parent.group};
                            } else {
                                $scope.group = {id: $scope.quizInfo.group};
                            }
                        }
                        var quizToSave = {}, startDate = new Date($scope.quiz.startDate), endDate = new Date($scope.quiz.endDate);
                        quizToSave.title = $scope.quiz.title;
                        quizToSave.description = $scope.quiz.description;

                        quizToSave.partialScore = $scope.quiz.partialScore;
                        startDate.setHours($scope.sHours, $scope.sMinutes);
                        endDate.setHours($scope.eHours, $scope.eMinutes);
                        quizToSave.startDate = moment(startDate).format('YYYY-MM-DDTHH:mm:ssZ');
                        quizToSave.endDate = moment(endDate).format('YYYY-MM-DDTHH:mm:ssZ');
                        quizToSave.group = {id: $scope.group.id};
                        if ($scope.create) {
                            $scope.saving = true;
                            QuizService.create(quizToSave).then(function (response) {
                                $scope.error = false;
                                $scope.saving = false;
                                $state.go('quiz-show.edit-problems', {id: response.data.id});
                            }, function () {
                                $scope.saving = false;
                                $scope.error = true;
                            });
                        } else if ($scope.clone) {
                            $scope.saving = true;
                            QuizService.clone($scope.quiz.id, quizToSave).then(function (response) {
                                $scope.error = false;
                                $scope.saved = true;
                                $state.go('quiz-show.edit-problems', {id: response.data.id});
                            }, function () {
                                $scope.error = true;
                            });
                        } else {
                            $scope.saving = true;
                            quizToSave.id = $scope.quiz.id;
                            QuizService.update(quizToSave).then(function (response) {
                                $scope.error = false;
                                $scope.saved = true;
                                $scope.$parent.quiz = response.data;
                                $scope.$parent.quiz.startDate = new Date($scope.$parent.quiz.startDate);
                                $scope.$parent.quiz.endDate = new Date($scope.$parent.quiz.endDate);
                                $scope.$parent.quiz.serverTime = new Date($scope.$parent.quiz.serverTime);
                                $scope.original = _.clone($scope.$parent.quiz);
                                $scope.enableConfirm = false;
                                $scope.saving = false;
                                $scope.saved = true;
                                if ($scope.populateProblems) {
                                    $scope.populateProblems(0);
                                }
                            }, function () {
                                $scope.saving = false;
                                $scope.saved = false;
                                $scope.error = true;
                                $scope.saved = false;
                            });
                        }

                    }

                };
            }])

        .controller('GroupSubmissionChartController', [
            '$scope',
            '$translate',
            function ($scope, $translate) {
                $scope.$watch('loadingStats', function () {
                    if (!$scope.loadingStats) {
                        $translate(['group.charts.students', 'group.charts.quizzes',
                            'group.charts.yAxisLabel', 'group.charts.xAxisLabel',
                            'group.charts.submissionChartTitle', 'group.charts.submisionChartSubtitle']).then(function (response) {
                            $scope.translatedX = response['group.charts.students'];
                            $scope.translatedY = response['group.charts.quizzes'];
                            $scope.yAxisLabel = response['group.charts.yAxisLabel'];
                            $scope.xAxisLabel = response['group.charts.xAxisLabel'];
                            $scope.submissionChartTitle = response['group.charts.submissionChartTitle'];
                            $scope.submisionChartSubtitle = response['group.charts.submisionChartSubtitle'];
                            $scope.fillGraphs($scope.$parent.group.stats);
                        });
                    }
                });

                $scope.fillGraphs = function (response) {
                    $scope.haveData = response.data.submissionsCount;

                    $scope.submissionsCount = {};

                    $scope.submissionsGetData = function () {
                        var openQuizzesCountHistory = [], submissionCountHistory = [];

                        _.forIn(response.data.usersWhoTriedCountHistory, function (value, key) {
                            submissionCountHistory.push([moment(key).format('x'), value]);
                        });
                        submissionCountHistory.reverse();

                        _.forIn(response.data.openQuizzesCountHistory, function (value, key) {
                            openQuizzesCountHistory.push([moment(key).format('x'), value]);
                        });

                        openQuizzesCountHistory.reverse();

                        //Line chart data should be sent as an array of series objects.
                        return [
                            {
                                values: submissionCountHistory,      //values - represents the array of {x,y} data points
                                key: $scope.translatedX, //key  - the name of the series.
                                color: '#ff7f0e',  //color - optional: choose your own line color.
                                area: true
                            },
                            {
                                values: openQuizzesCountHistory,
                                key: $scope.translatedY,
                                color: '#7777ff',
                                area: true      //area - set to true if you want this line to turn into a filled area chart.
                            }
                        ];
                    };

                    $scope.submissionsCount.data = $scope.submissionsGetData;

                    $scope.submissionsCount.options = {
                        chart: {
                            type: 'lineChart',
                            height: 450,
                            margin : {
                                top: 20,
                                right: 20,
                                bottom: 40,
                                left: 55
                            },
                            x: function (d) { return d[0]; },
                            y: function (d) { return d[1]; },
                            useInteractiveGuideline: true,
                            xAxis: {
                                tickFormat: function (d) {
                                    return d3.time.format('%x')(new Date(parseInt(d)));
                                },
                                axisLabel: $scope.xAxisLabel
                            },
                            yAxis: {
                                axisLabel: $scope.yAxisLabel,
                                tickFormat: function (d) {
                                    return d3.format('d')(d);
                                },
                                axisLabelDistance: 30
                            }
                        },
                        title: {
                            enable: true,
                            text: $scope.submissionChartTitle
                        },
                        subtitle: {
                            enable: true,
                            text: $scope.submisionChartSubtitle,
                            css: {
                                'text-align': 'center',
                                'margin': '10px 13px 0px 7px'
                            }
                        }
                    };
                };
            }])

        .controller('GroupSubmissionController', [
            '$scope',
            'GroupService',
            '$location',
            'searchParams',
            'paginationData',
            'group',
            'QuizService',
            'SubmissionService',
            '$q',
            '$timeout',
            function ($scope, groupService, $location, searchParams, paginationData, group, QuizService, SubmissionService, $q, $timeout) {

                $scope.searchParams = searchParams[0];
                $scope.paginationData = paginationData;
                $scope.isAdminPanel = false;
                $scope.evaluations = '';
                $scope.group = group;
                $scope.reEvaluationList = [];
                $scope.lookForEvaluations = false;
                $scope.lookingForEvaluation = false;
                $scope.eventId = 'GET_MORE_GROUP_' + group.id + '_SUBMISSIONS_TY';
                $scope.hasMoreSubmissions = true;
                if($scope.quiz) {
                    group.problems = $scope.quiz.problemList;
                }

                $scope.getEvaluationsStatus = function () {
                    var deferredList = [], promiseList = [];

                    _.each($scope.reEvaluationList, function () {
                        var deffered = $q.defer();
                        deferredList.push(deffered);
                        promiseList.push(deffered.promise);
                    });

                    _.each($scope.reEvaluationList, function (id, index) {
                        SubmissionService.get(id).then( function (response) {
                            deferredList[index].resolve(response.data);
                        });
                    });
                    return $q.all(promiseList);
                };
                $scope.updateEvaluationsStatus = function () {
                    $scope.getEvaluationsStatus().then(function (resultList) {
                        _.each(resultList, function (submission) {
                            if (submission.evaluation !== 'WAITING') {
                                $scope.reEvaluationList.splice($scope.reEvaluationList.indexOf(submission.id), 1);
                                _.each($scope.submissions, function (submissionToUpdate, index) {
                                   if (submissionToUpdate.id === submission.id) {
                                       $scope.submissions[index].evaluation = submission.evaluation;

                                   }
                                });
                            }
                        });
                        if ($scope.reEvaluationList.length === 0) {
                            $scope.lookingForEvaluation = false;
                            $scope.lookForEvaluations = false;
                        } else {
                            $timeout($scope.updateEvaluationsStatus, 5000);
                        }
                    });


                };
                $scope.$watch('lookForEvaluations', function () {
                    if ($scope.lookForEvaluations && !$scope.lookingForEvaluation) {
                        $scope.updateEvaluationsStatus();
                    }
                });
                $scope.updateReEvaluationList = function () {
                    $scope.reEvaluationList = [];
                    _.each($scope.submissions, function (submission) {
                        if (submission.evaluation === 'WAITING' && $scope.reEvaluationList.indexOf(submission.id) === -1) {
                            $scope.reEvaluationList.push(submission.id);
                        }
                    });

                    if ($scope.reEvaluationList.length > 0) {
                        $scope.lookForEvaluations = true;
                    } else {
                        $scope.lookForEvaluations = false;
                    }
                };

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

                $scope.searched = false;
                $scope.loading = true;
                $scope.search = function (changePage) {
                    if (!changePage) {
                        $scope.paginationData.currentPage = 1;
                    }
                    $scope.loadingMore = true;
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
                    if (searchParams.evaluations === 'ALL') {
                        searchParams.evaluations = [];
                    }
                    if (searchParams.problem[0]) {
                        searchParams.problem = searchParams.problem[0].id;
                    }
                    if (searchParams.user[0]) {
                        searchParams.user = searchParams.user[0].id;
                    }

                    searchParams.quiz = group.quiz;
                    searchParams.group = group.id;

                    SubmissionService.list(searchParams).then(function (response) {
                        if (changePage) {
                            $scope.submissions = $scope.submissions?$scope.submissions.concat(response.data): response.data;
                        } else {
                            $scope.submissions = response.data;
                        }

                        $scope.paginationData.totalItems = response.headers('total') || 0;
                        $scope.searched = true;
                        $scope.searchParams.page = $scope.paginationData.currentPage;
                        if (response.headers('total') > searchParams.offset + searchParams.max) {
                            $scope.hasMoreSubmissions = true;
                        } else {
                            $scope.hasMoreSubmissions = false;
                        }
                        searchParams.offset = undefined;
                        searchParams.max = undefined;
                        $location.search(searchParams);
                        searchParams.page = $scope.paginationData.currentPage;
                        $scope.updateReEvaluationList();
                        $scope.loading = false;
                        $scope.loadingMore = false;
                        $scope.hasErrorSubmissions = false;
                    }, function () {
                        $scope.loading = false;
                        $scope.loadingMore = false;
                        $scope.hasErrorSubmissions = true;
                    });
                };
                $scope.search();

                $scope.pageChanged = function () {
                    $scope.search();
                };
                $scope.$on($scope.eventId, function () {
                    $scope.paginationData.currentPage = $scope.paginationData.currentPage + 1;
                    $scope.search(true);
                });

                $scope.reevaluateOne = function (submission) {
                    SubmissionService.reevaluateOne(submission.id).then(
                        function () {
                            submission.evaluation = 'WAITING';
                            if ($scope.reEvaluationList.indexOf(submission.id) === -1) {
                                $scope.reEvaluationList.push(submission.id);
                                $scope.lookForEvaluations = true;
                            }
                        }
                    );
                };
            }])

        .controller('GroupStatsController', [
            '$scope',
            '$translate',
            function ($scope) {



                $scope.xFunction = function(){
                    return function(d) {
                        return d.label;
                    };
                };

                $scope.yFunction = function(){
                    return function(d){
                        return d.value;
                    };
                };

                $scope.xFunction2 = function () {
                    return function (d) {
                        return d[0];
                    };
                };

                $scope.yFunction2 = function () {
                    return function (d) {
                        return d[1];
                    };
                };

                $scope.toolTipContentFunction = function () {
                    return function (key, x) {
                        return '<h3>' + parseInt(x.replace(',', ''), 10) + '</h3>' +
                            '<p>' + key  + '</p>';
                    };
                };
                $scope.toolTipContentFunction2 = function () {
                    return function (key, x, y) {
                        return '<h3>' + x + '</h3>' +
                            '<p>' + y  + '</p>';
                    };
                };
                $scope.valueFormat = function () {
                    return function (data) {
                        return Math.floor(data);
                    };
                };

                $scope.statsOptions = {
                    submissionPieChart: {
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
                            tooltipContent: $scope.toolTipContentFunction(),
                            showLabels: true,
                            labelType: 'percent'
                        }
                    }
                };

                $scope.createCharts = function () {
                    $scope.submissionByEvaluationData = [];
                    $scope.stats = {submissionsPerEvaluation: [], submissionsPerLanguage: [], problemsByTopic: []};

                    $scope.solvedProblemsAverage = 0;
                    $scope.userCount = 0;

                    _(_.keys($scope.group.stats.problemsSolvedByUser)).forEach(function (key) {
                        $scope.userCount++;
                        $scope.solvedProblemsAverage+=$scope.group.stats.problemsSolvedByUser[key].length;
                    });
                    if ($scope.userCount > 0) {
                        $scope.solvedProblemsAverage = $scope.solvedProblemsAverage / $scope.userCount;
                    }
                    $scope.triedProblemsAverage = 0;
                    $scope.userCount = 0;
                    _(_.keys($scope.group.stats.problemsTriedByUser)).forEach(function (key) {
                        $scope.userCount++;
                        $scope.triedProblemsAverage+=$scope.group.stats.problemsTriedByUser[key].length;
                    });
                    if ($scope.userCount > 0) {
                        $scope.triedProblemsAverage = $scope.triedProblemsAverage / $scope.userCount;
                    }
                };

                $scope.$parent.$watch('loadingStats', function (after) {
                    if (!after) {
                        $scope.createCharts();
                    }
                });

            }
        ])

        .controller('GroupStatsUserController', [
            '$scope',
            '$stateParams',
            'UserService',
            '$timeout',
            'SubmissionService',
            function ($scope, $stateParams, UserService, $timeout) {
                var userId;
                $scope.u = {problemOffset : 1};
                $scope.loading = true;
                $scope.loadingSubmissions = true;
                $scope.$parent.$watch('statsLoading', function (after) {
                    if (after === false) {
                        if($stateParams.userId === undefined) {
                            $scope.user = $scope.group.students[0];
                            userId = $scope.user.id;
                        } else {
                            userId = $stateParams.userId;
                        }

                        for (var i = 0; i < $scope.group.students.length; i++) {
                            if (i > 0) {
                                $scope.group.students[i].before = $scope.group.students[i - 1].id;
                            }
                            if (i < $scope.group.students.length - 1) {
                                $scope.group.students[i].after = $scope.group.students[i + 1].id;
                            }

                            if ($scope.group.students[i].id + '' === userId + '') {
                                $scope.user = $scope.group.students[i];
                            }
                        }

                        $scope.getProfileChartInfo = function () {
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

                        // $scope.listSubmissions = function () {
                        //     $scope.loadingSubmissions = 'building';
                        //     $scope.loadingUserReview = true;
                        //     $scope.problemSubmissions = {};
                        //     $scope.matchVisible = {};
                        //     $scope.problemList = $scope.group.stats.problemsTriedByUser[key];
                        //     if ($scope.problemList !== undefined && $scope.problemList.length !== 0) {
                        //         $scope.problemList.forEach(function (problem) {
                        //             SubmissionService.list({user: $scope.user.id, problem: problem.id, submissionDateLe: moment($scope.group.endDate).format('YYYY-MM-DDTHH:mm:ssZ')}).then(function (response) {
                        //                 $scope.problemSubmissions[problem.id] = response.data;
                        //                 _.each(response.data, function (submission) {
                        //                     problem.bestEvaluation = (problem.bestEvaluation === 'CORRECT') ? 'CORRECT' : submission.evaluation;
                        //                     problem.nd = submission.problem.nd;
                        //                 });
                        //             });
                        //             $scope.loadingSubmissions = false;
                        //         });
                        //     } else {
                        //         $scope.loadingSubmissions = false;
                        //     }
                        // };
                        // $scope.listSubmissions();
                      //aqui
                    }
                });
                $scope.codeReviewUser = function (id) {
                    if ($scope.matchVisible[id]) {
                        $scope.matchVisible[id] = false;
                    } else {
                        $scope.problemList.forEach(function (problem) {
                            $scope.matchVisible[problem.id] = false;
                        });
                        $scope.matchVisible[id] = true;
                    }
                };
                $scope.profileTopics = {};

                $scope.fillGraphs = function (response) {
                    $scope.profileUserComplete = response.data;

                    var solvedProblemsCountByTopic = [], total;


                    _.forIn(response.data.solvedProblemsCountByTopic, function (value, key) {
                        total = response.data.triedProblemsCountByTopic[key] || 0;
                        if (value !== 0) {
                            value = (value * 100) / total;
                        }
                        solvedProblemsCountByTopic.push({label: key, value: value});
                    });

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


                    $scope.loading = false;

                };

            }
        ])

        .controller('GroupUserController', [
            '$scope',
            'GroupService',
            'paginationData',
            '$location',
            'currentUser',
            '$state',
            'group',
            function ($scope, groupService, paginationData, $location, currentUser, $state, group) {
                $scope.selectedAll = false;
                $scope.paginationData = paginationData;
                $scope.searched = false;
                $scope.loading = false;
                $scope.group = group;
                $scope.searchParams = {};
                $scope.userList = [];
                $scope.userSelected = [];
                $scope.userRemoved = [];
                $scope.search = function () {
                    $scope.loading = true;
                    groupService.getUserList($scope.group.id, {
                        max: paginationData.itemsPerPage,
                        offset: (paginationData.currentPage - 1) * paginationData.itemsPerPage
                    }).then(function (request) {
                        $scope.userList = request.data;
                        if (currentUser.atLeastTeacher($scope.group) && $scope.userList.length <= 1) {
                            $state.go('group-show.group-student-empty', {id: $scope.group.url});
                        }
                        $scope.paginationData.totalItems = request.headers('total') || 0;
                        _(request.data).forEach(function (it) {
                            $scope.userSelected[it.id] = false;
                            $scope.userRemoved[it.id] = false;
                        });
                        $location.search({page: $scope.paginationData.currentPage});
                        $scope.searched = true;
                        $scope.loading = false;
                    }, function () {
                        $scope.loading = false;
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
                            groupService.removeUserFromGroup($scope.group.id, it).then(function () {
                                $scope.userRemoved[it] = true;
                                $scope.userSelected[it] = false;
                            });
                        }
                    });
                };

            }])

        .controller('GroupAddMembersController', [
            '$scope',
            'GroupService',
            'role',
            function ($scope, GroupService, role) {
                $scope.successMessage = 'group.usersAdded';
                $scope.buttonMessage = 'group.add';
                if (role === 'TEACHER') {
                    $scope.role = 'group.users.addTeacherText';
                    $scope.type = 'TEACHER';
                    $scope.placeholder = 'group.users.addTeacher';
                } else if (role === 'TEACHER_ASSISTANT') {
                    $scope.role = 'group.users.addTeacherAssistantText';
                    $scope.type = 'TEACHER_ASSISTANT';
                    $scope.placeholder = 'group.users.addTeacherAssistant';
                } else {
                    $scope.role = 'group.users.addStudentText';
                    $scope.type = 'USER';
                    $scope.successMessage = 'group.invitesSended';
                    $scope.placeholder = 'group.users.addStudent';
                    $scope.buttonMessage = 'group.send';
                }
                $scope.userList = [];
                $scope.addMap = {users: []};
                $scope.saved = false;
                $scope.error = false;

                var delay = (function () {
                    var timer = 0;
                    return function (callback, ms) {
                        clearTimeout(timer);
                        timer = setTimeout(callback, ms);
                    };
                }());
                $scope.$loadingButton = false;
                $scope.inviteStudents = function () {
                    if (!$scope.error) {
                        if (!$scope.inviteStudent.$valid) {
                            _(_.keys($scope.inviteStudent)).forEach(function (field) {
                                if (field[0] !== '$') {
                                    $scope.inviteStudent[field].$setDirty();
                                }
                            });
                            $scope.error = true;
                        } else {
                            _($scope.userList).forEach(function (it) {
                                if (it.id === undefined) {
                                    if (it.valid === true) {
                                        $scope.addMap.users.push({email: it.email, role: role});
                                    }
                                } else {
                                    $scope.addMap.users.push({id: it.id, role: role});
                                }
                            });
                            $scope.$loadingButton = true;
                            GroupService.addUsersToGroup($scope.group.id, $scope.addMap).then(function () {
                                $scope.$loadingButton = false;
                                $scope.userList = [];
                                $scope.saved = true;
                                $scope.error = false;
                                if (role === 'TEACHER' || role === 'TEACHER_ASSISTANT') {
                                    GroupService.get($scope.$parent.group.id).then(
                                        function (response) {
                                            $scope.$parent.group = response.data;
                                        }
                                    );
                                }
                                delay(function () {
                                    $scope.saved = false;
                                    $scope.$apply();
                                },5000);
                            }, function () {
                                $scope.$loadingButton = false;
                                $scope.saved = false;
                                $scope.error = true;
                            });
                        }
                    }

                };
            }
        ])

        .controller('GroupPendencyController', [
            '$scope',
            'GroupService',
            'paginationData',
            '$location',
            'usSpinnerService',
            function ($scope, groupService, paginationData, $location, usSpinnerService) {
                $scope.selectedAll = false;
                $scope.userSelected = {};
                $scope.userRemoved = {};
                $scope.userAccepted = {};
                $scope.paginationData = paginationData;
                $scope.searched = false;
                $scope.searchParams = {};
                $scope.search = function () {
                    usSpinnerService.spin('spinner');
                    groupService.getUserList($scope.group.id, {
                        max: $scope.paginationData.itemsPerPage,
                        offset: ($scope.paginationData.currentPage - 1) * $scope.paginationData.itemsPerPage
                    }).then(function (response) {
                        $scope.userList = response.data;
                        $scope.paginationData.totalItems  = response.headers('total') || 0;
                        _(response.data).forEach(function (it) {
                            $scope.userSelected[it.id] = false;
                            $scope.userRemoved[it.id] = false;
                            $scope.userAccepted[it.id] = false;
                        });
                        $location.search({ page: $scope.paginationData.currentPage });
                        $scope.searched = true;
                        usSpinnerService.stop('spinner');
                    }, function () {
                        usSpinnerService.stop('spinner');
                    });
                };


                $scope.pageChanged = function () {
                    $scope.search();
                };

                $scope.selectAll = function () {
                    _(_.keys($scope.userSelected)).forEach(function (it) {
                        if (!$scope.userRemoved[it] && !$scope.userAccepted[it]) {
                            $scope.userSelected[it] = !$scope.searchParams.selectedAll;
                        }
                    });
                };

                $scope.searchParams.checkSelectAll = function () {
                    $scope.searchParams.selectedAll = _.values($scope.userSelected).indexOf(true) !== -1;
                };

                $scope.addAll = function () {
                    _(_.keys($scope.userSelected)).forEach(function (it) {
                        if ($scope.userSelected[it]) {
                            //groupService.removeUserFromGroup({'userId': it, 'groupId': $stateParams.id}, function () {
                            $scope.userRemoved[it] = false;
                            $scope.userSelected[it] = false;
                            $scope.userAccepted[it] = true;
                            $scope.$emit('UPDATE_GROUP');
                            //});
                        }
                    });
                };

                $scope.removeAll = function () {
                    _(_.keys($scope.userSelected)).forEach(function (it) {
                        if ($scope.userSelected[it]) {
                            //groupService.removeUserFromGroup({'userId': it, 'groupId': $stateParams.id}, function () {
                            $scope.userRemoved[it] = true;
                            $scope.userSelected[it] = false;
                            $scope.$emit('UPDATE_GROUP');
                            //});
                        }
                    });
                };
                $scope.search();
            }])

        .controller('GroupConfigKeyController', [
            '$scope',
            'GroupService',
            '$stateParams',
            function ($scope, groupService, $stateParams) {
                $scope.$loadingButton = false;
                $scope.generateKey = function () {
                    $scope.$loadingButton = true;
                    groupService.get($stateParams.id).then(
                        function (response) {
                            $scope.group = response.data;
                            groupService.regenerateKey($scope.group.id).then(
                                function (response) {
                                    $scope.$loadingButton = false;
                                    $scope.key = response.data.key;
                                    $scope.$parent.key = $scope.key;
                                }, function() {
                                    $scope.$loadingButton = false;
                                }
                            );
                        }, function () {
                            $scope.$loadingButton = false;
                        }
                    );

                };
            }
        ])

        .controller('GroupKeyController', [
            '$scope',
            'GroupService',
            '$route',
            '$state',
            function ($scope, groupService, $route, $state) {
                $scope.keyForm = {};
                $scope.key = '';
                $scope.group = {};
                $scope.validated = false;
                $scope.error = false;
                $scope.verifyKey = function () {
                    $scope.validated = true;
                    $scope.groupFound = groupService.findGroupByKey($scope.key).then(
                        function (reponse) {
                            $scope.keyForm.key.$setValidity('valid', true);
                            $scope.group = reponse.data.group;
                            $scope.group.role = reponse.data.role;
                        },
                        function () {
                            $scope.valid = false;
                            $scope.keyForm.key.$setValidity('valid', false);
                        }
                    );

                };

                $scope.reloadSearch = function () {
                    $route.reload();
                };

                $scope.confirm = function () {
                    groupService.joinGroupByKey($scope.key).then(function () {
                        $state.go('group-show.quizzes', {id: $scope.group.url});
                    }, function () {
                        $scope.error = true;
                    });
                };
            }])

        .controller('GroupCreateController', [
            '$scope',
            'UserService',
            'currentUser',
            'GroupService',
            '$state',
            '$q',
            '$timeout',
            function ($scope, UserService, currentUser, GroupService, $state, $q, $timeout) {
                $scope.error = false;
                var delay = (function () {
                    var timer = 0;

                    return function (callback, ms) {
                        clearTimeout(timer);
                        timer = setTimeout(callback, ms);
                    };
                }());
                $scope.validateChar = /^[a-zA-Z0-9\-]+$/;
                $scope.replaceSpecialChars = function (str) {
                    if (str !== undefined) {
                        str = str.toLowerCase();
                        var $spaceSymbol = '-', specialChars, regex, returnString = str, i;
                        specialChars = [
                            {val: 'a', let: 'áàãâä'},
                            {val: 'e', let: 'éèêë'},
                            {val: 'i', let: 'íìîï'},
                            {val: 'o', let: 'óòõôö'},
                            {val: 'u', let: 'úùûü'},
                            {val: 'c', let: 'ç'}
                        ];
                        for (i = 0; i < specialChars.length; i = i + 1) {
                            regex = new RegExp('[' + specialChars[i].let + ']', 'g');
                            returnString = returnString.replace(regex, specialChars[i].val);
                            regex = null;
                        }
                        //noinspection JSLint
                        return returnString.replace(/[^a-z0-9]/gmi, ' ').replace(/\s+/g, ' ').replace(/\s/g, $spaceSymbol);
                    }
                    return str;
                };

                $scope.currentUser = currentUser;
                $scope.groupInfo = {
                    name: '',
                    nameMaxSize: 45,
                    url: '',
                    teacherList: [$scope.currentUser],
                    teacherAssistantList: {},
                    description: '',
                    descriptionMaxSize: 112,
                    startDate: undefined,
                    endDate: undefined
                };
                $scope.institutionList = [];
                UserService.getCurrentUserInstitutions().then(function (response) {
                    $scope.institutionList = {};
                    angular.forEach(response.data, function (item) {
                        $scope.institutionList[item.id] = item.name;
                    });
                });
                $scope.validateStartDate = function (value, revalidate) {
                        if (revalidate === null) {
                            revalidate = true;
                        }
                        if ((new Date(value)).toString() !== 'Invalid Date' && $scope.groupInfo.endDate !== undefined) {
                            if(revalidate) {
                                $timeout(function () {
                                    $scope.createGroup.groupEndDate.$setValidity('custom', $scope.validateEndDate($scope.groupInfo.endDate, false));
                                }, 100);
                            }
                            return moment($scope.groupInfo.endDate).isAfter(moment(value));
                        }
                        return true;
                };
                $scope.validateEndDate = function (value, revalidate) {
                    if (revalidate === null) {
                        revalidate = true;
                    }
                    if ((new Date(value)).toString() !== 'Invalid Date' && $scope.groupInfo.startDate !== undefined) {
                        if(revalidate) {
                            $timeout(function () {
                                $scope.createGroup.groupStartDate.$setValidity('custom', $scope.validateStartDate($scope.groupInfo.startDate, false));
                            }, 100);
                        }
                        return moment(value).isAfter(moment($scope.groupInfo.startDate));
                    }
                    return true;
                };

                $scope.validateName = function () {
                    var deferred = $q.defer();
                    var groupToValidate = {name: $scope.groupInfo.name}, urlEmpty = $scope.groupInfo.url === '' || $scope.groupInfo.url ===  undefined;
                    delay(function () {
                        if (urlEmpty) {
                            groupToValidate.url = $scope.replaceSpecialChars($scope.groupInfo.name);
                        }
                        GroupService.validate(groupToValidate).then(function () {
                            $scope.createGroup.groupName.$setValidity('name', true);
                            deferred.resolve(true);
                            if (urlEmpty) {
                                $scope.groupInfo.url = groupToValidate.url;
                                $scope.createGroup.groupUrl.$setValidity('uniqueUrl', true);
                            }
                        }, function (response) {
                            if (_.pluck(response.data.errors, 'code').indexOf(302021) === -1) {
                                if (urlEmpty) {
                                    $scope.groupInfo.url = groupToValidate.url;
                                    $scope.createGroup.groupUrl.$setValidity('uniqueUrl', true);
                                }
                            }
                            if (_.pluck(response.data.errors, 'code').indexOf(302011) !== -1) {
                                $scope.createGroup.groupName.$setValidity('name', false);
                                deferred.resolve(false);
                            } else {
                                $scope.createGroup.groupName.$setValidity('name', true);
                                deferred.resolve(true);
                            }
                        });
                    }, 1000);

                    return deferred.promise;

                };

                $scope.validateUrl = function () {
                    var deferred = $q.defer();
                    var validUrl = $scope.validateChar.test($scope.groupInfo.url);
                    $scope.createGroup.groupUrl.$setValidity('uniqueUrl', true);
                    deferred.resolve(true);
                    $scope.createGroup.groupUrl.$setValidity('validUrl', validUrl);
                    if (validUrl) {
                        delay(function () {
                            GroupService.validate($scope.groupInfo).then(function () {
                                $scope.createGroup.groupUrl.$setValidity('uniqueUrl', true);
                                deferred.resolve(true);
                            }, function (response) {
                                if (_.pluck(response.data.errors, 'code').indexOf(302021) !== -1) {
                                    $scope.createGroup.groupUrl.$setValidity('uniqueUrl', false);
                                    deferred.resolve(false);
                                } else {
                                    $scope.createGroup.groupUrl.$setValidity('uniqueUrl', true);
                                    deferred.resolve(true);
                                }
                            });
                        }, 1000);
                    }
                    return deferred.promise;
                };
                $scope.$loadingButton = false;
                $scope.formSubmit = function () {
                    $scope.validateStartDate();
                    $scope.validateEndDate();
                    $q.all([$scope.validateName(), $scope.validateUrl]).then(function () {
                        if (!$scope.createGroup.$valid) {
                            _(_.keys($scope.createGroup)).forEach(function (field) {
                                if (field[0] !== '$') {
                                    $scope.createGroup[field].$setDirty();
                                }
                            });
                        } else {
                            $scope.$loadingButton = true;
                            var groupToSave = _.clone($scope.groupInfo, true);
                            groupToSave.institution = {id: groupToSave.institution};
                            groupToSave.startDate = moment(groupToSave.startDate).format('YYYY-MM-DDTHH:mm:ssZ');
                            groupToSave.endDate = moment(groupToSave.endDate).format('YYYY-MM-DDTHH:mm:ssZ');
                            GroupService.create(groupToSave).then(function (response) {
                                $scope.error = false;
                                $scope.$loadingButton = false;
                                $state.go('group-show.group-student-empty', {id: response.data.url});
                            }, function () {
                                $scope.error = true;
                                $scope.$loadingButton = false;
                            });
                        }
                    });
                };
            }
        ])

        .controller('GroupEditController', [
            '$scope',
            'UserService',
            'currentUser',
            'GroupService',
            'group',
            function ($scope, UserService, currentUser, GroupService, group) {
                $scope.group = group;
                $scope.saved = false;
                $scope.error = false;
                $scope.enableConfirm = false;
                var delay = (function () {
                    var timer = 0;

                    return function (callback, ms) {
                        clearTimeout(timer);
                        timer = setTimeout(callback, ms);
                    };
                }());

                $scope.checkChanges = function () {
                    delay(function () {
                        if($scope.createGroup.$valid) {
                            if ($scope.createGroup.groupName.$dirty && $scope.groupInfo.name !== $scope.group.name) {
                                $scope.enableConfirm = true;
                            } else if ($scope.createGroup.groupDescription.$dirty && $scope.groupInfo.description !== $scope.group.description) {
                                $scope.enableConfirm = true;
                            } else if (new Date($scope.groupInfo.endDate).toString() !== new Date($scope.group.endDate).toString()) {
                                $scope.enableConfirm = true;
                            } else if (new Date($scope.groupInfo.startDate).toString() !== new Date($scope.group.startDate).toString()) {
                                $scope.enableConfirm = true;
                            } else if ($scope.createGroup.groupUrl.$dirty && $scope.groupInfo.url !== $scope.group.url) {
                                $scope.enableConfirm = true;
                            } else {
                                $scope.enableConfirm = false;
                            }
                        } else {
                            $scope.enableConfirm = false;
                        }
                        $scope.$apply();
                    }, 200);
                };

                $scope.validateChar = /^[a-zA-Z0-9\-]+$/;
                $scope.replaceSpecialChars = function (str) {
                    if (str !== undefined) {
                        str = str.toLowerCase();
                        var $spaceSymbol = '-', specialChars, regex, returnString = str, i;
                        specialChars = [
                            {val: 'a', let: 'áàãâä'},
                            {val: 'e', let: 'éèêë'},
                            {val: 'i', let: 'íìîï'},
                            {val: 'o', let: 'óòõôö'},
                            {val: 'u', let: 'úùûü'},
                            {val: 'c', let: 'ç'}
                        ];
                        for (i = 0; i < specialChars.length; i = i + 1) {
                            regex = new RegExp('[' + specialChars[i].let + ']', 'g');
                            returnString = returnString.replace(regex, specialChars[i].val);
                            regex = null;
                        }
                        //noinspection JSLint
                        return returnString.replace(/[^a-z0-9]/gmi, ' ').replace(/\s+/g, ' ').replace(/\s/g, $spaceSymbol);
                    }
                    return str;
                };

                $scope.currentUser = currentUser;
                $scope.groupInfo = _.clone($scope.group, true);

                $scope.groupInfo.nameMaxSize =  45;
                $scope.groupInfo.descriptionMaxSize =  112;

                $scope.institutionList = [];
                UserService.getCurrentUserInstitutions().then(function (response) {
                    $scope.institutionList = {};
                    angular.forEach(response.data, function (item) {
                        $scope.institutionList[item.id] = item.name;
                    });
                });
                $scope.validateStartDate = function (value) {
                    if ((new Date(value)).toString() !== 'Invalid Date' && $scope.groupInfo.endDate !== undefined) {
                        if(moment($scope.groupInfo.endDate).isAfter(moment(value))) {
                            $scope.checkChanges();
                        } else {
                            $scope.enableConfirm = false;
                        }
                        return moment($scope.groupInfo.endDate).isAfter(moment(value));
                    }
                    $scope.checkChanges();
                    return true;
                };
                $scope.validateEndDate = function (value) {
                    $scope.checkChanges();
                    if ((new Date(value)).toString() !== 'Invalid Date' && $scope.groupInfo.startDate !== undefined) {
                        if(moment(value).isAfter(moment($scope.groupInfo.startDate))) {
                            $scope.checkChanges();
                        } else {
                            $scope.enableConfirm = false;
                        }
                        return moment(value).isAfter(moment($scope.groupInfo.startDate));
                    }
                    $scope.checkChanges();
                    return true;
                };

                $scope.validateName = function () {
                    delay(function () {
                        GroupService.validate($scope.groupInfo).then(function () {
                            $scope.createGroup.groupName.$setValidity('name', true);
                            $scope.groupInfo.url = $scope.groupInfo.url === '' || undefined ? $scope.replaceSpecialChars($scope.groupInfo.name) : $scope.groupInfo.url;
                        }, function (response) {
                            if (_.pluck(response.data.errors, 'code').indexOf(302011) !== -1) {
                                $scope.createGroup.groupName.$setValidity('name', false);
                            } else {
                                $scope.createGroup.groupName.$setValidity('name', true);
                                $scope.groupInfo.url = $scope.groupInfo.url === '' || undefined ? $scope.replaceSpecialChars($scope.groupInfo.name) : $scope.groupInfo.url;
                            }
                        });
                        $scope.checkChanges();
                    }, 1000);
                };

                $scope.validateUrl = function () {
                    $scope.createGroup.groupUrl.$setValidity('uniqueUrl', true);
                    $scope.createGroup.groupUrl.$setValidity('validUrl', $scope.validateChar.test($scope.groupInfo.url));
                    if ($scope.createGroup.groupUrl.$valid) {
                        delay(function () {
                            GroupService.validate($scope.groupInfo).then(function () {
                                $scope.createGroup.groupUrl.$setValidity('uniqueUrl', true);
                            }, function (response) {
                                if (_.pluck(response.data.errors, 'code').indexOf(302021) !== -1) {
                                    $scope.createGroup.groupUrl.$setValidity('uniqueUrl', false);
                                } else {
                                    $scope.createGroup.groupUrl.$setValidity('uniqueUrl', true);
                                }
                            });
                            $scope.checkChanges();
                        }, 1000);
                    }
                };
                $scope.$loadingButton = false;
                $scope.formSubmit = function () {
                    if (!$scope.createGroup.$valid) {
                        _(_.keys($scope.createGroup)).forEach(function (field) {
                            if (field[0] !== '$') {
                                $scope.createGroup[field].$setDirty();
                            }
                        });
                    } else {
                        var groupToSave = _.clone($scope.groupInfo, true);
                        groupToSave.name = $scope.groupInfo.name;
                        groupToSave.description = $scope.groupInfo.description;
                        groupToSave.startDate = moment(groupToSave.startDate).format('YYYY-MM-DDTHH:mm:ssZ');
                        groupToSave.endDate = moment(groupToSave.endDate).format('YYYY-MM-DDTHH:mm:ssZ');
                        $scope.$loadingButton = true;
                        GroupService.update(groupToSave).then(function (response) {
                            $scope.group.name = response.data.name;
                            $scope.group.institution = response.data.institution;
                            $scope.group.endDate = response.data.endDate;
                            $scope.group.startDate = response.data.startDate;
                            $scope.group.description = response.data.description;
                            $scope.group.url = response.data.url;
                            $scope.enableConfirm = false;
                            $scope.saved = true;
                            $scope.error = false;
                            $scope.$loadingButton = false;
                            $scope.$parent.group = $scope.group;
                        }, function () {
                            $scope.saved = false;
                            $scope.error = true;
                            $scope.$loadingButton = false;
                        });
                    }

                };
            }
        ])

        .controller('GroupTopcoderStudentController', [
            '$scope',
            'UserService',
            function ($scope, UserService) {
                UserService.getTopCoders({'max': 12}).then(function (response) {
                    $scope.topcoder = response.data;
                });
            }
        ])

        .controller('GroupSubmissionShowController', [
            '$scope',
            'submission',
            'SubmissionService',
            'problem',
            function ($scope, submission, SubmissionService, problem) {
                $scope.submission = submission;
                $scope.problem = problem;
                var listSubmissions = function (offset) {
                    SubmissionService.list({user: submission.user.id, problem: submission.problem.id, max:100, offset: offset}).then(
                        function (response) {
                            $scope.submissionList=$scope.submissionList?$scope.submissionList.concat(response.data):response.data;
                            offset += 100;
                            if (response.headers('total') > offset) {
                                listSubmissions(offset);
                            }
                        }
                    );
                };
                if (submission !== undefined) {
                    listSubmissions(0);
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
        ]);

}(angular, require, _));
