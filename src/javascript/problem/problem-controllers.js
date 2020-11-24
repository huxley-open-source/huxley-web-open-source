/*global angular, require, _, FB, $*/

(function (angular, require) {
    'use strict';

    var problemApp = require('./problem-app');

    var fixLinks = {
        badDescription: 'problem-show.problem-edit-description',
        noInput: 'problem-show.problem-edit-input',
        noOutput: 'problem-show.problem-edit-output',
        noSource: 'problem-show.problem-edit',
        noTopic: 'problem-show.problem-edit',
        badTestCases: 'problem-show.problem-edit-test-case',
        oneExampleTestCase: 'problem-show.problem-edit-test-case',
        noSubmission: 'problem-show.show-solution'
    };

    function problemQualityChecklist(problem) {
        var checklist = {
            badDescription: true,
            noInput: true,
            noOutput: true,
            noSource: true,
            noTopic: true,
            badTestCases: true,
            oneExampleTestCase: true,
            noSubmission: true,
            noMultipleChoices: true,
            noSingleChoices: true,
            noBaseCode: true
        };

        if(problem.problemType === 'FILL_THE_CODE') {
            fixLinks.noSubmission = 'problem-show.insert-code';
        }

        if(problem.problemType === 'ALGORITHM') {
            if (problem.description && problem.description.length > 49) {
                checklist.badDescription = false;
            }
        } else {
            delete checklist.badDescription;
        }

        if(problem.problemType === 'ALGORITHM' || problem.problemType === 'FILL_THE_CODE') {
            checklist.noInput = true;
            checklist.noOutput = true;
            if (problem.inputFormat && problem.inputFormat.trim() !== '') {
                checklist.noInput = false;
            }

            if (problem.outputFormat && problem.outputFormat.trim() !== '') {
                checklist.noOutput = false;
            }
        } else {
            delete checklist.noInput;
            delete checklist.noOutput;
        }

        if(problem.problemType === 'MULTIPLE_CHOICE' || problem.problemType === 'TRUE_OR_FALSE') {
            if(problem.choices.length >= 2) {
                checklist.noMultipleChoices = false;
            }
        } else {
            delete checklist.noMultipleChoices;
        }

        if(problem.problemType === 'SINGLE_CHOICE') {
            if(problem.choices.length >= 1) {
                checklist.noSingleChoices = false;
            }
        } else {
            delete checklist.noSingleChoices;
        }

        if(problem.problemType === 'FILL_THE_CODE') {
            if(problem.baseCode.length >= 10) {
                checklist.noBaseCode = false;
            }
        } else {
            delete checklist.noBaseCode;
        }

        if (problem.source && problem.source.trim() !== '') {
            checklist.noSource = false;
        }

        if (problem.topics && problem.topics.length > 0) {
            checklist.noTopic = false;
        }


        if(problem.problemType === 'ALGORITHM' || problem.problemType === 'FILL_THE_CODE') {
            if (!problem.id && !problem.testCases) {
                delete checklist.badTestCases;
                delete checklist.oneExampleTestCase;
            } else if (problem.testCases) {
                checklist.badTestCases = problem.testCases.total < 1;
                checklist.oneExampleTestCase = problem.testCases.examples < 1;
            }
        } else {
            delete checklist.badTestCases;
            delete checklist.oneExampleTestCase;
        }


        if(problem.problemType === 'ALGORITHM' || problem.problemType === 'FILL_THE_CODE') {
            if (!problem.id || (problem.currentUser && problem.currentUser.status === 'CORRECT')) {
                delete checklist.noSubmission;
            } else if (problem.currentUser && problem.currentUser.status) {
                checklist.noSubmission = problem.currentUser.status !== 'CORRECT';
            }
        } else {
            delete checklist.noSubmission;
        }

        return checklist;
    }

    angular.module(problemApp.name)

        .controller('ProblemListController', [
            '$scope',
            'ProblemService',
            '$timeout',
            'amMoment',
            'TopicService',
            '$location',
            'searchParams',
            'paginationData',
            'currentUser',
            function (
                $scope,
                problemService,
                $timeout,
                amMoment,
                topicService,
                $location,
                searchParams,
                paginationData,
                currentUser
            ) {

                var filterTextTimeoutPromise;

                $scope.searched = false;
                $scope.listLoading = true;

                amMoment.changeLocale('pt-br');
                $scope.disableDropdown = function ($event) {
                    $event.stopPropagation();
                };

                $scope.problemList = [];
                $scope.problemsCount = {
                    total: 0,
                    languages: {}
                };

                $scope.getProblemsCount = function () {
                    problemService.getProblemsCount().then(function (resp) {
                        var aux = resp.data;
                        aux.forEach(function (n) {
                            //jshint camelcase: false
                            n.locale = n.locale.replace('_', '');
                            if($scope.problemsCount.languages[n.locale] === undefined) {
                                $scope.problemsCount.languages[n.locale] = {
                                    total: 0
                                };
                            }
                            if(n.problem_type === 'SINGLE_CHOICE' || n.problem_type === 'MULTIPLE_CHOICE' || n.problem_type === 'TRUE_OR_FALSE') {
                                $scope.problemsCount.languages[n.locale].CHOICES = n.count;
                            } else {
                                $scope.problemsCount.languages[n.locale][n.problem_type] = n.count;
                            }
                            $scope.problemsCount.languages[n.locale].total = $scope.problemsCount.languages[n.locale].total + n.count;
                            $scope.problemsCount.total = $scope.problemsCount.total + n.count;
                        });
                    });
                };

                $scope.getProblemsCount();

                $scope.allTopics = [];

                $scope.simpleSearch = function () {
                    if ($scope.problemScreen.showFilter) {
                        $scope.advancedSearch();
                    } else {
                        $scope.doSearch();
                    }
                };

                $scope.currentUser = currentUser;

                if (searchParams.topics) {
                    $scope.selectedTopics = searchParams.topics.map(function(t) {
                       return '' + t;
                    });
                }

                function trueOrRemove(param) {
                    if (searchParams[param] !== 'true') {
                        delete searchParams[param];
                    } else {
                        searchParams[param] = true;
                    }
                }

                trueOrRemove('excludeCorrect');
                trueOrRemove('quizOnly');

                if (searchParams.filter === 'suggested') {
                    $scope.suggestedOnly = true;
                }

                $scope.searchParams = searchParams;


                $scope.paginationData = paginationData;

                $scope.topicSelectConfig = {
                    create: false
                };

                $scope.localeSelectConfig = {
                    create: false,
                    maxItems: 1
                };

                $scope.localeOptions = [
                    {value: 'pt_BR', text: 'user.languages.ptBR'},
                    {value: 'en_US', text: 'user.languages.enUS'}
                ];

                $scope.selectedLocale = currentUser.getLocale();

                topicService.list({max: 1000}).then(function (response) {
                    $scope.allTopics = response.data;
                    $scope.topicOptions = $scope.allTopics.map(function(topic) {
                       return { value: topic.id, text: topic.name };
                    }).sort(function(a, b) {
                        return a.text.localeCompare(b.text);
                    });
                });

                $scope.problemScreen = {
                    showFilter : false,
                    selectAllTopics : false,
                    selectedTopics : {},
                    selectedTopicsSize : $scope.searchParams.selectedTopics ? $scope.searchParams.selectedTopics.length : 0,
                    difficultyLevel: $scope.searchParams.ndGe && $scope.searchParams.ndLe ? [$scope.searchParams.ndGe, $scope.searchParams.ndLe] : [1, 10]
                };
                if ($scope.searchParams.topics) {
                    _.each($scope.searchParams.topics, function (topic) {
                        $scope.problemScreen.selectedTopics[topic] = true;
                    });
                }

                $scope.statusCount = {
                    pending: 0,
                    approved: 0,
                    rejected: 0
                };

                if (currentUser.atLeastTeacherAssistant()) {
                    problemService.countByStatus().then(function(resp) {
                        resp.data.forEach(function(st) {
                           if (st.status === 0) {
                               $scope.statusCount.pending = st.count;
                           } else if (st.status === 1) {
                               $scope.statusCount.approved = st.count;
                           } else {
                               $scope.statusCount.rejected = st.count;
                           }
                        });
                    });
                }

                $scope.filterChange = function() {
                    $scope.doSearch();
                };

                $scope.searchByName = function () {
                    if (filterTextTimeoutPromise) {
                        $timeout.cancel(filterTextTimeoutPromise);
                    }
                    // só faz a busca depois de algum tempo
                    filterTextTimeoutPromise = $timeout(function () {
                        $scope.doSearch();
                    }, 500);
                };

                $scope.toggleSuggestedFilter = function() {
                  if ($scope.searchParams.filter === 'suggested') {
                      delete $scope.searchParams.filter;
                      $scope.changedParams = false;
                  } else {
                      $scope.searchParams.filter = 'suggested';
                      $scope.changedParams = true;
                  }

                  $scope.doSearch();
                };

                $scope.isAuthenticated = function () {
                    return currentUser.isAuthenticated();
                };

                $scope.advancedSearch = function () {
                    $scope.searchParams.nd = undefined; //desmarca o filtro de ND
                    // preencher o array de tópicos somente com os selecionados
                    $scope.searchParams.topics = [];
                    $scope.searchParams.topics = $scope.selectedTopics;
                    $scope.searchParams.locale = $scope.selectedLocale;

                    // define o menor e o maior do nd
                    $scope.searchParams.ndGe = $scope.problemScreen.difficultyLevel[0];
                    $scope.searchParams.ndLe = $scope.problemScreen.difficultyLevel[1];
                    $scope.paginationData.currentPage = 1;
                    $scope.doSearch();

                };

                $scope.filterMinePending = function () {
                    $scope.searchParams.filter = 'suggested';
                    $scope.searchParams.status = 'PENDING';
                    $scope.doSearch();
                };

                $scope.doSearch = function () {
                    console.log($scope.searchParams);
                    if(($scope.searchParams.q === '' || $scope.searchParams.q === undefined) &&
                        ($scope.searchParams.topics === [] || $scope.searchParams.topics === undefined) &&
                        ($scope.searchParams.excludeCorrect === undefined || $scope.searchParams.excludeCorrect === false) &&
                        ($scope.searchParams.quizOnly === undefined || $scope.searchParams.quizOnly === false) &&
                        $scope.searchParams.filter === undefined) {
                            $scope.changedParams = false;
                    } else {
                        $scope.changedParams = true;
                    }
                    $scope.listLoading = true;
                    searchParams = _.clone($scope.searchParams, true);
                    searchParams.offset = ($scope.paginationData.currentPage - 1) * $scope.paginationData.max;
                    searchParams.max = $scope.paginationData.max;
                    searchParams.page = undefined;

                    if (!searchParams.quizOnly) {
                        delete searchParams.quizOnly;
                    }

                    problemService.list(searchParams).then(function (response) {
                        // CASO dê tudo certo, esse código será executado
                        $scope.paginationData.totalItems  = response.headers('total') || 0;
                        $scope.problemList = response.data;
                        $scope.searched = true;
                        $scope.searchParams.page = $scope.paginationData.currentPage;
                        $location.search($scope.searchParams);
                        $scope.listLoading = false;
                    }, function () {
                        $scope.listLoading = false;
                    });

                };

                $scope.changeProblemType = function(type) {
                    $scope.searchParams.problemType = type;
                    $scope.doSearch();
                };

                $scope.changeNd = function () {
                    $scope.searchParams.ndGe = undefined;
                    $scope.searchParams.ndLe = undefined;
                    $scope.paginationData.currentPage = 1;
                    $scope.doSearch();
                };
                $scope.doSearch();


            }]) // END ProblemListController

        .controller('ProblemManageController', [
            '$scope',
            'ProblemService',
            '$timeout',
            'usSpinnerService',
            'amMoment',
            'TopicService',
            '$location',
            'searchParams',
            'paginationData',
            'currentUser',
            function (
                $scope,
                problemService,
                $timeout,
                usSpinnerService,
                amMoment,
                topicService,
                $location,
                searchParams,
                paginationData,
                currentUser
            ) {

                $scope.changedParams = false;

                var filterTextTimeoutPromise;

                $scope.updateStatus = function (problem) {
                    problemService.update(problem);
                };
                $scope.searched = false;

                amMoment.changeLocale('pt-br');
                $scope.disableDropdown = function ($event) {
                    $event.stopPropagation();
                };

                $scope.problemList = [];

                $scope.allTopics = [];

                $scope.searchParams = searchParams;


                $scope.paginationData = paginationData;

                topicService.list({max: 1000}).then(function (response) {
                    $scope.allTopics = response.data;
                });

                $scope.problemScreen = {
                    showFilter : false,
                    selectAllTopics : false,
                    selectedTopics : $scope.searchParams.topics || {},
                    selectedTopicsSize : $scope.searchParams.selectedTopics ? $scope.searchParams.selectedTopics.length : 0,
                    difficultyLevel: $scope.searchParams.ndGe && $scope.searchParams.ndLe ? [$scope.searchParams.ndGe, $scope.searchParams.ndLe] : [1, 10]
                };

                $scope.searchByName = function () {
                    if (filterTextTimeoutPromise) {
                        $timeout.cancel(filterTextTimeoutPromise);
                    }
                    // só faz a busca depois de algum tempo
                    filterTextTimeoutPromise = $timeout(function () {
                        $scope.doSearch();
                    }, 500);
                };

                $scope.isAuthenticated = function () {
                    return currentUser.isAuthenticated();
                };

                $scope.showHideFilter = function () {
                    $scope.problemScreen.showFilter = !$scope.problemScreen.showFilter;
                };

                $scope.statusList = {
                    'ACCEPTED': 'problem.status.accepted',
                    'REJECTED': 'problem.status.rejected',
                    'PENDING': 'problem.status.pending'
                };

                $scope.doSearch = function () {
                    $scope.paginationData.currentPage = 1;
                    $scope.search();

                };

                $scope.search = function () {
                    $scope.listLoading = true;
                    $scope.searchParams.topics = [];
                    var i, topicId;
                    for (i = 0; i < $scope.allTopics.length; i += 1) {
                        topicId = $scope.allTopics[i].id;
                        if ($scope.problemScreen.selectedTopics[topicId] === true) {
                            $scope.searchParams.topics.push(topicId);
                        }
                    }

                    // define o menor e o maior do nd
                    $scope.searchParams.ndGe = $scope.problemScreen.difficultyLevel[0];
                    $scope.searchParams.ndLe = $scope.problemScreen.difficultyLevel[1];
                    searchParams = _.clone($scope.searchParams, true);
                    usSpinnerService.spin('spinner');
                    searchParams.offset = ($scope.paginationData.currentPage - 1) * $scope.paginationData.max;
                    searchParams.max = $scope.paginationData.max;
                    searchParams.page = undefined;
                    problemService.list(searchParams).then(function (response) {
                        // CASO dê tudo certo, esse código será executado
                        $scope.paginationData.totalItems  = response.headers('total') || 0;
                        $scope.problemList = response.data;
                        $scope.searched = true;
                        $scope.searchParams.page = $scope.paginationData.currentPage;
                        $location.search($scope.searchParams);
                        $scope.listLoading = false;
                    }, function () {
                        $scope.listLoading = false;
                    });
                };

                $scope.selectSolvedProblems = function (booleanValue) {
                    $scope.searchParams.excludeCorrect = booleanValue;
                };


                /* Chamada quando um topico é clicado na busca avancada.
                 Se o topico já estiver selecionado antes, ele desseleciona. Caso contrário, seleciona-o
                 */
                $scope.filterTopic = function (topicId) {
                    if ($scope.problemScreen.selectedTopics.hasOwnProperty(topicId)) {
                        $scope.problemScreen.selectedTopics[topicId] = !$scope.problemScreen.selectedTopics[topicId];
                    } else {
                        $scope.problemScreen.selectedTopics[topicId] = true;
                    }
                    if ($scope.problemScreen.selectedTopics[topicId]) {
                        $scope.problemScreen.selectedTopicsSize += 1;

                    } else {
                        $scope.problemScreen.selectedTopicsSize -= 1;

                    }
                };

                $scope.selectAllTopics = function () {
                    var i, topicId;
                    for (i = 0; i < $scope.allTopics.length; i += 1) {
                        topicId = $scope.allTopics[i].id;
                        $scope.problemScreen.selectedTopics[topicId] = $scope.problemScreen.selectAllTopics;
                    }
                    if ($scope.problemScreen.selectAllTopics) {
                        $scope.problemScreen.selectedTopicsSize = $scope.allTopics.length;
                    } else {
                        $scope.problemScreen.selectedTopicsSize = 0;
                    }
                };

                /*
                 Funcao chamada quando ocorre uma mudança na paginaćão. Nesse caso,
                 é necessário atualizar o link.
                 */
                $scope.paginationChanged = function () {
                    $scope.search();
                };

                $scope.search();


            }]) // END ProblemListController

        .controller('ProblemShowController', [
            '$scope',
            'problem',
            '$state',
            'ProblemService',
            'SubmissionService',
            'LanguageService',
            'currentUser',
            '$translate',
            'Page',
            'FileSaver',
            '$timeout',
            'locale',
            function ($scope, problem, $state, ProblemService, SubmissionService, LanguageService, currentUser, $translate, Page, FileSaver, $timeout, locale) {
                $scope.problem = {id: problem};
                $scope.problemLoading = true;
                $scope.problemInfoLoading = true;
                $scope.loadingStats = true;
                $scope.accepted = true;
                $scope.problemOwner = false;
                $scope.problemUrl = $state.href('problem-show', $state.params, {absolute: true});
                $scope.thUrl = 'https://www.thehuxley.com/problem/';

                $scope.checklist = {};

                $scope.start = [0, 1, 2, 3, 4];

                $scope.starHover = { index: -1 };

                ProblemService.getUserScore(+problem.id).then(function(resp) {
                    $scope.userScore = resp.data.score;
                });

                $scope.checkStar = function(index, hoverIndex) {
                    return (hoverIndex > -1 && hoverIndex < index) ||
                        (hoverIndex < 0 && $scope.userScore > 0 && $scope.userScore - 1 < index) ||
                        ($scope.userScore < 0 && hoverIndex < 0 && ($scope.problem.rankVotes < 10 || $scope.problem.userRank - 1 < index));
                };

                $scope.setScore = function(index) {

                    ProblemService.setScore($scope.problem.id, index + 1).then(function() {
                        $scope.userScore = index + 1;
                    });
                };

                ProblemService.get(problem.id, { locale: locale }).then(function (response) {
                        if(isNaN(problem.id)) {
                            $state.go('not-found', null, { location: false });
                        }

                        $scope.problem = response.data;

                        if ($scope.problem.status && $scope.problem.problemType && !$scope.problem.name) {
                            $state.go('problem-other-languages', { id: problem.id });
                        }

                        $scope.getStats();

                        if($scope.problem.approvedBy === null) {
                            processChecklist();
                        }
                        $timeout(function() {
                            Page.setTitle($scope.problem.id + ' - ' + $scope.problem.name);
                        });
                        $scope.problemLoading = false;
                        if (!($state.is('problem-show.description') || $state.is('problem-show.stats'))){
                            $scope.problemInfoLoading = false;
                        }

                        if (currentUser.isAuthenticated()) {
                            if ($scope.correctSubmissionCount) {
                                $scope.problem.correctSubmissionCount = $scope.correctSubmissionCount;
                            }

                            if ($scope.problem.status === 'PENDING') {
                                $scope.accepted = false;
                            }
                            if (currentUser.atLeastAdmin() || ($scope.problem.suggestedBy !== null && $scope.problem.suggestedBy.id === currentUser.id)) {
                                $scope.problemOwner = true;
                            }
                        }

                    }, function (response) {
                        $scope.problemLoading = response.status;
                        $state.go('problem-not-found', null, { location: false });
                    }
                );

                console.log(locale, currentUser, currentUser.getLocale());
                ProblemService.getLanguages(problem.id).then(function(res) {
                    $scope.languages = res.data.filter(function(r) {
                        if (locale) {
                            return locale !== r;
                        } else {
                            return (currentUser.getLocale() !== r);
                        }
                    });

                });


                var processChecklist = _.debounce(function() {
                    $scope.$apply(function() {
                        $scope.hasProblems = false;
                        $scope.checklist = problemQualityChecklist($scope.problem);
                        Object.keys($scope.checklist).forEach(function(check) {
                            if ($scope.checklist[check]) {
                                $scope.hasProblems = true;
                            }
                        });
                    });
                }, 700);

                $scope.getFixLink = function(key) {
                    return $state.href(fixLinks[key], {id: $scope.problem.id});
                };

                $scope.checklist = {};
                $scope.$watch('problem', processChecklist, true);

                $scope.currentUser = currentUser;
                $scope.$state = $state;
                $scope.problem = problem;
                $scope.examples = [];
                $scope.problemInfoLoading = true;
                ProblemService.getExamples(problem.id, {max: 10}).then(
                    function (response) {
                        $scope.examples = response.data;
                        if ($state.is('problem-show.description')){
                            $scope.problemInfoLoading = false;
                        }
                    }
                );
                $scope.downloadTestCaseExample = function (id) {
                    ProblemService.getTestCase($scope.problem.id, id, true).then(function(response) {
                        var blob = new Blob([response.data], {
                            type: 'application/zip;charset=utf-8'
                        });
                        FileSaver.saveAs(blob, id + '.zip');
                    });
                };

                $scope.approveProblem = function() {
                    ProblemService.approve($scope.problem.id).then(function() {
                        $scope.accepted = true;
                    }, function(err) {
                        console.log('err', err);
                    });
                };

                $scope.getStats = function () {
                    SubmissionService.getProblemStats(problem.id).then(function(response) {
                        var stats = {
                            submissionCount: 0,
                            correctSubmissionCount: 0,
                            usersWhoTriedCount: response.data.byUserSubmissionCount.length,
                            usersWhoSolvedCount: 0,
                            submissionByLanguage: [],
                            submissionByEvaluation: []
                        };

                        var submissionByLanguage = {};
                        var submissionByEvaluation = {};

                        /*jshint camelcase: false */
                        response.data.byLanguageAndEvaluation.forEach(function(data) {
                            stats.submissionCount += data.count;

                            if (data.evaluation === 0) {
                                stats.correctSubmissionCount += data.count;
                            }

                            if (data.language_id) {
                                var languageCount = submissionByLanguage[data.language_id];

                                if (!languageCount) {
                                    languageCount = 0;
                                }

                                submissionByLanguage[data.language_id] = languageCount + data.count;
                            }

                            var evalCount = submissionByEvaluation[data.evaluation];

                            if (!evalCount) {
                                evalCount = 0;
                            }

                            submissionByEvaluation[data.evaluation] = evalCount + data.count;
                        });

                        $scope.correctSubmissionCount = stats.correctSubmissionCount;

                        if ($scope.problem) {
                            $scope.problem.correctSubmissionCount = stats.correctSubmissionCount;
                            processChecklist();
                        }

                        response.data.byUserSubmissionCount.forEach(function(data) {
                            if (data.correct_submission_count > 0) {
                                stats.usersWhoSolvedCount++;
                            }
                        });

                        var evals = ['CORRECT', 'WRONG_ANSWER', 'RUNTIME_ERROR', 'COMPILATION_ERROR', 'EMPTY_ANSWER',
                            'TIME_LIMIT_EXCEEDED', 'WAITING', 'EMPTY_TEST_CASE', 'WRONG_FILE_NAME', 'PRESENTATION_ERROR',
                            'HUXLEY_ERROR'];

                        Object.keys(submissionByEvaluation).forEach(function(ev) {
                            var key = evals[ev];
                            if (key === 'CORRECT' || key === 'WRONG_ANSWER' || key === 'TIME_LIMIT_EXCEEDED' || key === 'RUNTIME_ERROR' || key === 'COMPILATION_ERROR') {
                                $translate('submission.status.' + key).then(function (translated) {
                                    if(submissionByEvaluation[ev] !== 0) {
                                        stats.submissionByEvaluation.push({ label: translated, value: submissionByEvaluation[ev] });
                                    }
                                });
                            }
                        });

                        SubmissionService.getStats({'problem': problem.id, 'stats': 'fastest' }).then(function(resp) {
                            stats.fastestSubmissions = resp.data;
                        });

                        SubmissionService.getStats({'problem': problem.id, 'stats': 'last' }).then(function(resp) {
                            stats.lastSubmissions = resp.data;
                        });

                        LanguageService.list().then(function(resp) {
                            var langById = _.indexBy(resp.data, 'id');
                            Object.keys(submissionByLanguage).forEach(function(key) {
                                stats.submissionByLanguage.push({ label: langById[key].label, value: submissionByLanguage[key] });
                            });

                            $scope.stats = stats;
                            $scope.loadingStats = false;
                        });


                    });
                };

                $scope.share = function(){
                    var html = $scope.problem.description;
                    var div = document.createElement('div');
                    div.innerHTML = html;
                    var text = div.textContent || div.innerText || '';
                    FB.ui(
                        {
                            method: 'feed',
                            name: $scope.problem.name,
                            link: $scope.thUrl + $scope.problem.id,
                            description: text,
                            message: ''
                        });
                };
            }
        ]) // END ProblemShowController

        .controller('ProblemLanguagesController', [
            '$scope',
            'problemId',
            'currentUser',
            'ProblemService',
            '$cookies',
            function($scope, problemId, currentUser, ProblemService, $cookies) {

                $scope.problemId = problemId;

                $scope.currentLocale = currentUser.locale || $cookies.get('locale');

                if (!$scope.currentLocale) {
                    $scope.currentLocale = 'pt_BR';
                }

                ProblemService.getLanguages(problemId).then(function(resp) {
                    $scope.availableLanguages = resp.data;
                });
            }
        ])

        .controller('ProblemAdminListController', [
            '$scope',
            'ProblemService',

            function ($scope, ProblemService) {

                $scope.paginationData = {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 0,
                    max: 10,
                    offset: 0,
                    maxSize: 5
                };

                $scope.searchParams = {
                    'order' : 'desc',
                    'q' : ''
                };

                $scope.search = function () {
                    ProblemService.list({
                        max: $scope.paginationData.max,
                        offset: $scope.paginationData.offset,
                        sort: $scope.searchParams.sort,
                        order: $scope.searchParams.order,
                        q : $scope.searchParams.q
                    }).then(
                        function (response) {
                            $scope.problems = response.data;
                            $scope.paginationData.totalItems  = response.headers('total') || 0;
                        }
                    );
                };

                $scope.paginationChanged = function () {
                    $scope.paginationData.offset = ($scope.paginationData.currentPage - 1) * $scope.paginationData.max;
                    $scope.search();
                };

                $scope.search();

            }
        ])

        .controller('ProblemCodeEditorController', [

            function () {


            }
        ])

        .controller('ProblemDescriptionController', [
            '$scope',
            'ProblemService',
            '$timeout',
            '$state',
            function ($scope, problemService, $timeout, $state) {
                $scope.selectChoice = function (choice) {
                    if ($scope.problem.problemType === 'TRUE_OR_FALSE') {
                        choice.$false = false;
                    }
                    if (choice.correct) {
                        choice.correct = false;
                    } else {
                        if ($scope.problem.problemType === 'SINGLE_CHOICE') {
                            var selected = _.findWhere($scope.problem.choices, {correct: true});
                            if (selected) {
                                selected.correct = false;
                            }
                        }
                        choice.correct = true;
                    }
                };

                $scope.options = {
                    mode: 'text/x-c++src',
                    lineNumbers: true,
                    lineWrapping: true,
                    readOnly: true,
                    cursorHeight: 0
                };

                if($scope.problem.problemType === 'FILL_THE_CODE') {
                    var languageName = $scope.problem.baseLanguage.name;
                    $scope.options.mode = 'text/x-c++src';
                    if (languageName === 'Java') {
                        $scope.options.mode = 'text/x-java';
                    } else if (languageName === 'Python') {
                        $scope.options.mode = 'text/x-python';
                    } else if (languageName === 'Python3.2') {
                        $scope.options.mode = 'text/x-python';
                    }else if (languageName === 'Pascal') {
                        $scope.options.mode = 'text/x-pascal';
                    } else if (languageName === 'Octave') {
                        $scope.options.mode = 'text/x-octave';
                    }
                }

                $scope.falseChoice = function (choice) {
                    choice.correct = false;
                    choice.$false = !choice.$false;
                };
                $scope.sendSolution = function () {
                    var submission = {
                        choices: []
                    };
                    $scope.problem.choices.forEach(function (it) {
                        if(it.correct) {
                            submission.choices.push(it.id);
                        }
                    });
                    problemService.sendSolution($scope.problem.id, submission).then(function (response) {
                        $scope.evaluation = 'WAITING';
                        $timeout(function () {
                            $scope.evaluation = response.data.evaluation;
                        }, 2000);
                    }, function () {
                        $timeout(function () {
                            $state.go('quiz-unauthenticated', {}, {location: false});
                        }, 200);
                    });
                };
        }])

        .controller('ProblemUploadSolutionController', [
            '$scope',
            'problem',
            'ProblemService',
            'LanguageService',
            '$state',
            'submission',
            'SubmissionService',
            'QuizService',
            'editor',
            'quizId',
            '$timeout',
            function ($scope, problem, problemService, languageService, $state, submission, SubmissionService, quizService, editor, quizId, $timeout) {
                $scope.editor = editor;
                var formData;
                $scope.submission = submission;
                $scope.selectedLanguage = {};
                $scope.availableLanguages = {};
                $scope.suggestLanguageMap = {};
                $scope.compileParams = {};
                $scope.binaryError = false;
                languageService.list().then(
                    function (response) {
                        var respLang = [], i;
                        respLang = response.data;
                        for (i = 0; i < respLang.length; i = i + 1) {
                            $scope.availableLanguages[respLang[i].id] = respLang[i].name + ' (' + respLang[i].compiler + ')';
                            $scope.suggestLanguageMap[respLang[i].name.toLowerCase()] = respLang[i].id;
                            $scope.compileParams[respLang[i].id] = respLang[i].compileParams;
                        }
                    }
                );

                $scope.$watch('submission.evaluation', function() {
                    if ($scope.submission.evaluation !==  'WAITING' && quizId && $scope.restrictions && Object.keys($scope.restrictions).length) {
                        updateRestrictionsResult();
                    }
                });
                if (quizId) {
                    quizService.findRestrictions(quizId, problem.id).then(function(resp) {
                        if (resp.data.length > 0) {
                            $scope.restrictionPenalty = resp.data[0].penalty;
                            $scope.restrictions = JSON.parse(resp.data[0].restrictions);
                            updateRestrictionsResult();
                        }
                    });
                }

                function updateRestrictionsResult() {
                    if (!$scope.submission.id) {
                        return;
                    }

                    SubmissionService.getRestrictionEvaluation($scope.submission.id).then(function(resp) {

                        if (resp.data.result) {
                            var result = JSON.parse(resp.data.result);
                            Object.keys($scope.restrictions).forEach(function(key) {
                                var restriction = $scope.restrictions[key];
                                restriction.success = true;

                                if (Object.prototype.toString.call(restriction) === '[object Array]') {
                                    restriction.forEach(function(f) {
                                        f.success = true;
                                    });
                                    var retornoFuncoes = result.retornoFuncoes || [];

                                    retornoFuncoes.forEach(function(funcao) {
                                        var success = funcao.existe && funcao.nome && funcao.parametros && funcao.recursao && funcao.retorno && funcao.foiChamada;

                                        restriction[funcao.n].success = success;
                                        restriction[funcao.n].result = funcao;
                                        if (!success) {
                                            restriction.success = false;
                                        }
                                    });
                                } else if (restriction.minimo) {
                                    restriction.success = result[key.replace('restricao', 'retorno')] === undefined;
                                    restriction.count = result[key.replace('restricao', 'retorno')];
                                } else if (key === 'restricaoBlocosVazios') {
                                    restriction.success = !result.retornoBlocosVazios;
                                } else if (key === 'restricaoLista' || key === 'restricaoDicionario' || key === 'restricaoTupla') {
                                    var r = result.retornoLista || result.retornoDicionario || result.retornoTupla;
                                    restriction.success = !r || (r.variaveis && r.variaveis.trim !== '' && r.varNaoUsada);
                                }

                            });
                        }
                    });

                }

                $scope.selectedLanguage.id = 0;
                $scope.hasAnswer = false;
                $scope.suggestedProblem = {};
                $scope.$loadingButton = false;
                $scope.sendSolution = function () {
                    var splitFilename = $scope.solutionFile.name.split('.');
                    $scope.$loadingButton = true;

                    if (splitFilename.length < 2) {
                        return;
                    }
                    formData = new FormData();
                    formData.append('language', $scope.selectedLanguage.id);
                    formData.append('file', $scope.solutionFile);
                    problemService.sendSolutionFile(problem.id, formData).then(function (response) {
                        if(response.data.evaluation === 'CORRECT' && $scope.$parent.problem.currentUser.status !== 'CORRECT') {
                            $scope.$parent.problem.currentUser.status = 'CORRECT';
                        }
                        $scope.submission = response.data;
                        $scope.$loadingButton = false;

                        $timeout(function () {
                            $state.go('problem-show.submission-show', {subId : $scope.submission.id});
                        }, 200);
                    }, function (response) {
                        if(response.status === 403) {
                            $scope.binaryError = true;
                        }
                    });

                };

                /*$scope.$on('USER_SUBMISSION_STATUS', function (event, message) {
                    var submission = message.body.submission;
                    if (submission.problem.id === $scope.problem.id) {
                        $scope.submission = submission;
                        $scope.evaluating = false;
                        $scope.$apply();
                    }
                });*/


                $scope.suggestLanguage = function (file) {
                    $scope.solutionFile = file[0];

                    var fileExtension = file[0].name.substring(file[0].name.indexOf('.') + 1).toLowerCase();
                    if (fileExtension === 'cpp') {
                        $scope.selectedLanguage.id = $scope.suggestLanguageMap.cpp;
                    } else if (fileExtension === 'pas') {
                        $scope.selectedLanguage.id = $scope.suggestLanguageMap.pascal;
                    } else if (fileExtension === 'm') {
                        $scope.selectedLanguage.id = $scope.suggestLanguageMap.octave;
                    } else if (fileExtension === 'py') {
                        if (parseInt($scope.selectedLanguage.id) !== 5 && parseInt($scope.selectedLanguage.id) !== 2) {
                            $scope.selectedLanguage.id = 5;
                        }

                    } else{
                        $scope.selectedLanguage.id = $scope.suggestLanguageMap[fileExtension];
                    }
                };
            }
        ])

        .controller('ProblemSubmissionShowController', [
            '$scope',
            'submission',
            function ($scope, submission) {
                $scope.submission = submission;
            }
        ])

        .controller('ProblemSubmissionsController', [
            '$scope',
            'ProblemService',
            'SubmissionService',
            function ($scope, problemService, submissionService) {
                $scope.submissions = [];

                $scope.searchParams = {
                    currentPage: 1,
                    totalItems: 0,
                    max: 10,
                    offset: 0,
                    'order' : 'desc',
                    'sort' : 'submissionDate'
                };

                $scope.reevaluateOne = function (submission) {
                    submissionService.reevaluateOne(submission.id).then(
                        function () {
                            submission.evaluation = 'WAITING';
                        }
                    );
                };

                /*
                 Funcao chamada quando ocorre uma mudanća na paginaćão. Nesse caso,
                 é necessário realizar a busca novamente.
                 A busca a ser realizada será a mesma que foi realizada por último.
                 */
                $scope.paginationChanged = function () {
                    $scope.searchParams.offset = ($scope.searchParams.currentPage - 1) * $scope.searchParams.max;
                    $scope.search();
                };
                $scope.search = function () {
                    $scope.problemInfoLoading = true;
                    problemService.getUserSubmissions($scope.problem.id, $scope.searchParams).then(function (response) {
                        $scope.submissions = response.data;
                        $scope.searchParams.totalItems  = response.headers('total') || 0;
                        $scope.problemInfoLoading = false;
                    }, function (response) {
                        $scope.problemInfoLoading = response.status;
                    });
                };

                $scope.search();
            }
        ])

        .controller('ProblemOracleController', [
            '$scope',
            'ProblemService',
            'FileSaver',
            '$timeout',
            function ($scope, ProblemService, FileSaver, $timeout) {
                $scope.oracle = {};
                $scope.executing = false;
                $scope.error = false;
                $scope.largeOutput = false;

                $scope.sendToOracle = function () {
                    $scope.oracle.output = '';
                    $scope.executing = true;
                    $scope.largeOutput = false;

                    ProblemService.sendToOracle($scope.problem.id, {input: $scope.input}).then(function (response) {
                        $scope.hash = response.data.hash;
                        $scope.oracle.status = 'PENDING';
                        $scope.updateStatus();
                    }, function () {
                        $scope.executing = false;
                        $scope.error = true;
                    });
                };

                $scope.updateStatus = function () {
                    ProblemService.getAnswerSizeFromOracle($scope.problem.id, $scope.hash).then(function(response) {
                        if (response.data.status === 'PENDING') {
                            $timeout($scope.updateStatus, 3000);
                        } else {
                            if (response.data.size < 1000) {
                                ProblemService.getFromOracle($scope.problem.id, $scope.hash).then(function(response) {
                                    $scope.oracle.output = response.data.output.replace(/\n/g, '<br>');
                                });
                            } else {
                                $scope.largeOutput = true;
                                $timeout(function () { $scope.largeOutput = false; }, 60000);
                            }

                            $scope.executing = false;
                        }
                    }, function () {
                        $timeout($scope.updateStatus, 3000);
                    });
                };

                $scope.downloadOutput = function() {
                    ProblemService.getFromOracle($scope.problem.id, $scope.hash, true).then(function(response) {
                        var blob = new Blob([response.data], { type: 'text/plain;charset=utf-8' });
                        FileSaver.saveAs(blob, $scope.hash + '.out');
                    });
                };

            }

        ])

        .controller('ProblemStatsController', [
            '$scope',
            function ($scope) {
                $scope.xFunction = function () {
                    return function (data) {
                        return data.label;
                    };
                };

                $scope.yFunction = function () {
                    return function (data) {
                        return data.value;
                    };
                };

                $scope.toolTipContentFunction = function () {
                    return function (key, x) {
                        return '<h3>' + parseInt(x.replace(',', ''), 10) + '</h3>' +
                            '<p>' + key  + '</p>';
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

            }
        ])

        .controller('ProblemCreateController', [
            '$scope',
            'TopicService',
            'problem',
            'ProblemService',
            '$state',
            'editable',
            function ($scope, topicService, problem, ProblemService, $state, editable) {
                $scope.loading = {
                    name: false,
                    form: false
                };

                $scope.quizOnlyOptions = {
                    true: 'problem.create.quizOnlyTrue',
                    false: 'problem.create.quizOnlyFalse'
                };

                $scope.problemTypes = {
                    'ALGORITHM': 'problem.type.ALGORITHM',
                    'MULTIPLE_CHOICE' : 'problem.type.MULTIPLE_CHOICE',
                    'SINGLE_CHOICE' : 'problem.type.SINGLE_CHOICE',
                    'TRUE_OR_FALSE' : 'problem.type.TRUE_OR_FALSE',
                    'FILL_THE_CODE': 'problem.type.FILL_THE_CODE'
                };
                $scope.availableOptions = [];
                $scope.new = {
                    option: ''
                };
                $scope.correct = {
                    option: null
                };

                $scope.addOption = function () {
                    if($scope.new.option !== '') {
                        $scope.problem.choices.push({description: $scope.new.option, correct: false});
                        $scope.new.option = '';
                    }
                    $scope.checkChanges();
                };

                $scope.deleteOption = function (index) {
                    $scope.problem.choices.splice(index, 1);
                    $scope.checkChanges();
                };

                $scope.enableConfirm = false;
                var delay = (function () {
                    var timer = 0;

                    return function (callback, ms) {
                        clearTimeout(timer);
                        timer = setTimeout(callback, ms);
                    };
                }());
                if(editable === 'DESCRIPTION') {
                    $scope.message = 'problem.editTab.description';
                    $scope.key = 'description';
                } else if(editable === 'INPUT') {
                    $scope.message = 'problem.editTab.input';
                    $scope.key = 'inputFormat';
                } else if(editable === 'OUTPUT') {
                    $scope.message = 'problem.editTab.output';
                    $scope.key = 'outputFormat';
                }
                $scope.selectedTopics = {};
                $scope.problem = problem;
                if(!$scope.problem.id) {
                    $scope.problem.choices = [];
                    $scope.problem.blankLines = [];
                    $scope.problem.quizOnly = false;
                }

                $scope.original = problem ? _.clone(problem, true) : undefined;
                $scope.original.selectedTopics = {};
                $scope.selectedTopicsSize = 0;
                $scope.ndList = {
                    1 : 'problem.nd.1',
                    2 : 'problem.nd.2',
                    3 : 'problem.nd.3',
                    4 : 'problem.nd.4',
                    5 : 'problem.nd.5'
                };
                $scope.timeList = {
                    1 : '1s',
                    2 : '2s',
                    3 : '3s',
                    4 : '4s',
                    5 : '5s',
                    6 : '6s',
                    7 : '7s',
                    8 : '8s',
                    9 : '9s',
                    10: '10s',
                    11 : '11s',
                    12 : '12s',
                    13 : '13s',
                    14 : '14s',
                    15 : '15s',
                    16 : '16s',
                    17 : '17s',
                    18 : '18s',
                    19 : '19s',
                    20: '20s'
                };
                $scope.activeTab = 'description';
                topicService.list({max: 1000}).then(function (response) {
                    $scope.allTopics = response.data;

                    if ($scope.problem.topics) {
                        _.each($scope.problem.topics, function (topic) {
                            $scope.selectedTopics[topic.id] = true;
                            $scope.original.selectedTopics[topic.id] = true;

                        });
                    }
                });
                $scope.problemInfo = {nameMaxSize: 45, sourceMaxSize: 120};

                $scope.filterTopic = function (topicId) {
                    if ($scope.selectedTopics.hasOwnProperty(topicId)) {
                        delete $scope.selectedTopics[topicId];

                        if ($scope.problem.id) {
                            ProblemService.removeTopic($scope.problem.id, topicId);
                        }
                    } else {
                        $scope.selectedTopics[topicId] = true;
                        if ($scope.problem.id) {
                            ProblemService.addTopic($scope.problem.id, topicId);
                        }
                    }
                    $scope.problem.topics = Object.keys($scope.selectedTopics);
                    $scope.checkChanges();
                };

                $scope.validateName = function () {
                    $scope.loading.name = true;
                    if(problem.name === $scope.original.name) {
                        $scope.loading.name = false;
                        $scope.checkChanges();
                    } else {
                        delay(function () {
                            ProblemService.validate($scope.problem).then(function () {
                                $scope.loading.name = false;
                                $scope.createProblem.problemName.$setValidity('name', true);
                            }, function (response) {
                                $scope.loading.name = false;
                                if(problem.name !== $scope.original.name) {
                                    if (_.pluck(response.data.errors, 'code').indexOf(303011) !== -1) {
                                        $scope.createProblem.problemName.$setValidity('name', false);
                                    }
                                }
                            });
                            $scope.checkChanges();
                        }, 1000);
                    }
                };

                $scope.checkChanges = function () {
                    if(editable === 'BASIC_INFO') {
                        if($scope.createProblem.$valid) {
                            if($scope.createProblem.problemName.$dirty && $scope.problem.name !== $scope.original.name) {
                                $scope.enableConfirm = true;
                            } else if($scope.createProblem.problemSource.$dirty && $scope.problem.source !== $scope.original.source) {
                                $scope.enableConfirm = true;
                            } else if(JSON.stringify($scope.selectedTopics) !== JSON.stringify($scope.original.selectedTopics)) {
                                $scope.enableConfirm = true;
                            } else if(String($scope.problem.timeLimit) !== String($scope.original.timeLimit)) {
                                $scope.enableConfirm = true;
                            } else if(String($scope.problem.level) !== String($scope.original.level)) {
                                $scope.enableConfirm = true;
                            } else if ($scope.problem.quizOnly !== $scope.original.name) {
                                $scope.enableConfirm = true;
                            } else {
                                $scope.enableConfirm = false;
                            }
                        } else {
                            $scope.enableConfirm = false;
                        }
                    } else if(editable === 'DESCRIPTION') {
                        if($scope.problem.description !== $scope.original.description) {
                            $scope.enableConfirm = true;
                        } else {
                            $scope.enableConfirm = false;
                        }
                    } else if (editable === 'INPUT') {
                        if($scope.problem.inputFormat !== $scope.original.inputFormat) {
                            $scope.enableConfirm = true;
                        } else {
                            $scope.enableConfirm = false;
                        }
                    } else if (editable === 'OUTPUT') {
                        if($scope.problem.outputFormat !== $scope.original.outputFormat) {
                            $scope.enableConfirm = true;
                        } else {
                            $scope.enableConfirm = false;
                        }
                    } else if(editable === 'CHOICES') {
                        if(JSON.stringify($scope.original.choices) !== JSON.stringify($scope.problem.choices)) {
                            $scope.enableConfirm = true;
                        } else {
                            $scope.enableConfirm = false;
                        }
                    } else if(editable === 'CODE') {
                        if(JSON.stringify($scope.original.baseCode) !== JSON.stringify($scope.problem.baseCode) ||
                            JSON.stringify($scope.original.baseLanguage) !== JSON.stringify($scope.problem.baseLanguage) ||
                            JSON.stringify($scope.original.blankLines) !== JSON.stringify($scope.problem.blankLines)) {
                            $scope.enableConfirm = true;
                        } else {
                            $scope.enableConfirm = false;
                        }
                    }

                };

                var checkProblemQuality = _.debounce(function() {
                    $scope.$apply(function() {
                        $scope.checklist = problemQualityChecklist($scope.problem);
                        $scope.hasProblems = false;
                        Object.keys($scope.checklist).forEach(function(check) {
                            if ($scope.checklist[check]) {
                                $scope.hasProblems = true;
                            }
                        });
                    });
                }, 1000);

                $scope.$watch('problem', checkProblemQuality, true);

                $scope.$watchGroup(['problem.level','problem.timeLimit', 'problem.baseCode', 'problem.blankLines', 'problem.baseLanguage'], function () {
                    $scope.checkChanges();
                });

                $scope.$watch('problem.choices', function () {
                    $scope.checkChanges();
                }, true);

                $scope.formSubmit = function (editTextField) {

                    if (typeof($scope.problem.quizOnly) !== 'boolean') {
                        $scope.problem.quizOnly = $scope.problem.quizOnly === 'true';
                    }

                    $scope.saved = false;
                    $scope.error = false;
                    if($scope.problem.problemType === 'SINGLE_CHOICE') {
                        $scope.problem.choices.forEach(function (it) {
                            it.correct = false;
                        });
                        $scope.problem.choices[$scope.correct.option].correct = true;
                    }
                    if (!editTextField && !$scope.createProblem.$valid) {
                        _(_.keys($scope.createProblem)).forEach(function (field) {
                            if (field[0] !== '$') {
                                $scope.createProblem[field].$setDirty();
                            }
                        });
                    } else {
                        $scope.problem.topics = [];
                        _.each(_.keys($scope.selectedTopics), function (key) {
                            if ($scope.selectedTopics[key]) {
                                $scope.problem.topics.push({id: key});
                            }
                        });
                        if (problem.id) {
                            $scope.loading.form = true;
                            ProblemService.update($scope.problem).then(function (response) {
                                $scope.loading.form = false;
                                $scope.$parent.problem = response.data;
                                $scope.original = response.data;
                                $scope.enableConfirm = false;
                                $scope.saved = true;
                                $scope.error = false;
                            }, function () {
                                $scope.loading.form = false;
                                $scope.saved = false;
                                $scope.error = true;
                            });
                        } else {
                            $scope.loading.form = true;
                            ProblemService.create($scope.problem).then(function (response) {
                                $scope.loading.form = false;
                                if($scope.problem.problemType === 'ALGORITHM' || $scope.problem.problemType === 'FILL_THE_CODE') {
                                    $state.go('problem-show.problem-edit-test-case', {id: response.data.id});
                                } else {
                                    $state.go('problem-show.description', {id: response.data.id});
                                }
                            }, function(err) {
                                console.log(err);
                                $scope.loading.form = false;
                                $scope.saveError = 'Não foi possível salvar o problema. Verifique se ele atende os critérios de qualidade.';
                            });
                        }
                    }
                };
            }
        ])

        .controller('ProblemTranslateController', [
            '$scope',
            'problem',
            'ProblemService',
            'UserService',
            'SecurityService',
            function ($scope, problem, ProblemService, UserService, SecurityService) {

                $scope.problemi18n = {
                };

                $scope.translate = function() {
                    console.log($scope.problemi18n);
                    ProblemService.translate(problem.id, $scope.problemi18n).then(function() {
                        $scope.saved = true;
                        $scope.error = false;
                    }, function() {
                        $scope.saved = false;
                        $scope.error = true;
                    });
                };

                $scope.languageSelected = function() {
                    var locale = $scope.problemi18n.locale;
                    ProblemService.get(problem.id, { locale: locale }).then(function(resp) {

                        $scope.problemi18n = _.pick(resp.data, 'name', 'description', 'inputFormat', 'outputFormat');
                        $scope.problemi18n.locale = locale;

                    });
                };

                $scope.languages = UserService.availableLanguages();

                SecurityService.requestCurrentUser().then(function(user) {
                    $scope.problemi18n.locale = Object.keys($scope.languages)[0];

                    if ($scope.problemi18n.locale === user.locale) {
                        $scope.problemi18n.locale = Object.keys($scope.languages)[1];
                    }

                    $scope.languageSelected();
                });
            }]
        )

        .controller('ProblemTestCaseController', [
            '$scope',
            '$state',
            'problem',
            'testCases',
            'ProblemService',
            'FileSaver',
            '$stateParams',
            '$location',
            function ($scope, $state, problem, testCases, ProblemService, FileSaver, $stateParams, $location) {
                $scope.problem = problem;
                $scope.testCases = testCases;

                var url = $location.url();

                var bang = url.indexOf('#testcase-');
                if (bang > -1) {
                    $scope.selectedTestCase = parseInt(url.substring(bang, url.length).replace('#testcase-', ''));
                }

                _.each(testCases, function (testCase) {
                    testCase.saved = true;
                });
                $scope.updateTestCaseStatus = function () {
                    _.each($scope.testCases, function (testCase, index) {
                        if ($scope.createProblem['testCase-' + index] && !testCase.saved) {
                            $scope.createProblem['testCase-' + index].$setDirty();
                        } else if ($scope.createProblem['testCase-' + index] && testCase.saved) {
                            $scope.createProblem['testCase-' + index].$setPristine();
                        }
                    });
                };
                $scope.addTestCase = function () {
                    $scope.testCases.unshift({input: '', output: '', tip: '', example: false});
                    $scope.updateTestCaseStatus();
                };
                $scope.testCaseSaved = function (response, index) {
                    $scope.testCases[index] = response.data;
                    $scope.testCases[index].saved = true;
                    $scope.createProblem['testCase-' + index].$setPristine();
                    $scope.$parent.problem.testCases.total = $scope.$parent.problem.testCases.total + 1;
                    if(response.data.example) {
                        $scope.$parent.problem.testCases.examples = $scope.$parent.problem.testCases.examples + 1;
                    }
                };
                $scope.batchUpload = function () {
                    var formData = new FormData();
                    formData.append('file', $scope.file);
                    $scope.error = null;
                    ProblemService.createTestCaseBatch(problem.id, formData).then(function (response) {
                        angular.element('input[type="file"]').val(null);
                        $scope.countTestCasesSaved = response.data.length;
                        // $state.go('problem-show.problem-edit-test-case', null, { location: false });
                    }, function(err) {
                        $scope.error = err.data;
                    });
                };
                $scope.saveTestCase = function (index) {
                    var testCase = $scope.testCases[index];
                    if (testCase.id) {

                        if (testCase.large) {
                            var largeTestCase = {id : testCase.id, example : testCase.example};
                            ProblemService.updateTestCase(problem.id, largeTestCase).then(function (response) {
                                $scope.testCaseSaved(response, index);
                            });
                        } else {
                            ProblemService.updateTestCase(problem.id, testCase).then(function (response) {
                                $scope.testCaseSaved(response, index);
                            });
                        }
                    } else {
                        ProblemService.createTestCase(problem.id, testCase).then(function (response) {
                            $scope.testCaseSaved(response, index);
                        });
                    }
                };

                $scope.deleteTestCase = function (index) {
                    var testCase = $scope.testCases[index];
                    $scope.deletingTestCase = true;
                    if (testCase.id) {
                        ProblemService.removeTestCase(problem.id, testCase.id).then(function () {
                            $scope.deletingTestCase = false;
                            $scope.$parent.problem.testCases.total = $scope.$parent.problem.testCases.total - 1;
                            if($scope.testCases[index].example) {
                                $scope.$parent.problem.testCases.examples = $scope.$parent.problem.testCases.examples - 1;
                            }
                            $scope.testCases.splice(index, 1);
                        });
                    } else {
                        $scope.testCases.splice(index, 1);
                    }
                    $scope.updateTestCaseStatus();
                };

                $scope.downloadTestCase = function (id) {
                    ProblemService.getTestCase($scope.problem.id, id, true).then(function(response) {
                        var blob = new Blob([response.data], {
                            type: 'application/zip;charset=utf-8'
                        });
                        FileSaver.saveAs(blob, id + '.zip');
                    });
                };
            }
        ])

        .controller('ProblemChoicesController', [
            '$scope',
            'currentUser',
            'ChoiceService',
            function($scope, currentUser, ChoiceService) {

                $scope.currentUser = currentUser;
                $scope.$loading = true;

                ChoiceService.list(10)
                    .then(function(response) {
                        $scope.problems = response.data;
                    });
            }
        ])

        .controller('ProblemChoicesCreateController', [
            '$scope',
            'problem',
            'ProblemService',
            'TopicService',
            'editable',
            '$state',
            function ($scope, problem, ProblemService, TopicService, editable, $state) {

                $scope.selectedTopics = {};
                $scope.problem = problem;
                $scope.original = problem ? _.clone(problem, true) : null;
                $scope.problemInfo = {nameMaxSize: 45, sourceMaxSize: 120};

                $scope.ndList = {
                    1 : 'problem.nd.1',
                    2 : 'problem.nd.2',
                    3 : 'problem.nd.3',
                    4 : 'problem.nd.4',
                    5 : 'problem.nd.5'
                };
                $scope.timeList = {
                    1 : '1s',
                    2 : '2s',
                    3 : '3s',
                    4 : '4s',
                    5 : '5s',
                    6 : '6s',
                    7 : '7s',
                    8 : '8s',
                    9 : '9s',
                    10: '10s',
                    11 : '11s',
                    12 : '12s',
                    13 : '13s',
                    14 : '14s',
                    15 : '15s',
                    16 : '16s',
                    17 : '17s',
                    18 : '18s',
                    19 : '19s',
                    20: '20s'
                };

                TopicService.list({max: 1000}).then(function (response) {
                    $scope.allTopics = response.data;
                    if ($scope.problem.topics) {
                        _.each($scope.problem.topics, function (topic) {
                            $scope.selectedTopics[topic.id] = true;
                            $scope.original.selectedTopics[topic.id] = true;
                        });
                    }
                });

                $scope.filterTopic = function (topicId) {
                    if ($scope.selectedTopics.hasOwnProperty(topicId)) {
                        delete $scope.selectedTopics[topicId];
                    } else {
                        $scope.selectedTopics[topicId] = true;
                    }
                    $scope.checkChanges();
                };

                $scope.validateName = function () {
                    if (problem.name === $scope.original.name) {
                        $scope.checkChanges();
                    } else {
                        ProblemService.validate($scope.problem).then(function () {
                            $scope.form.problemName.$setValidity('name', true);
                        }, function (response) {
                            if (problem.name !== $scope.original.name) {
                                if (_.pluck(response.data.errors, 'code').indexOf(303011) !== -1) {
                                    $scope.form.problemName.$setValidity('name', false);
                                }
                            }
                        });
                        $scope.checkChanges();
                    }
                };

                $scope.checkChanges = function () {
                    if(editable === 'BASIC_INFO') {
                        if($scope.form.$valid) {
                            if($scope.form.problemName.$dirty && $scope.problem.name !== $scope.original.name) {
                                $scope.enableConfirm = true;
                            } else if($scope.form.problemSource.$dirty && $scope.problem.source !== $scope.original.source) {
                                $scope.enableConfirm = true;
                            } else if(JSON.stringify($scope.selectedTopics) !== JSON.stringify($scope.original.selectedTopics)) {
                                $scope.enableConfirm = true;
                            } else if(String($scope.problem.timeLimit) !== String($scope.original.timeLimit)) {
                                $scope.enableConfirm = true;
                            } else if(String($scope.problem.level) !== String($scope.original.level)) {
                                $scope.enableConfirm = true;
                            } else {
                                $scope.enableConfirm = false;
                            }
                        } else {
                            $scope.enableConfirm = false;
                        }
                    } else if(editable === 'DESCRIPTION') {
                        if($scope.problem.description !== $scope.original.description) {
                            $scope.enableConfirm = true;
                        } else {
                            $scope.enableConfirm = false;
                        }
                    } else if (editable === 'INPUT') {
                        if($scope.problem.inputFormat !== $scope.original.inputFormat) {
                            $scope.enableConfirm = true;
                        } else {
                            $scope.enableConfirm = false;
                        }
                    } else if (editable === 'OUTPUT') {
                        if($scope.problem.outputFormat !== $scope.original.outputFormat) {
                            $scope.enableConfirm = true;
                        } else {
                            $scope.enableConfirm = false;
                        }
                    }
                };

                $scope.formSubmit = function () {
                    $scope.saved = false;
                    $scope.error = false;
                    if (!$scope.form.$valid) {
                        _(_.keys($scope.form)).forEach(function (field) {
                            if (field[0] !== '$') {
                                $scope.form[field].$setDirty();
                            }
                        });
                    } else {
                        $scope.problem.topics = [];
                        _.each(_.keys($scope.selectedTopics), function (key) {
                            if ($scope.selectedTopics[key]) {
                                $scope.problem.topics.push({id: key});
                            }
                        });
                        if (problem.id) {
                            ProblemService.update($scope.problem).then(function (response) {
                                $scope.$parent.problem = response.data;
                                $scope.original = response.data;
                                $scope.enableConfirm = false;
                                $scope.saved = true;
                                $scope.error = false;
                            }, function () {
                                $scope.saved = false;
                                $scope.error = true;
                            });
                        } else {
                            ProblemService.create($scope.problem).then(function (response) {
                                $state.go('problem-show.problem-edit-test-case', {id: response.data.id});
                            });
                        }
                    }
                };
            }])

        .controller('ProblemChoicesShowController', [
            '$scope',
            '$stateParams',
            'ChoiceService',
            function ($scope, $stateParams, ChoiceService) {

                ChoiceService.get({id: $stateParams.id})
                    .then(function (response) {
                        $scope.problem = response.data;
                    });

                $scope.selectChoice = function (choice) {
                    if (choice.$selected) {
                        choice.$selected = false;
                    } else {
                        if ($scope.problem.kind === 'SINGLE_CHOICE') {
                            var selected = _.findWhere($scope.problem.choices, {$selected: true});
                            if (selected) {
                                selected.$selected = false;
                            }
                        }
                        choice.$selected = true;
                    }
                };
            }
        ])

        .controller('ProblemChoicesQuizCreateController', [
            '$scope',
            'quiz',
            'ChoiceService',
            '$state',
            function ($scope, quiz, ChoiceService, $state) {
                $scope.quiz = quiz;
                $scope.selectedProblems = [];

                ChoiceService.list()
                    .then(function (response) {
                        $scope.problems = response.data;
                        _.each($scope.quiz.problems, function (problemId) {
                            var problem = _.findWhere($scope.problems, {id: problemId});
                            if (problem) {
                                problem.$selected = true;
                                $scope.selectedProblems.push(problem);
                            } else {
                                console.log('Problema #%s não encontrado', problemId);
                            }
                        });
                    });

                $scope.selectProblem = function (problem, $event) {
                    $event.preventDefault();
                    if (problem.$selected) {
                        return;
                    }

                    $scope.selectedProblems.push(problem);
                    problem.$selected = true;
                };

                $scope.desselectProblem = function (problem, $event) {
                    $event.preventDefault();

                    if (!problem.$selected) {
                        return;
                    }

                    var idx = $scope.selectedProblems.indexOf(problem);
                    if (idx >= 0) {
                        $scope.selectedProblems.splice(idx, 1);
                    }

                    problem.$selected = false;
                };

                $scope.saveQuiz = function () {
                    $scope.quiz.questions = $scope.selectedProblems.map(function (problem) {
                        return problem.id;
                    });

                    ChoiceService.createQuiz($scope.quiz)
                        .then(function(response) {
                            $state.go('problem-choices-quiz', { id: response.data.id });
                        });
                };
            }
        ])
        .controller('ProblemChoicesQuizShowController', [
            '$scope',
            'currentUser',
            '$stateParams',
            'ChoiceService',
            function($scope, currentUser, $stateParams, ChoiceService) {
                $scope.currentUser = currentUser;
                ChoiceService.getQuiz($stateParams.id)
                    .then(function(response) {
                        $scope.quiz = response.data;
                        $scope.quiz.questions.forEach(function(problem, idx) {
                            problem.$index = idx + 1;
                            problem.$answered = false;
                        });

                        $scope.problem = $scope.quiz.questions[0];
                    });


                $scope.selectChoice = function (choice) {
                    if (choice.$selected) {
                        choice.$selected = false;
                    } else {
                        if ($scope.problem.kind === 'SINGLE_CHOICE') {
                            var selected = _.findWhere($scope.problem.choices, {$selected: true});
                            if (selected) {
                                selected.$selected = false;
                            }
                        }
                        choice.$selected = true;
                    }
                };

                $scope.sendQuestion = function () {
                    $scope.problem.$answered = true;
                    $scope.nextQuestion();
                };

                $scope.nextQuestion = function () {
                    var idx = $scope.problem.$index,
                        problem;

                    if (idx < $scope.quiz.questions.length) {
                        $scope.selectQuestion(idx + 1);
                    } else {
                        console.log('PROCURAR PRIMEIRA NÃO RESPONDIDA');
                        problem = _.findWhere($scope.quiz.questions, { $answered: false });
                        if (problem) { $scope.selectQuestion(problem.$index); }
                        else { $scope.submitQuizAnswers(); }
                    }
                };

                $scope.selectQuestion = function (idx) {
                    var problem = _.findWhere($scope.quiz.questions, { $index: idx });
                    $scope.problem = problem;
                };

                $scope.submitQuizAnswers = function () {
                    console.log('ok');
                };
            }
        ])

        .controller('ProblemInsertCodeController', [
            '$scope',
            '$timeout',
            'ProblemService',
            'submission',
            '$state',
            '$translate',
            function ($scope, $timeout, problemService, submission, $state, $translate) {
                $scope.codes = [];
                $scope.disableConfirm = false;

                $scope.options1 = {
                    mode: 'text/x-c++src',
                    lineNumbers: true,
                    lineWrapping: true,
                    readOnly: true,
                    cursorHeight: 0
                };

                $scope.options2 = {
                    mode: 'text/x-c++src',
                    lineNumbers: true,
                    lineWrapping: true
                };

                $timeout(function () {
                    var languageName = $scope.problem.baseLanguage.name;
                    $scope.comment = '//';
                    if (languageName === 'Java') {
                        $scope.options1.mode = 'text/x-java';
                        $scope.options2.mode = 'text/x-java';
                    } else if (languageName === 'Python') {
                        $scope.comment = '#';
                        $scope.options1.mode = 'text/x-python';
                        $scope.options2.mode = 'text/x-python';
                    } else if (languageName === 'Python3.2') {
                        $scope.comment = '#';
                        $scope.options1.mode = 'text/x-python';
                        $scope.options2.mode = 'text/x-python';
                    }else if (languageName === 'Pascal') {
                        $scope.options1.mode = 'text/x-pascal';
                        $scope.options2.mode = 'text/x-pascal';
                    } else if (languageName === 'Octave') {
                        $scope.comment = '#';
                        $scope.options1.mode = 'text/x-octave';
                        $scope.options2.mode = 'text/x-octave';
                    }

                    var defaultText = '';
                    $timeout(function () {
                        $translate('problem.insertCodeHere').then(function (translated) {
                            defaultText = $scope.comment + translated;
                        });
                    }, 100);

                    $scope.code = $scope.problem.baseCode.split(/\r?\n/);
                    $scope.problem.blankLines.sort();
                    $scope.codeView = '';

                    var i = 0;

                    if(submission) {
                        $scope.submission = submission;
                        $scope.compare = function (a,b) {
                            if (a.lineNumber < b.lineNumber) {
                                return -1;
                            }

                            if (a.lineNumber > b.lineNumber) {
                                return 1;
                            }
                            return 0;
                        };
                        $scope.submission.codeParts.sort($scope.compare);
                        $scope.submission.codeParts.forEach(function (it) {
                            $scope.codes[i] = it.code;
                            i = i + 1;
                        });
                    } else {
                        $timeout(function () {
                            $scope.problem.blankLines.forEach(function () {
                                $scope.codes[i] = defaultText;
                                i = i+1;
                            });
                        }, 200);
                    }

                    $scope.problem.blankLines.forEach(function (it, index) {
                        var editor = $('#editor'+index)[0].childNodes[0].CodeMirror;
                        editor.on('mousedown', function () {
                            if($scope.codes[index] === defaultText) {
                                $scope.codes[index] = '';
                                $scope.$apply();
                            }
                        });
                    });


                    $scope.$watchCollection('codes', function () {
                        var i = 0;
                        $scope.problem.blankLines.sort(function(a, b) { return a - b; }).forEach(function (it) {
                            $scope.code[it] = $scope.codes[i];
                            i = i+1;
                        });
                        $scope.codeView = '';
                        $scope.disableConfirm = _.indexOf($scope.codes, '') !== -1 || _.indexOf($scope.codes, ($scope.comment + 'Insira código aqui')) !== -1;
                        $scope.code.forEach(function (it, index) {
                            if(it === undefined) {
                                it = '';
                            }
                            if(index === 0) {
                                $scope.codeView = it;
                            } else {
                                $scope.codeView = $scope.codeView + '\n' + it;
                            }
                        });
                    });
                }, 500);

                $scope.$watch('submission', function() {
                    if ($scope.submission.evaluation === 'CORRECT') {
                        $scope.problem.currentUser.status = $scope.submission.evaluation;
                    }

                    problemQualityChecklist($scope.problem);
                });

                $scope.submitCode = function () {
                    var submission = {
                        codeParts: []
                    };
                    $scope.problem.blankLines.forEach(function (it, index) {
                        submission.codeParts.push({lineNumber: it+1, code: $scope.codes[index]});
                    });
                    problemService.sendSolution($scope.problem.id, submission).then(function (response) {
                        problemQualityChecklist($scope.problem);
                        $scope.submission = response.data;
                        $timeout(function () {
                            $state.go('problem-show.submission-show', {subId : $scope.submission.id});
                        }, 200);
                    });
                };

            }
        ]);

}(angular, require));