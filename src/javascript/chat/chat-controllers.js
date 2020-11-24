/*global angular, require, _*/

(function (angular, require) {
    'use strict';

    var chatApp = require('./chat-app');

    var types = [
        'PROBLEM_QUESTION',
        'PROBLEM_BAD_NAME',
        'BAD_DESCRIPTION',
        'WRONG_TOPIC',
        'BAD_TEST_CASE',
        'MISSING_TEST_CASE',
        'DIRECT_MESSAGE'];

    angular.module(chatApp.name)

        .controller('ChatListController', [
            '$scope',
            'currentUser',
            'MessageService',
            'filterParams',
            'paginationData',
            '$location',
            '$modal',
            function ($scope, currentUser, MessageService, filterParams, paginationData, $location, $modal) {

                $scope.paginationData = paginationData;
                $scope.filterParams = filterParams;
                $scope.currentUser = currentUser;

                function fetchMessages(filter) {

                    var params = {
                        filter: filter.filter,
                        filterId: filter.id,
                        fetch: 'user,problem,group',
                        grouped: true,
                        offset: ($scope.paginationData.currentPage - 1) * $scope.paginationData.max
                    };

                    // $scope.filterParams.page = undefined;

                    MessageService.list(params).then(function(resp) {
                        var userById = _.indexBy(resp.data.users, 'id');
                        var problemById = _.indexBy(resp.data.problems, 'id');
                        var groupById = _.indexBy(resp.data.groups, 'id');

                        /*jshint camelcase: false */
                        $scope.messages = resp.data.messages.map(function(m) {
                            m.user = userById[m.senderId];
                            m.originalUser = userById[m.user_id];
                            m.problem = m.problem_id ? problemById[m.problem_id] : null;
                            m.group = m.group_id ? groupById[m.group_id] : null;
                            m.recipient = m.recipient_id ? userById[m.recipient_id] : null;

                            m.category = 'REPORT';
                            m.type = types[m.type];

                            if (!m.last_view_millis || m.last_view_millis < new Date(m.datecreated).getTime()) {
                                m.unread = true;
                            }

                            if (m.type === 'PROBLEM_QUESTION') {
                                m.category = 'QUESTION';
                            } else if (m.type === 'DIRECT_MESSAGE') {
                                m.category = 'DIRECT';
                            }

                            m.truncated = true;
                            m.truncatedBody = m.body.replace(/\n/g, ' ');
                            if (m.truncatedBody.length > 160) {
                                m.truncatedBody = m.truncatedBody.substring(0, 160) + ' ...';
                            }

                            return m;
                        });
                        $scope.filterParams.page = $scope.paginationData.currentPage;
                        $location.search($scope.filterParams);
                        updatePageData();

                    });
                }

                $scope.filter = function(filter) {
                    $scope.filterParams = filter;
                    fetchMessages(filter);
                };

                $scope.filter($scope.filterParams);

                $scope.changePage = function () {
                    // $scope.filterParams.page = $scope.filterParams.page + 1;
                    $scope.filter($scope.filterParams);
                };

                var updateStats = function() {
                    MessageService.stats().then(function(resp) {
                        $scope.stats = resp.data;
                        updatePageData();
                    });
                };

                var updatePageData = function() {
                    if (!$scope.stats) {
                        return;
                    }
                    if($scope.filterParams.filter === undefined && $scope.filterParams.id === undefined) {
                        $scope.paginationData.totalItems = $scope.stats.total;
                    } else if($scope.filterParams.filter === 'unresolved') {
                        $scope.paginationData.totalItems = $scope.stats.unresolved;
                    } else if($scope.filterParams.filter === 'sent') {
                        $scope.paginationData.totalItems = $scope.stats.sent;
                    }
                };

                updateStats();

                $scope.send = function(info) {
                    $scope.saving = true;

                    var message = {
                        messageGroup: info.id,
                        body: info.reply
                    };

                    MessageService.save(message).then(function(resp) {
                        $scope.saving = false;

                        info.user = currentUser;
                        info.datecreated = resp.data.dateCreated;
                        info.reply = null;
                        info.truncated = true;
                    }, function() { $scope.saving = false; });
                };

                $scope.archiveOld = function() {
                    var filter = $scope.filter;
                    $modal.open({
                        animation: true,
                        templateUrl: 'archiveModal.html',
                        backdrop: 'static',
                        size: 'sm',
                        windowClass: 'change-date-modal',
                        controller: function ($scope) {

                            $scope.confirm = function () {
                                $scope.archiveError = false;
                                $scope.archiveSuccess = false;
                                MessageService.archiveOld().then(function(resp) {

                                    $scope.archiveSuccess = true;
                                    $scope.archivedCount = resp.data.count;

                                    if (resp.data.count > 0) {
                                        filter({ filter: 'unresolved' });
                                        updateStats();
                                    }
                                }, function() {
                                    $scope.archiveError = true;
                                });
                            };
                        }
                    });
                };
            }])
        .controller('MessageShowController', [
            '$scope',
            '$stateParams',
            'currentUser',
            'UserService',
            'MessageService',
            'SubmissionService',
            'ProblemService',
            'GroupService',
            '$state',
            function($scope, $stateParams, currentUser, UserService, MessageService,
                     SubmissionService, ProblemService, GroupService,
                     $state) {

                var messageGroup = $stateParams.messageGroup;
                var selectedProblem = $stateParams.problem;
                var selectedGroup = $stateParams.group;
                var selectedRecipient = $stateParams.recipient;

                $scope.isReport = $stateParams.isReport;

                $scope.message = {
                    messageGroup: messageGroup,
                    problemId: selectedProblem,
                    groupId: selectedGroup,
                    recipientId: selectedRecipient
                };

                $scope.isNewMessage = !messageGroup;

                if ($scope.isNewMessage && selectedProblem && selectedGroup) {
                    $scope.message.type = 'PROBLEM_QUESTION';
                }

                function linkSubmissions(text, userId) {
                    if (userId) {
                        return text.replace(/(#[\d]+)/g, function(x) {
                            var number = parseInt(x.substring(1, x.length));
                            return '<a href="" ng-click="fetchSubmissionCode(' + number + ', ' + userId + ')">' + x + '</a>';
                        });
                    } else {
                        return text.replace(/(#[\d]+)/g, function(x) {
                            var number = parseInt(x.substring(1, x.length));
                            return '<a href="" ng-click="fetchSubmissionCode(' + number + ')">' + x + '</a>';
                        });
                    }
                }

                $scope.fetchSubmissions = function(problem, user, offset) {
                    SubmissionService.list({ problem: problem, user: user, offset: offset }).then(function(resp) {
                        $scope.paginationData.totalItems = +resp.headers('total') || 0;
                        $scope.submissions = resp.data;
                    });
                };

                if ($scope.isNewMessage) {

                    if ($stateParams.submission) {
                        $scope.message.body = 'Estou com dúvida na submissão #' + $stateParams.submission;
                    }

                    $scope.author = currentUser;

                    if (selectedRecipient) {
                        UserService.get(+selectedRecipient).then(function(resp) {
                            $scope.recipient = resp.data;
                            $scope.recipients = resp.data.name;
                        });
                    }

                    if (!selectedRecipient && selectedProblem) {
                        $scope.fetchSubmissions(+selectedProblem, currentUser.id);
                        ProblemService.get(+selectedProblem).then(function(resp) {
                            $scope.problem = resp.data;
                            if ($scope.isReport) {
                                $scope.recipients = $scope.problem.suggestedBy.name;
                            }
                        });
                    }

                    if (!selectedRecipient && selectedGroup) {
                        GroupService.get(+selectedGroup).then(function(resp) {
                            $scope.groupSelect = {
                                group: resp.data
                            };

                            $scope.groups = [resp.data];
                            $scope.changeGroup();
                        });

                        $scope.isGroupSelected = true;
                    } else if (!selectedRecipient && !selectedRecipient && !$scope.isReport) {
                        UserService.getCurrentUserGroups().then(function(resp) {
                            $scope.groups = resp.data;
                            $scope.groupSelect = {
                                group: $scope.groups[0]
                            };
                            $scope.changeGroup();
                        });
                    }
                }

                $scope.types = [
                    {value: 'BAD_TEST_CASE', label: 'Caso de teste inválido'},
                    {value: 'MISSING_TEST_CASE', label: 'Falta caso de teste'},
                    {value: 'BAD_DESCRIPTION', label: 'A descrição está ruim'},
                    {value: 'PROBLEM_BAD_NAME', label: 'O nome está ruim'},
                    {value: 'WRONG_TOPIC', label: 'Acrescentar/Remover tópico'}
                ];


                // gambiarra porque o ng-model dentro do ng-if cria um scope filho
                $scope.groupSelect = {};
                $scope.typeSelect = {
                    type: $scope.types[0]
                };

                $scope.changeGroup = function() {

                    $scope.group = $scope.groupSelect.group;
                    $scope.message.groupId = $scope.group.id;

                    var concatRecipients = function(teachers, assistants) {
                        $scope.recipients = assistants.concat(teachers).map(function(r) {
                            return r.name;
                        }).join(', ');
                    };


                    if ($scope.group.teachers) {
                        concatRecipients($scope.group.teachers, $scope.group.teacherAssistants);
                    } else {
                        GroupService.get($scope.group.id).then(function(resp) {
                            concatRecipients(resp.data.teachers, resp.data.teacherAssistants);
                        });
                    }
                };

                $scope.paginationData = {
                    totalItems: 0,
                    itemsPerPage: 10,
                    currentPage: 0
                };

                var problemId, userId;

                function loadMessages() {
                    MessageService.list({ messageGroup: messageGroup, fetch: 'user,problem,group' }).then(function(resp) {
                        var userById = _.indexBy(resp.data.users, 'id');
                        var problemById = _.indexBy(resp.data.problems, 'id');
                        var groupById = _.indexBy(resp.data.groups, 'id');

                        problemId = resp.data.messageGroup.problemId;
                        userId = resp.data.messageGroup.userId;
                        var groupId = resp.data.messageGroup.groupId;
                        var recipientId = resp.data.messageGroup.recipientId;

                        $scope.message.type = resp.data.messageGroup.type;

                        if (problemId && $scope.message.type !== 'PROBLEM_QUESTION') {
                            ProblemService.get(problemId).then(function(resp) {
                                $scope.problemAuthor = resp.data.suggestedBy;
                            });
                        }

                        $scope.problem = problemId ? problemById[problemId] : null;
                        $scope.group = groupId ? groupById[groupId] : null;
                        $scope.author = userId ? userById[userId] : null;
                        $scope.recipient = recipientId ? userById[recipientId] : null;

                        $scope.users = resp.data.users;
                        $scope.resolved = resp.data.messageGroup.messageStatus !== 'UNRESOLVED';


                        $scope.messages = resp.data.messages.map(function(m) {
                            m.user = userById[m.senderId];

                            m.body = linkSubmissions(m.body, userId);
                            return m;
                        });

                        if (problemId) {
                            $scope.fetchSubmissions(problemId, userId);
                        }
                    });
                }

                if (!$scope.isNewMessage) {
                    loadMessages();
                }


                $scope.send = function() {
                    $scope.saving = true;

                    if ($scope.isReport) {
                        $scope.message.type = $scope.typeSelect.type.value;
                    }

                    MessageService.save($scope.message).then(function(resp) {
                        $scope.saving = false;

                        resp.data.user = currentUser;

                        if (!$scope.messages) {
                            $state.go('chat-list');
                        } else {
                            $scope.messages.push(resp.data);
                            $scope.message = { messageGroup: messageGroup };
                        }

                    }, function() { $scope.saving = false; });
                };

                $scope.changeStatus = function() {

                    MessageService.status(messageGroup, $scope.resolved ? 'UNRESOLVED' : 'RESOLVED').then(function() {
                        $scope.resolved = !$scope.resolved;
                    });
                };

                $scope.viewSubmission = function(submission) {

                    if (submission) {
                        SubmissionService.get(submission.id).then(function(resp) {
                            $scope.submission = resp.data;
                        });
                    } else {
                        $scope.submission = null;
                    }
                };

                $scope.paginationChanged = function() {
                    var offset = ($scope.paginationData.currentPage * $scope.paginationData.itemsPerPage);
                    $scope.fetchSubmissions(problemId || selectedProblem, $scope.author.id, offset);
                };

                $scope.fetchSubmissionCode = function(tryCount, userId) {
                    SubmissionService.getSubmissionCodeByProblemAndTry(problemId, tryCount, userId).then(function(resp) {
                        $scope.submission = resp.data;
                    });
                };

                $scope.addSubmission = function(tryCount) {
                   if (!$scope.message.body) {
                       $scope.message.body = '';
                   }
                   $scope.message.body += '\nPor favor, verificar a #' + tryCount;
                };
            }
        ]).directive('ngBindHtmlIfSafe', ['$compile', '$sce', function ($compile, $sce) {
            return function (scope, element, attrs) {
                scope.$watch(
                    function (scope) {
                        return scope.$eval(attrs.ngBindHtmlIfSafe);
                    },
                    function (value) {
                        var sanitizedHtml = null;
                        try {
                            sanitizedHtml = $sce.getTrustedHtml(value);
                        } catch (ex) {}

                        if (sanitizedHtml !== null && sanitizedHtml.trim() !== '') {
                            element.html(value);
                        } else {
                            element.text(value);
                        }

                        $compile(element.contents())(scope);
                    }
                );
            };
        }]).directive('autofocus', function($timeout) {
            return {
                link: function(scope, element) {
                    $timeout(function() {
                        element.focus();
                    });
                }
            };
        });

}(angular, require));
