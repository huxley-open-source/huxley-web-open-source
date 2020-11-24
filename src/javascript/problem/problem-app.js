/*global module, require, angular, _*/

(function (module, angular) {
    'use strict';
    var messagesPtBr = require('./i18n/messages_pt_BR'),
        messagesEnUs = require('./i18n/messages_en_US'),
        userApp = require('../user/user-app'),
        securityModule = require('../security/security-module'),
        componentsModule = require('../components/components-module');

    module.exports = angular.module('thehuxley.problem', [
        securityModule.name,
        componentsModule.name,
        userApp.name,
        'thehuxley.templates',
        'pascalprecht.translate',
        'ngRoute',
        'ngResource',
        'ui.bootstrap',
        'ui.router',
        'angularMoment',
        'ui.bootstrap.tpls',
        'restangular',
        'ui.slider', // slider para o nd do problema
        'angularSpinner', // spinner de loading
        'ngSanitize',  //necessário para a diretiva ng-bind-html
        'ui.ace', // editor de código,
        'textAngular',
        'ngFileSaver',
        'ngclipboard',
        'ngFileUpload'
    ])

        .config([
            'apiURL',
            '$stateProvider',
            'RestangularProvider',
            '$translateProvider',
            '$provide',
            function (apiURL, $stateProvider, RestangularProvider, $translateProvider, $provide) {

                $translateProvider.translations('pt_BR', messagesPtBr);
                $translateProvider.translations('en_US', messagesEnUs);
                $translateProvider.preferredLanguage('pt_BR');

                RestangularProvider.setBaseUrl(apiURL);
                RestangularProvider.setFullResponse(true);

                $provide.decorator('taOptions', [
                    '$delegate',
                    '$modal',
                    'taRegisterTool',
                    'ProblemService',
                    function (taOptions, $modal, taRegisterTool, ProblemService) {
                        taOptions.toolbar[3] = [];
                        // Create our own insertImage button
                        taOptions.defaultFileDropHandler = function( file, insertAction ) {
                            if( file.type.substring( 0, 5 ) !== 'image' ) {
                                return;
                            }
                            if( file.size > 5000000 ) { //5MB
                                return;
                            }
                            var formData = new FormData();
                            formData.append('file', file);
                            ProblemService.sendImage(formData).then(function (response) {
                                insertAction( 'insertImage', apiURL + '/problems/image/' + response.data.name, true );
                            });
                            return true;
                        };

                        taRegisterTool('uploadImage', {
                            iconclass: 'fa fa-image',
                            action: function (deferred,restoreSelection) {
                                $modal.open({
                                    controller: function($scope, $modalInstance, ProblemService, apiURL){

                                        $scope.image = '';

                                        $scope.progress = 0;
                                        $scope.files = [];

                                        $scope.upload = function(){
                                            var formData = new FormData();
                                            formData.append('file', $scope.files);
                                            ProblemService.sendImage(formData).then(function (response) {
                                                $scope.image = apiURL + '/problems/image/' + response.data.name;
                                            });
                                        };

                                        $scope.insert = function(){
                                            $modalInstance.close($scope.image);
                                        };
                                    },
                                    templateUrl: 'components/templates/upload-file-modal.tpl.html'
                                }).result.then(
                                    function (result) {
                                        restoreSelection();
                                        document.execCommand('insertImage', true, result);
                                        deferred.resolve();
                                    },
                                    function () {
                                        deferred.resolve();
                                    }
                                );
                                return false;
                            }
                        });
                        taOptions.toolbar[3].push('uploadImage');

                        return taOptions;
                    }
                ]);

                $stateProvider
                    .state('problem-list', {
                        url: '/problems?topics&page&q&nd&excludeCorrect&ndGe&ndLe&status&filter&quizOnly&problemType',
                        templateUrl: 'problem/templates/problem-list.tpl.html',
                        controller: 'ProblemListController',
                        params: {
                            'topics':{
                                array: true,
                                value: undefined
                            },
                            'page': undefined,
                            'q': undefined,
                            'nd': undefined,
                            'excludeCorrect': undefined,
                            'ndGe': undefined,
                            'ndLe': undefined,
                            'problemType': 'ALGORITHM'
                        },
                        reloadOnSearch: true,
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },

                            searchParams: function ($stateParams) {
                                var params = _.clone($stateParams, true);
                                if ($stateParams.nd) {
                                    params.nd = $stateParams.nd;
                                }
                                if ($stateParams.ndGe) {
                                    params.ndGe = parseInt($stateParams.ndGe, 10);
                                }
                                if ($stateParams.ndLe) {
                                    params.ndLe = parseInt($stateParams.ndLe, 10);
                                }
                                if ($stateParams.topics) {
                                    params.topics = [];
                                    _.forEach($stateParams.topics, function (topic) {
                                        params.topics.push(parseInt(topic, 10));
                                    });
                                }

                                return params;
                            },

                            paginationData: function ($stateParams) {
                                return {
                                    currentPage: $stateParams.page ? parseInt($stateParams.page, 10) : 1,
                                    totalItems: $stateParams.page ? parseInt($stateParams.page, 10) * 10 : 0,
                                    max: 10,
                                    offset: 0,
                                    maxSize: 5
                                };
                            }
                        }
                    })

                    .state('problem-manage', {
                        url: '/problems/manage?topics&page&q&nd&excludeCorrect&ndGe&ndLe$status',
                        templateUrl: 'problem/templates/problem-manage.tpl.html',
                        controller: 'ProblemManageController',
                        reloadOnSearch: false,
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },

                            searchParams: function ($stateParams, currentUser, $state) {
                                if (!currentUser.atLeastTeacherAssistant()) {
                                    $state.go('not-found');
                                }
                                var params = _.clone($stateParams, true);
                                if ($stateParams.nd) {
                                    params.nd = parseInt($stateParams.nd, 10);
                                }
                                if ($stateParams.ndGe) {
                                    params.ndGe = parseInt($stateParams.ndGe, 10);
                                }
                                if ($stateParams.ndLe) {
                                    params.ndLe = parseInt($stateParams.ndLe, 10);
                                }
                                if ($stateParams.topics) {
                                    params.topics = [];
                                    _.forEach($stateParams.topics, function (topic) {
                                        params.topics.push(parseInt(topic, 10));
                                    });
                                }
                                params.filter = 'suggested';

                                if (currentUser.atLeastAdmin()) {
                                    params.filter = null;
                                }

                                return params;
                            },

                            paginationData: function ($stateParams) {
                                return {
                                    currentPage: $stateParams.page ? parseInt($stateParams.page, 10) : 1,
                                    totalItems: $stateParams.page ? parseInt($stateParams.page, 10) * 10 : 0,
                                    max: 10,
                                    offset: 0,
                                    maxSize: 5
                                };
                            }
                        }
                    })

                    .state('problem-create', {
                        url: '/problems/create',
                        templateUrl: 'problem/templates/problem-create1.tpl.html',
                        controller: 'ProblemCreateController',
                        resolve: {
                            problem: function ($q, SecurityService, $state) {
                                var deferred = $q.defer();
                                SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.isAuthenticated()) {
                                        if (currentUser.atLeastTeacherAssistant()) {
                                            deferred.resolve({level: 1, timeLimit: 1});
                                        } else {
                                            $state.go('not-found', {}, { location: false });
                                        }
                                    } else {
                                        $state.go('problem-unauthenticated', {}, { location: false });
                                    }

                                });

                                return deferred.promise;
                            },
                            editable: function () {
                                return false;
                            }
                        }
                    })

                    .state('problem-choices', {
                        url: '/problems/choices',
                        templateUrl: 'problem/templates/problem-choices.tpl.html',
                        controller: 'ProblemChoicesController',
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            }
                        }
                    })

                    .state('problem-choices-create', {
                        url: '/problems/choices/create',
                        templateUrl: 'problem/templates/problem-choices-create.tpl.html',
                        controller: 'ProblemChoicesCreateController',
                        resolve: {
                            problem: function ($q, SecurityService, $state) {
                                var deferred = $q.defer();
                                SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.isAuthenticated()) {
                                        if (currentUser.atLeastTeacherAssistant()) {
                                            deferred.resolve({level: 1, timeLimit: 1});
                                        } else {
                                            $state.go('not-found', {}, { location: false });
                                        }
                                    } else {
                                        $state.go('problem-unauthenticated', {}, { location: false });
                                    }

                                });

                                return deferred.promise;
                            },
                            editable: function () {
                                return false;
                            }
                        }
                    })
                    .state('problem-choices-quiz-create', {
                        url: '/problems/choices/quiz/create',
                        templateUrl: 'problem/templates/problem-choices-quiz-create.tpl.html',
                        controller: 'ProblemChoicesQuizCreateController',
                        resolve: {
                            quiz: function ($q) {
                                var deferred = $q.defer();
                                //SecurityService.requestCurrentUser().then(function (currentUser) {
                                    //if (currentUser.isAuthenticated()) {
                                    //    if (currentUser.atLeastTeacher()) {
                                            deferred.resolve({ questions: [] });
                                    //    } else {
                                    //        $state.go('not-found', {}, { location: false });
                                    //    }
                                    //} else {
                                    //    $state.go('problem-unauthenticated', {}, { location: false });
                                    //}
                                //});

                                return deferred.promise;
                            }
                        }
                    })
                    .state('problem-choices-show', {
                        url: '/problems/choices/:id',
                        templateUrl: 'problem/templates/problem-choices-show.tpl.html',
                        controller: 'ProblemChoicesShowController',
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },
                            problem: function ($q, $stateParams, $state, $timeout) {
                                var deferred = $q.defer();
                                if (!$stateParams.id) {
                                    $timeout(function () {
                                        $state.go('not-found', {}, {location: false});
                                    });
                                } else {
                                    deferred.resolve({id: $stateParams.id});
                                }
                                return deferred.promise;
                            }
                        }
                    })

                    .state('problem-choices-quiz', {
                        url: '/problems/choices/quiz/:id',
                        templateUrl: 'problem/templates/problem-choices-quiz-show.tpl.html',
                        controller: 'ProblemChoicesQuizShowController',
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            }
                        }
                    })

                    .state('problem-edit', {
                        url: '/problems/:id/edit',
                        templateUrl: 'problem/templates/problem-create1.tpl.html',
                        controller: 'ProblemCreateController',
                        resolve: {
                            problem: function (ProblemService, $stateParams, $q, SecurityService, $state) {
                                var deferred = $q.defer();
                                SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.isAuthenticated()) {
                                        if (currentUser.atLeastTeacherAssistant()) {
                                            ProblemService.get($stateParams.id).then(function (response) {
                                                deferred.resolve(response.data);
                                            });
                                        } else {
                                            $state.go('not-found', {}, {location: false});
                                        }
                                    } else {
                                        $state.go('problem-unauthenticated', {}, {location: false});
                                    }
                                });

                                return deferred.promise;
                            }
                        }
                    })

                    .state('problem-show', {
                        url: '/problem/:id?locale&quizId',
                        templateUrl: 'problem/templates/problem-show.tpl.html',
                        controller: 'ProblemShowController',
                        abstract : true,
                        resolve : {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },
                            problem : function ($q, $stateParams, $state, $timeout) {
                                var deferred = $q.defer();
                                if (!$stateParams.id) {
                                    $timeout(function() {
                                        $state.go('not-found', {}, {location: false});
                                    });
                                } else {
                                   deferred.resolve({id: $stateParams.id});
                                }
                                return deferred.promise;
                            },
                            locale: function($stateParams) {
                                return $stateParams.locale;
                            },
                            quizId: function($stateParams) {
                                return +$stateParams.quizId;
                            }

                        }
                    })

                    .state('problem-show.description', {
                        url: '', //URL vazia será a default do problem-show
                        templateUrl: 'problem/templates/problem-description.tpl.html',
                        controller: 'ProblemDescriptionController'
                    })

                    .state('problem-show.problem-edit', {
                        url: '/edit',
                        templateUrl: 'problem/templates/problem-edit.tpl.html',
                        controller: 'ProblemCreateController',
                        resolve: {
                            problem: function (ProblemService, $stateParams, $q, SecurityService, $state) {
                                var deferred = $q.defer();
                                SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.isAuthenticated()) {
                                        if (currentUser.atLeastTeacherAssistant() || currentUser.atLeastAdmin()) {
                                            ProblemService.get($stateParams.id).then(function (response) {
                                                var problem = response.data;
                                                if(currentUser.atLeastAdmin() || problem.suggestedBy.id === currentUser.id) {
                                                    deferred.resolve(response.data);
                                                }
                                                else {
                                                    $state.go('not-found', {}, {location: false});
                                                }
                                            });
                                        } else {
                                            $state.go('not-found', {}, {location: false});
                                        }
                                    } else {
                                        $state.go('problem-unauthenticated', {}, {location: false});
                                    }
                                });

                                return deferred.promise;
                            },
                            editable: function (currentUser, $state, problem) {
                                if (!(currentUser.atLeastAdmin() || problem.suggestedBy.id === currentUser.id)) {
                                    $state.go('not-found', null, {location: false});
                                } else {
                                    return 'BASIC_INFO';
                                }
                            }
                        }
                    })

                    .state('problem-show.problem-edit-description', {
                        url: '/edit/description',
                        templateUrl: 'problem/templates/problem-edit2.tpl.html',
                        controller: 'ProblemCreateController',
                        resolve: {
                            problem: function (ProblemService, $stateParams, $q, SecurityService, $state) {
                                var deferred = $q.defer();
                                SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.isAuthenticated()) {
                                        if (currentUser.atLeastTeacherAssistant() || currentUser.atLeastAdmin()) {
                                            ProblemService.get($stateParams.id).then(function (response) {
                                                var problem = response.data;
                                                if(currentUser.atLeastAdmin() || problem.suggestedBy.id === currentUser.id) {
                                                    deferred.resolve(response.data);
                                                }
                                                else {
                                                    $state.go('not-found', {}, {location: false});
                                                }
                                            });
                                        } else {
                                            $state.go('not-found', {}, {location: false});
                                        }
                                    } else {
                                        $state.go('problem-unauthenticated', {}, {location: false});
                                    }
                                });

                                return deferred.promise;
                            },
                            editable: function (currentUser, $state, problem) {
                                if (!(currentUser.atLeastAdmin() || problem.suggestedBy.id === currentUser.id)) {
                                    $state.go('not-found', null, {location: false});
                                } else {
                                    return 'DESCRIPTION';
                                }
                            }
                        }
                    })

                    .state('problem-show.problem-edit-input', {
                        url: '/edit/input',
                        templateUrl: 'problem/templates/problem-edit2.tpl.html',
                        controller: 'ProblemCreateController',
                        resolve: {
                            problem: function (ProblemService, $stateParams, $q, SecurityService, $state) {
                                var deferred = $q.defer();
                                SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.isAuthenticated()) {
                                        if (currentUser.atLeastTeacherAssistant() || currentUser.atLeastAdmin()) {
                                            ProblemService.get($stateParams.id).then(function (response) {
                                                var problem = response.data;
                                                if(currentUser.atLeastAdmin() || problem.suggestedBy.id === currentUser.id) {
                                                    deferred.resolve(response.data);
                                                }
                                                else {
                                                    $state.go('not-found', {}, {location: false});
                                                }
                                            });
                                        } else {
                                            $state.go('not-found', {}, {location: false});
                                        }
                                    } else {
                                        $state.go('problem-unauthenticated', {}, {location: false});
                                    }
                                });

                                return deferred.promise;
                            },
                            editable: function (currentUser, $state, problem) {
                                if (!(currentUser.atLeastAdmin() || problem.suggestedBy.id === currentUser.id)) {
                                    $state.go('not-found', null, {location: false});
                                } else {
                                    return 'INPUT';
                                }
                            }
                        }
                    })

                    .state('problem-show.problem-edit-choices', {
                        url: '/edit/choices',
                        templateUrl: 'problem/templates/problem-edit-choices.tpl.html',
                        controller: 'ProblemCreateController',
                        resolve: {
                            problem: function (ProblemService, $stateParams, $q, SecurityService, $state) {
                                var deferred = $q.defer();
                                SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.isAuthenticated()) {
                                        if (currentUser.atLeastTeacherAssistant() || currentUser.atLeastAdmin()) {
                                            ProblemService.get($stateParams.id).then(function (response) {
                                                var problem = response.data;
                                                if(currentUser.atLeastAdmin() || problem.suggestedBy.id === currentUser.id) {
                                                    deferred.resolve(response.data);
                                                }
                                                else {
                                                    $state.go('not-found', {}, {location: false});
                                                }
                                            });
                                        } else {
                                            $state.go('not-found', {}, {location: false});
                                        }
                                    } else {
                                        $state.go('problem-unauthenticated', {}, {location: false});
                                    }
                                });

                                return deferred.promise;
                            },
                            editable: function (currentUser, $state, problem) {
                                if (!(currentUser.atLeastAdmin() || problem.suggestedBy.id === currentUser.id)) {
                                    $state.go('not-found', null, {location: false});
                                } else {
                                    return 'CHOICES';
                                }
                            }
                        }
                    })

                    .state('problem-show.problem-edit-insert-code', {
                        url: '/edit/insert-code',
                        templateUrl: 'problem/templates/problem-edit-insert-code.tpl.html',
                        controller: 'ProblemCreateController',
                        resolve: {
                            problem: function (ProblemService, $stateParams, $q, SecurityService, $state) {
                                var deferred = $q.defer();
                                SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.isAuthenticated()) {
                                        if (currentUser.atLeastTeacherAssistant() || currentUser.atLeastAdmin()) {
                                            ProblemService.get($stateParams.id).then(function (response) {
                                                var problem = response.data;
                                                if(currentUser.atLeastAdmin() || problem.suggestedBy.id === currentUser.id) {
                                                    deferred.resolve(response.data);
                                                }
                                                else {
                                                    $state.go('not-found', {}, {location: false});
                                                }
                                            });
                                        } else {
                                            $state.go('not-found', {}, {location: false});
                                        }
                                    } else {
                                        $state.go('problem-unauthenticated', {}, {location: false});
                                    }
                                });

                                return deferred.promise;
                            },
                            editable: function (currentUser, $state, problem) {
                                if (!(currentUser.atLeastAdmin() || problem.suggestedBy.id === currentUser.id)) {
                                    $state.go('not-found', null, {location: false});
                                } else {
                                    return 'CODE';
                                }
                            }
                        }
                    })

                    .state('problem-show.problem-edit-output', {
                        url: '/edit/output',
                        templateUrl: 'problem/templates/problem-edit2.tpl.html',
                        controller: 'ProblemCreateController',
                        resolve: {
                            problem: function (ProblemService, $stateParams, $q, SecurityService, $state) {
                                var deferred = $q.defer();
                                SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.isAuthenticated()) {
                                        if (currentUser.atLeastTeacherAssistant() || currentUser.atLeastAdmin()) {
                                            ProblemService.get($stateParams.id).then(function (response) {
                                                var problem = response.data;
                                                if(currentUser.atLeastAdmin() || problem.suggestedBy.id === currentUser.id) {
                                                    deferred.resolve(response.data);
                                                }
                                                else {
                                                    $state.go('not-found', {}, {location: false});
                                                }
                                            });
                                        } else {
                                            $state.go('not-found', {}, {location: false});
                                        }
                                    } else {
                                        $state.go('problem-unauthenticated', {}, {location: false});
                                    }
                                });

                                return deferred.promise;
                            },
                            editable: function (currentUser, $state, problem) {
                                if (!(currentUser.atLeastAdmin() || problem.suggestedBy.id === currentUser.id)) {
                                    $state.go('not-found', null, {location: false});
                                } else {
                                    return 'OUTPUT';
                                }
                            }
                        }
                    })
                    .state('problem-show.problem-batch-test-case', {
                        url: '/batch-test-cases',
                        templateUrl: 'problem/templates/problem-batch-test-case.tpl.html',
                        controller: 'ProblemTestCaseController',
                        resolve: {
                            testCases: function ($q) {
                                var deferred = $q.defer();
                                deferred.resolve([]);
                            }
                        }
                    })
                    .state('problem-show.problem-edit-test-case', {
                        url: '/test-cases',
                        templateUrl: 'problem/templates/problem-edit-test-case.tpl.html',
                        controller: 'ProblemTestCaseController',
                        resolve: {
                            problem: function (ProblemService, $stateParams, $q, SecurityService, $state) {
                                var deferred = $q.defer();
                                SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.isAuthenticated()) {
                                        if (currentUser.atLeastTeacherAssistant() || currentUser.atLeastAdmin()) {
                                            ProblemService.get($stateParams.id).then(function (response) {
                                                var problem = response.data;
                                                if(currentUser.atLeastAdmin() || problem.suggestedBy.id === currentUser.id) {
                                                    deferred.resolve(response.data);
                                                }
                                                else {
                                                    $state.go('not-found', {}, {location: false});
                                                }
                                            });
                                        } else {
                                            $state.go('not-found', {}, {location: false});
                                        }
                                    } else {
                                        $state.go('problem-unauthenticated', {}, {location: false});
                                    }
                                });

                                return deferred.promise;
                            },
                            testCases: function (ProblemService, problem, $q) {
                                var deferred = $q.defer();
                                ProblemService.getTestCases(problem.id, {max: 100}).then(function (response) {
                                    deferred.resolve(response.data);
                                }, function () {
                                    deferred.resolve([]);
                                });
                                return deferred.promise;
                            }
                        }
                    })

                    .state('problem-show.translate', {
                        url: '/translate',
                        templateUrl: 'problem/templates/problem-translate.tpl.html',
                        controller: 'ProblemTranslateController',
                        resolve: {
                            problem: function (ProblemService, $stateParams, $q, SecurityService, $state) {
                                var deferred = $q.defer();
                                SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (currentUser.isAuthenticated()) {
                                        if (currentUser.atLeastTeacher() || currentUser.isTranslator()) {
                                            ProblemService.get($stateParams.id).then(function (response) {
                                                var problem = response.data;
                                                if(currentUser.atLeastTeacher() || currentUser.isTranslator() || problem.suggestedBy.id === currentUser.id) {
                                                    deferred.resolve(response.data);
                                                }
                                                else {
                                                    $state.go('not-found', {}, {location: false});
                                                }
                                            });
                                        } else {
                                            $state.go('not-found', {}, {location: false});
                                        }
                                    } else {
                                        $state.go('problem-unauthenticated', {}, {location: false});
                                    }
                                });

                                return deferred.promise;
                            }
                        }
                    })

                    .state('problem-show.code-editor', {
                        url: '/code-editor/:submissionId',
                        templateUrl: 'problem/templates/problem-show-solution.tpl.html',
                        controller: 'ProblemUploadSolutionController',
                        params:  {
                            submissionId: {
                                value: null,
                                squash: true
                            }
                        },
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },
                            submission: function (ProblemService, $state, $q, problem, $stateParams, SubmissionService, currentUser) {
                                var submission, deferred = $q.defer();
                                if ($stateParams.submissionId !== undefined && $stateParams.submissionId !== null) {
                                    SubmissionService.get($stateParams.submissionId).then(
                                        function (response) {
                                            submission = response.data;
                                            if (submission.user.id === currentUser.id || currentUser.atLeastTeacherAssistant()) {
                                                deferred.resolve(submission);
                                            } else {
                                                $state.go('not-found');
                                            }

                                        },
                                        function () {
                                            $state.go('not-found');
                                        }
                                    );
                                } else {
                                    ProblemService.getUserSubmissions(problem.id, {sort: 'submissionDate', order: 'desc', max: 1}).then(
                                        function (response) {
                                            submission = response.data[0];
                                            deferred.resolve(submission);
                                        },
                                        function () {
                                            $state.go('not-found');
                                        }
                                    );
                                }

                                return deferred.promise;
                            },
                            canUpload: function (currentUser, $state) {
                                if (!currentUser.isAuthenticated()) {
                                    $state.go('layout-unauthenticated', null, { location: false });
                                } else {
                                    return true;
                                }
                            },
                            editor: function () {
                                return true;
                            }
                        }
                    })

                    .state('problem-show.show-solution', {
                        url: '/show-solution',
                        templateUrl: 'problem/templates/problem-show-solution.tpl.html',
                        controller: 'ProblemUploadSolutionController',
                        resolve: {
                            currentUser: function (SecurityService, $state) {
                                return SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (!currentUser.isAuthenticated()) {
                                        $state.go('submission-unauthenticated', {}, { location: false });
                                    } else {
                                        return SecurityService.requestCurrentUser();
                                    }
                                });
                            },
                            submission: function (ProblemService, $state, $q, problem, currentUser) {
                                var submission, deferred = $q.defer();
                                ProblemService.getUserSubmissions(problem.id, {sort: 'submissionDate', order: 'desc', max: 1}).then(
                                    function (response) {
                                        submission = response.data[0];
                                        deferred.resolve(submission);
                                    },
                                    function () {
                                        if (currentUser) {
                                            $state.go('not-found');
                                        }
                                    }
                                );
                                return deferred.promise;
                            },
                            editor: function () {
                                return false;
                            }
                        }
                    })

                    .state('problem-show.insert-code', {
                        url: '/insert-code/:submissionId',
                        templateUrl: 'problem/templates/problem-insert-code.tpl.html',
                        controller: 'ProblemInsertCodeController',
                        resolve: {
                            currentUser: function (SecurityService, $state) {
                                return SecurityService.requestCurrentUser().then(function (currentUser) {
                                    if (!currentUser.isAuthenticated()) {
                                        $state.go('submission-unauthenticated', {}, { location: false });
                                    } else {
                                        return SecurityService.requestCurrentUser();
                                    }
                                });
                            },
                            submission: function (ProblemService, $state, $q, problem, $stateParams, SubmissionService) {
                                var submission, deferred = $q.defer();
                                if ($stateParams.submissionId !== undefined && $stateParams.submissionId !== null && $stateParams.submissionId !== '') {
                                    SubmissionService.get($stateParams.submissionId).then(
                                        function (response) {
                                            submission = response.data;
                                            deferred.resolve(submission);
                                            // if (submission.user.id === currentUser.id || currentUser.atLeastTeacherAssistant()) {
                                            //     deferred.resolve(submission);
                                            // } else {
                                            //     $state.go('not-found');
                                            // }
                                        },
                                        function () {
                                            $state.go('not-found');
                                        }
                                    );
                                } else {
                                    deferred.resolve();
                                }

                                return deferred.promise;
                            }
                        }
                    })

                    .state('problem-show.submissions', {
                        url: '/submissions',
                        templateUrl: 'problem/templates/problem-submissions.tpl.html',
                        controller: 'ProblemSubmissionsController',
                        resolve: {
                            canList: function (currentUser, $state) {
                                if (!currentUser.isAuthenticated()) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return true;
                                }
                            }
                        }
                    })

                    .state('problem-show.oracle', {
                        url: '/oracle',
                        templateUrl: 'problem/templates/problem-oracle.tpl.html',
                        controller: 'ProblemOracleController',
                        resolve: {
                            canList: function (currentUser, $state) {
                                if (!currentUser.isAuthenticated()) {
                                    $state.go('not-found', null, { location: false });
                                } else {
                                    return true;
                                }
                            }
                        }
                    })

                    .state('problem-not-found', {
                        url: '/not-found',
                        templateUrl: 'problem/templates/problem-not-found.tpl.html'
                    })

                    .state('problem-other-languages', {
                        url: '/see-other-languages/:id',
                        templateUrl: 'problem/templates/problem-other-languages.tpl.html',
                        controller: 'ProblemLanguagesController',
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },
                            problemId: function($stateParams) {
                                return $stateParams.id;
                            }
                        }
                    })

                    .state('problem-admin-list', {
                        url: '/problems/admin',
                        templateUrl: 'problem/templates/problem-admin-list.tpl.html',
                        controller: 'ProblemAdminListController'
                    })

                    .state('problem-show.stats', {
                        url: '/stats',
                        templateUrl: 'problem/templates/problem-stats.tpl.html',
                        controller: 'ProblemStatsController'
                    })

                    .state('problem-unauthenticated', {
                        templateUrl: 'layout/templates/unauthenticated.tpl.html'
                    })

                    .state('problem-show.submission-show', {
                        url: '/submission/:subId',
                        templateUrl: 'problem/templates/problem-submission-show.tpl.html',
                        controller: 'ProblemSubmissionShowController',
                        resolve: {
                            currentUser: function (SecurityService) {
                                return SecurityService.requestCurrentUser();
                            },
                            submission: function ($stateParams, SubmissionService, ProblemService, currentUser, $state, $q, problem) {
                                var submission, deferred = $q.defer();
                                if ($stateParams.subId) {
                                    SubmissionService.get($stateParams.subId).then(
                                        function (response) {
                                            submission = response.data;
                                            if (currentUser.atLeastTeacherAssistant() || submission.user.id === currentUser.id) {
                                                deferred.resolve(submission);
                                            } else {
                                                $state.go('not-found');
                                            }
                                        },
                                        function () {
                                            $state.go('not-found');
                                        }
                                    );
                                } else {
                                    ProblemService.getUserSubmissions(problem.id, {sort: 'submissionDate', order: 'desc', max: 1}).then(
                                        function (response) {
                                            submission = response.data[0];
                                            $stateParams.subId = submission.id;
                                            deferred.resolve(submission);
                                        },
                                        function () {
                                            $state.go('not-found');
                                        }
                                    );
                                }
                                return deferred.promise;
                            }
                        }
                    });

            }]);

}(module, angular));

require('./problem-service');
require('./problem-controllers');
require('./problem-directives');
