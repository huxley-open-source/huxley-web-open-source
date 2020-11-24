/*global require, describe, beforeEach, module, inject, it, expect, angular */

require('../../../main/config-module');
require('../../problem-app');
require('angular-mocks');

describe('ProblemShowController', function () {
    'use strict';

    var scope, $location;

    beforeEach(function () {

        angular.mock.module('restangular');// RestangularProvider
        angular.mock.module('pascalprecht.translate');// $translateProvider
        angular.mock.module('ui.router'); // $stateProvider

        // thehuxley.templates
        angular.module('thehuxley.templates', []); // mock

        angular.mock.module('thehuxley.config'); // apiURL
        angular.mock.module('thehuxley.problem');

        inject(function ($controller, _$location_, $rootScope) {
            scope = $rootScope.$new();
            $location = _$location_;

            var $attrs = {'id': 67}, problem = {id: 67, 'name': 'opa'};


            $controller('ProblemShowController',
                {$scope: scope,  $location: $location, $attrs: $attrs, problem: problem});

            scope.$digest();
        });

    });

    describe('$scope.principal', function () {
        it('Verifica se o problema está no escopo dentro do map: principal', function () {
            expect(scope.problem.id).toEqual(67);
        });
    });
});