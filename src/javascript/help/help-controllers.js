/*global require, angular, _*/

(function (require, angular) {
    'use strict';

    var helpApp = require('./help-app');

    angular.module(helpApp.name)
        .controller('HelpController', [
            '$scope',
            '$stateParams',
            function ($scope, $stateParams) {
                var vm = this,
                    topicsByCode = {};

                vm.topics = [
                    {code: 'faq' },
                    {code: 'profile'},
                    {code: 'group'},
                    {code: 'admin-tutorial' },
                    {code: 'teacher-tutorial'}
                ];

                vm.pages = [
                    { slug: 'doubt-of-students', topic: 'faq' },
                    { slug: 'doubt-of-teachers', topic: 'faq' },
                    { slug: 'profile-institution', topic: 'profile' },
                    { slug: 'thermometer', topic: 'group'},
                    { slug: 'poor-performance-students', topic: 'group' },
                    { slug: 'admin', topic: 'admin-tutorial' },
                    { slug: 'admin-add-teacher', topic: 'admin-tutorial' },
                    { slug: 'create-group', topic: 'teacher-tutorial' },
                    { slug: 'create-quiz', topic: 'teacher-tutorial' },
                    { slug: 'create-problem', topic: 'teacher-tutorial' }
                ];

                vm.selectTopic = function (topic) {
                    vm.selectedTopic = topic;
                };

                _.each(vm.topics, function (topic) {
                    topic.label = 'help-topics.' + topic.code;
                    topicsByCode[topic.code] = topic;
                });

                _.each(vm.pages, function (page) {
                    page.label = 'help-pages.' + page.slug;
                    var topic = topicsByCode[page.topic];
                    if (topic) {
                        if (!topic.pages) {
                            topic.pages = [];
                        }
                        topic.pages.push(page);
                    }
                });

                //$rootScope.$on('$stateChangeError',
                //    function(event, toState, toParams, fromState, fromParams, error){
                //        console.log('chama aqui');
                //        $state.go('not-found', null, { location: false });
                //    });

                $scope.$watch(function () {
                    return $stateParams.page;
                }, function (pageSlug) {
                    vm.selectedPage = _.findWhere(vm.pages, {slug: pageSlug});
                    if (vm.selectedPage) {
                        vm.selectedTopic = topicsByCode[vm.selectedPage.topic];
                    } else {
                        vm.selectedTopic = null;

                    }
                });
            }]);


}(require, angular));