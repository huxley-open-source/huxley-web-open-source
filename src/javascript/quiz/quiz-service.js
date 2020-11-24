/*global require, angular*/

(function (require, angular) {
    'use strict';

    var quizApp = require('./quiz-app');

    angular.module(quizApp.name)


        .service('QuizService', ['Restangular', function (Restangular) {
            this.get = function (id) {
                return Restangular.one('quizzes', id).withHttpConfig({ transformResponse: function(data) {
                    var resp =  JSON.parse(data);
                    if (resp.questionnaire) {
                        resp.questionnaire.role = resp.role;
                        resp.questionnaire.group.role = resp.role;
                    }

                    return resp.questionnaire;
                }}).get();
            };

            this.listUserQuizzes = function (params) {
                return Restangular.one('user').getList('quizzes', params);
            };

            this.listUserScores = function (params) {
                return Restangular.one('user').one('quizzes').getList('scores', params);
            };

            this.getUserQuizzes = function (userId, params) {
                return Restangular.one('users', userId).getList('quizzes', params);
            };

            this.getUserQuizScores = function(quizId, userId) {
                return Restangular.one('quizzes', quizId).one('users', userId).one('problems').get();
            };

            this.getProblems = function (quizId, params) {
                return Restangular.one('quizzes', quizId).getList('problems', params);
            };

            this.getQuizScores = function (quizId) {
                return Restangular.one('quizzes', quizId).getList('scores');
            };

            this.getStudents = function (quizId, params) {
                return Restangular.one('quizzes', quizId).getList('users', params);
            };

            this.search = function (params) {
                return Restangular.one('user').getList('quizzes', params);
            };

            this.getSimilarities = function (quizId, params) {
                return Restangular.one('quizzes', quizId).getList('similarities', params);
            };

            this.getStats = function (quizId, onlyPresent) {
                var params = { quizId: quizId };
                if (onlyPresent) {
                    params.filter = 'presence';
                }
                return Restangular.one('submissions').one('stats').get(params);
            };

            this.getPresentUsers = function(quizId) {
                return Restangular.one('quizzes', quizId).getList('present');
            };

            this.create = function (quiz) {
                return Restangular.all('quizzes').customPOST(quiz);
            };

            this.clone = function (id, quiz) {
                return Restangular.one('quizzes', id).one('clone').customPOST(quiz);
            };

            this.update = function (quiz) {
                return Restangular.one('quizzes', quiz.id).customPUT(quiz);
            };

            this.addProblem = function (quizId, problem, max) {
                return Restangular.one('quizzes', quizId).one('problems', problem.id).save({score: problem.score, max: max});
            };

            this.addPenalty = function (userId, quizId, problemId, penalty) {
                return Restangular.one('users',userId).one('quizzes', quizId).one('problems', problemId).one('penalty').save({penalty: penalty});
            };

            this.getPenalty = function (userId, quizId, problemId) {
                return Restangular.one('users', userId).one('quizzes', quizId).one('problems', problemId).one('penalty').get();
            };

            this.failQuizz = function (userId, quizId) {
                return Restangular.one('users',userId).one('quizzes', quizId).one('fail').save();
            };

            this.updateProblem = function (quizId, problem) {
                return Restangular.one('quizzes', quizId).one('problems', problem.id).put({score: problem.score});
            };

            this.removeProblem = function (quizId, problem) {
                return Restangular.one('quizzes', quizId).one('problems', problem.id).remove();
            };

            this.exportXLS = function (quizId) {
                return Restangular.one('quizzes', quizId).one('export').get();
            };

            this.remove = function (id) {
                return Restangular.one('quizzes', id).remove();
            };

            this.discardSimilarity = function (quizId, similarityId) {
                return Restangular.one('quizzes', quizId).one('similarities', similarityId).one('discard').customPOST();
            };

            this.confirmSimilarity = function (quizId, similarityId, option) {
                return Restangular.one('quizzes', quizId).one('similarities', similarityId).one('confirm').customPOST({option: option});
            };

            this.importQuizzes = function (params) {
                return Restangular.one('quizzes').one('import').customPOST(params);
            };

            this.addRestriction = function(quizId, problemId, params) {
                return Restangular.one('quizzes', quizId).one('problems', problemId).one('restrictions').customPOST(params);
            };

            this.findRestrictions = function(quizId, problemId) {
                return Restangular.one('quizzes', quizId).getList('restrictions', { problem: problemId });
            };

            this.findRestrictionsResult = function(quizId) {
                return Restangular.one('quizzes', quizId).one('restrictions').getList('result');
            };

        }]);
}(require, angular));