/*global require, angular, _*/

(function (require, angular) {
    'use strict';

    var problemApp = require('./problem-app');

    angular.module(problemApp.name)

        .service('ProblemService', ['Restangular', function (Restangular) {

            window.Restangular = Restangular;

            this.vote = function (testCaseId, params) {
                return Restangular.one('vote', testCaseId).customPOST(params);
            };

            this.getProblemsCount = function () {
                return Restangular.one('problems').one('count').withHttpConfig({cache: true}).getList();
            };

            this.votes = function (id) {
                return Restangular.one('vote', id).get();
            };

            this.list = function (params) {
                return Restangular.all('problems').getList(params);
            };

            this.get = function (id, params) {
                return Restangular.one('problems', id).get(params);
            };

            this.getUserProblem = function (id) {
                return Restangular.one('user').one('problems', id).get();
            };

            this.create = function (problem) {
                return Restangular.all('problems').post(problem);
            };

            this.validate = function (problem) {
                return Restangular.all('problems').all('validate').post(problem);
            };

            this.update = function (problem) {
               return Restangular.one('problems', problem.id).customPUT(problem);
            };

            this.translate = function (problemId, translation) {
               return Restangular.one('problems', problemId).all('translate').customPUT(translation);
            };

            this.getExamples = function (id, params) {
                return Restangular.one('problems', id).getList('examples', params);
            };

            this.getTestCases = function (id, params) {
                return Restangular.one('problems', id).getList('testcases', params);
            };

            this.getTestCase = function(probId, id, zip) {
                var headers = {};
                var httpConfig = {};
                if (zip) {
                    headers.Accept = 'application/zip';
                    httpConfig.responseType = 'arraybuffer';
                }

                return Restangular
                    .one('problems', probId)
                    .one('testcases', id)
                    .withHttpConfig(httpConfig)
                    .get({}, headers);
            };

            this.countGroupResolvers = function(groupId, problems) {
                return Restangular.one('groups', groupId).post('resolvers', { problems: problems });
            };

            this.createTestCaseBatch = function (id, testCase) {
                return Restangular.one('problems', id).all('testcases')
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPOST(testCase, '', undefined, {'Content-Type': undefined});
            };

            this.createTestCase = function (id, testCase) {
                return Restangular.one('problems', id).all('testcases').post(testCase);
            };

            this.removeTestCase = function (problemId, id) {
                return Restangular.one('problems', problemId).one('testcases', id).remove();
            };

            this.updateTestCase = function (id, testCase) {
                var caseUpdated = Restangular.one('problems', id).one('testcases', testCase.id);
                _.assign(caseUpdated, testCase);
                return caseUpdated.put();
            };

            this.sendSolutionFile = function (problemId, fd) {
                return Restangular.one('user').one('problems', problemId).all('submissions')
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPOST(fd, '', undefined, {'Content-Type': undefined});
            };

            this.runCode = function (problemId, data) {
                return Restangular.one('problems', problemId).post('run', data);
            };

            this.getCodeResult = function (id, hash, plain) {
                var headers = {};
                if (plain) {
                    headers.Accept = 'text/plain';
                }
                return Restangular.one('problems', id).one('run', hash).get({}, headers);
            };

            this.sendSolution = function (problemId, params) {
                return Restangular.one('user').one('problems', problemId).all('submissions').customPOST(params);
            };

            this.getSubmissions = function (problemId, params) {
                return Restangular.one('problems', problemId).getList('submissions', params);
            };
            // O usuário precisa estar autenticado
            this.getUserSubmissions = function (problemId, params) {
                return Restangular.one('user').one('problems', problemId).getList('submissions', params);
            };

            this.getStatistics = function (problemId, params) {
                return Restangular.one('problems', problemId).one('stats').get(params);
            };

            // O usuário precisa estar autenteicado
            this.getSuggestion = function () {
                return Restangular.one('user').one('problems').one('suggestions').get();
            };

            this.sendToOracle = function (problemId, input) {
                return Restangular.one('problems', problemId).post('oracle', input);
            };

            this.getFromOracle = function (id, hash, plain) {
                var headers = {};
                if (plain) {
                    headers.Accept = 'text/plain';
                }
                return Restangular.one('problems', id).one('oracle', hash).get({}, headers);
            };

            this.getAnswerSizeFromOracle = function (id, hash) {
                return Restangular.one('problems', id).one('oracle', hash).one('size').get();
            };

            this.sendImage = function (formData) {
                return Restangular.one('problems').one('image')
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPOST(formData, '', undefined, {'Content-Type': undefined});
            };

            this.addTopic = function (problemId, topicId) {
                return Restangular.one('problems', problemId).one('topics', topicId).put();
            };

            this.removeTopic = function (problemId, topicId) {
                return Restangular.one('problems', problemId).one('topics', topicId).remove();
            };

            this.getStats = function(params) {
                return Restangular.one('problems').getList('stats', params);
            };

            this.countByStatus = function() {
                return Restangular.one('problems').one('countByStatus').get();
            };

            this.approve = function(problemId) {
                return Restangular.one('problems', problemId).one('accept').put();
            };

            this.findBadTips = function() {
                return Restangular.one('problems').one('badTips').get();
            };

            this.getLanguages = function(problemId) {
                return Restangular.one('problems', problemId).getList('languages');
            };

            this.setScore = function(problemId, score) {
                return Restangular.one('problems', problemId).one('score').customPOST({ score: score });
            };

            this.getUserScore = function(problemId) {
                return Restangular.one('problems', problemId).one('score').get();
            };

        }])

        .service('TopicService', ['Restangular', function (Restangular) {
            this.list = function (params) {
                return Restangular.all('topics').getList(params);
            };

            this.get = function (id) {
                return Restangular.one('topics', id).get();
            };

            this.save = function (params) {
                return Restangular.all('topics').post(params);
            };

            this.remove = function (id) {
                return Restangular.one('topics', id).remove();
            };

            this.put = function (id, params) {
                return Restangular.one('topics', id).customPUT(params);
            };
        }])

        .service('ChoiceService', ['$q', function ($q) {

            var problemText = [
                    //'# Titulo balbla',
                    //'',
                    //'asdkajsd kjasd',
                    //'',
                    //'',
                    '*Exemplo:*',
                    '**Questão de múltipla escolha** é uma questão composta por uma descrição e vem com mais de uma opção de resposta marcada',
                    '',
                    '1. 1asdas das',
                    '2. asdkj asdkas',
                    '3. asdka sdkja sdk'
                ].join('\n'),
                codeOnly = [
                    '```js',
                    'var answer = getInputSync()',
                    'if (answer) { console.log(\'javascript is good\'); }',
                    'else { console.log(\'FAIL\'); }'
                ].join('\n'),

                problemTextWithCode = [
                    'A resposta correta é:',
                    '',
                    codeOnly
                ].join('\n'),

                exampleTopics = [
                    {name: 'Tópico 1'},
                    {name: 'Tópico 2'},
                    {name: 'Tópico 3'}
                ],

                choiceDescriptions = [problemText, codeOnly, problemTextWithCode],
                allQuizzes = {},
                allProblems;

            function pickDescription() {
                var n = Math.floor(choiceDescriptions.length * Math.random());
                return {
                    description: choiceDescriptions[n]
                };
            }

            function mockChoiceProblem() {

                var rand = Math.floor(Math.random() * 10 + 1),
                    kind = (rand % 2) ? 'SINGLE_CHOICE' : 'MULTIPLE_CHOICE';

                return {
                    id: _.uniqueId(),
                    nd: rand,
                    kind: kind,
                    description: problemText,
                    topics: exampleTopics,
                    choices: _.range(5).map(pickDescription)
                };
            }

            allProblems = _.range(5).map(mockChoiceProblem);

            this.list = function () {
                return $q.when({
                    data: allProblems
                });
            };

            this.get = function (q) {
                var problem = _.findWhere(allProblems, q);
                return $q.when({
                    data: problem || mockChoiceProblem()
                });
            };

            this.save = function (params) {
                params.id = _.uniqueId();
                allProblems.unshift(params);
                return this.get({ id: params.id });
            };

            this.createQuiz = function (quiz) {
                quiz.id = _.uniqueId();
                allQuizzes[quiz.id] = quiz;
                return this.getQuiz(quiz.id);
            };

            this.getQuiz = function (id) {
                var quiz = angular.copy(allQuizzes[id]);

                if (!quiz) {
                    quiz = {
                        id: id,
                        questions: allProblems
                    };
                } else {

                    quiz.questions = (quiz.questions || []).map(function (problemId) {
                        console.log(problemId, allProblems);
                        return _.findWhere(allProblems, {id: problemId});
                    });
                }

                return $q.when({data: quiz});
            };
        }]);

}(require, angular));