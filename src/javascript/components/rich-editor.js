/*global module, angular, require, $*/

(function (module, angular) {
    'use strict';

    var componentsApp = require('./components-module');

    angular.module(componentsApp.name)
        .directive('richEditor', [
            function () {

                function linkFn() {
                    // Keep
                }

                return {
                    strict: 'E',
                    templateUrl: 'components/templates/rich-editor.tpl.html',
                    require: '?ngModel',
                    controller: 'RichEditorController',
                    scope: {
                        availableLanguages: '=languages',
                        content: '='
                    },
                    compile: function (element) {
                        element.addClass('rich-editor');
                        return linkFn;
                    }
                };
            }])

        .directive('richSnippet', [
            function () {

                function linkFn(scope, elem, attr) {

                    var isOpen = scope.isOpen;
                    if (isOpen) {
                        elem.addClass('is-open');
                    }

                    scope.index = attr.index;
                    scope.toggleSnippet = function() {
                        scope.isOpen = isOpen = !isOpen;
                        if (isOpen) {
                            elem.addClass('is-open');
                        } else {
                            elem.removeClass('is-open');
                        }
                    };

                    scope.$watch('snippet.display', function (display) {
                        if (display) {
                            elem.removeClass('snippet-inline snippet-block');
                            elem.addClass(display === 'INLINE' ? 'snippet-inline' : 'snippet-block');
                        }
                    });
                }

                return {
                    restrict: 'A',
                    templateUrl: 'components/templates/rich-snippet.tpl.html',
                    scope: {
                        isOpen: '=',
                        snippet: '=',
                        language: '=language',
                        locale: '=locale'
                    },
                    compile: function (element) {
                        element.addClass('rich-snippet');
                        element.attr('contenteditable', false);
                        return linkFn;
                    }
                };
            }])

        .controller('RichEditorController', [
            '$scope',
            '$attrs',
            '$element',
            '$compile',
            '$translate',
            '$timeout',
            function ($scope, $attrs, $element, $compile, $translate, $timeout) {

                ////////// PRIVATE VARIABLES;

                var preferredLanguage = $translate.proposedLanguage() || $translate.use(),
                    contentEl = $element.find('.rich-editor-body > [contenteditable="true"]'),
                    stem, lastIndex = 0;

                ////////// PRIVATE FUNCTIONS

                function nextIndex() {
                    lastIndex += 1;
                    return lastIndex;
                }

                function createBlankStem() {
                    return {
                        locales: {},
                        snippets: {}
                    };
                }

                function reloadContentHtml(_) {
                    stem = _ || createBlankStem();

                    var html = stem.locales[preferredLanguage] || '';
                    html = html.replace(/_\{(\d+)\}/,
                        '<div rich-snippet locale="locale" language="currentLanguage" contenteditable="false" snippet="snippet" is-open="false" index="$1"></div>');

                    contentEl.html(html);

                    $timeout(function () {
                        contentEl.find('[rich-snippet]')
                            .each(function () {
                                var $el = angular.element(this),
                                    idx = $el.attr('index'),
                                    snippet = stem.snippets[idx];

                                var newScope = $scope.$new();
                                newScope.snippet = snippet;
                                newScope.locale = preferredLanguage;
                                $compile(this)(newScope);

                                lastIndex = Math.max(lastIndex, parseInt(idx, 10));
                            });


                    });
                }

                function insertNodeAtCursor(node) {
                    var range = window.getSelection().getRangeAt(0),
                        parents = $(range.startContainer).parents(contentEl);

                    for (var i = 0, n = parents.length; i < n; i++) {
                        if (parents[i] === contentEl[0]) {
                            range.insertNode(node);
                            return true;
                        }
                    }

                    return false;
                }

                ////////// WATCH FOR CONTENT CHANGES

                $scope.$watch('content', function (model) {
                    reloadContentHtml(model);
                });

                ///////// UPDATE STEM WHEN CONTENT BLURS
                contentEl.on('blur', function () {

                    // Coloca no topo da pilha para pegar a adição do novo snippet:
                    setTimeout(function() {

                        // Clonamos o EL para não interferirmos na edição do snippet que também causa o BLUR
                        var contentClone = contentEl.clone();

                        contentClone.find('[rich-snippet]').each(function() {
                            var $el = $(this);
                            $el.replaceWith('_{' + $el.attr('index') + '}');
                        });

                        if (!stem.locales) {
                            stem.locales = {};
                        }

                        stem.locales[preferredLanguage] = contentClone.html();

                        $scope.$apply();
                    }, 1);
                });

                $scope.addSnippet = function () {

                    var idx = nextIndex(),
                        snippet = { display: 'BLOCK', codes: {} },
                        newScope = $scope.$new();

                    stem.snippets[idx] = snippet;
                    newScope.snippet = snippet;
                    newScope.locale = preferredLanguage;

                    var el = $compile('<div rich-snippet language="currentLanguage" locale="locale" contenteditable="false" snippet="snippet" is-open="true" index="' + idx + '"></div>')(newScope),
                        added = insertNodeAtCursor(el[0]);

                    if (added) {
                        contentEl.append('<p><br></p>');
                    }
                };


            }]);

}(module, angular));