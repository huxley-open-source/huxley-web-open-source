/*global require, angular*/

(function (require, angular) {
    'use strict';

    var languageApp = require('./language-app');

    angular.module(languageApp.name)

        .controller('LanguageCreateController', [
            '$scope',
            'LanguageService',
            'language',
            function ($scope, LanguageService, language) {

                $scope.language = language.data;
                $scope.languageSaved = false;
                $scope.searched = false;
                $scope.form = {
                    maxLength: 255
                };

                $scope.sendLanguage = function () {
                    $scope.languageSaved = false;
                    if ($scope.language.id) {
                        LanguageService.put($scope.language.id, $scope.language).then(
                            function () {
                                $scope.searched = true;
                                $scope.languageSaved = true;
                            },
                            function () {
                                $scope.searched = true;
                            }
                        );
                    } else {
                        LanguageService.save($scope.language).then(
                            function () {
                                $scope.searched = true;
                                $scope.languageSaved = true;
                            },
                            function () {
                                $scope.searched = true;
                            }
                        );
                    }
                };

            }
        ])

        .controller('LanguageListController', [
            '$scope',
            'LanguageService',
            function ($scope, LanguageService) {

                var delay;

                delay = (function () {
                    var timer = 0;
                    return function (callback, ms) {
                        clearTimeout(timer);
                        timer = setTimeout(callback, ms);
                    };
                }());

                $scope.paginationData = {
                    currentPage: 1,
                    itemsPerPage: 10,
                    totalItems: 0,
                    max: 10,
                    offset: 0
                };

                $scope.searchParams = {
                    'order' : 'asc',
                    'sort' : 'name',
                    'languageToSearch' : ''
                };

                $scope.search = function () {
                    $scope.loading = true;
                    $scope.searched = true;
                    LanguageService.list({
                        q : $scope.searchParams.languageToSearch,
                        offset: $scope.paginationData.offset,
                        sort: $scope.searchParams.sort,
                        order: $scope.searchParams.order,
                        max: $scope.paginationData.max
                    }).then(
                        function (response) {
                            $scope.languages = response.data;
                            $scope.paginationData.totalItems  = response.headers('total') || 0;
                            $scope.loading = false;
                        },
                        function () {
                            $scope.loading = false;
                        }
                    );
                };

                $scope.doSearch = function () {
                    delay(function () {
                        $scope.search();
                    }, 200);
                };


                $scope.deleteLanguage = function (id) {
                    LanguageService.remove(id).then(
                        function () {
                            $scope.search();
                        }
                    );
                };

                $scope.search();
            }
        ]);

}(require, angular));