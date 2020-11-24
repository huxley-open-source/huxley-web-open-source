/*global require, angular*/

(function (require, angular) {
    'use strict';

    var submissionApp = require('./submission-app');

    angular.module(submissionApp.name)

        .service('SubmissionService', ['Restangular', function (Restangular) {

            this.get = function (id) {
                return Restangular.one('submissions', id).get();
            };

            this.getEvaluation = function(id) {
                return Restangular.one('submissions', id).one('evaluation').get();
            };

            this.list = function (params) {
                return Restangular.all('submissions').getList(params);
            };

            this.listUserSubmissions = function (params) {
                return Restangular.one('user').all('submissions').getList(params);
            };

            this.getSubmissionCode = function (id) {
                return Restangular.one('submissions', id).one('sourcecode').get();
            };

            this.getDiff = function (id) {
                return Restangular.one('submissions', id).one('diff').get();
            };

            this.reevaluateOne = function (id) {
                return Restangular.one('submissions', id).one('reevaluate').post();
            };

            this.reevaluateByProblem = function (problemId, params) {
                return Restangular.one('problems', problemId).all('submissions').all('reevaluate').post(params);
            };

            this.getProblemStats = function(problemId, params) {
                return Restangular.one('submissions').one('problem', problemId).one('stats').get(params);
            };

            this.getSubmissionCodeByProblemAndTry = function(problemId, tryNumber, userId) {
                var params = {};

                if (userId) {
                    params.userId = userId;
                }
                return Restangular.one('submissions').one('problem', problemId).one('try', tryNumber).get(params);
            };

            this.getStats = function(params) {
                return Restangular.one('submissions').one('summary').get(params);
            };

            this.getRestrictionEvaluation = function (submissionId) {
                return Restangular.one('submissions', submissionId).one('restriction').get();
            };

            this.getTestCase = function(submissionId, testCaseId) {
                var headers = {};
                var httpConfig = {};
                headers.Accept = 'application/zip';
                httpConfig.responseType = 'arraybuffer';

                return Restangular
                    .one('submissions', submissionId)
                    .one('testcase', testCaseId)
                    .withHttpConfig(httpConfig)
                    .get({}, headers);
            };

        }]);

}(require, angular));