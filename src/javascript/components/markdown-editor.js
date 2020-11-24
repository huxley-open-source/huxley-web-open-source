/*global module, angular, require, markdownit, _, hljs*/

(function (module, angular) {
    'use strict';

    var EXAMPLE_CODE = [
            '*Exemplo:* **Questão de múltipla escolha** é uma questão composta por uma descrição e vem com mais de uma opção de resposta marcada',
            '',
            '[x] uma resposta correta',
            '[x] outra resposta correta',
            '[ ] uma opção que está errada'
        ].join('\n'),

        repeatStr = function (str, n) {
            if (n <= 1) {
                return str;
            }
            var tmp = str;
            n -= 1;
            while (n--) {
                tmp += str;
            }
            return tmp;
        },

        smartRange = function (editor) {
            var range = editor.selection.getRange();
            if (!range.isEmpty()) {
                return range; // return what user selected
            }
            // nothing was selected
            var _range = range; // backup original range
            range = editor.selection.getWordRange(range.start.row, range.start.column); // range for current word
            if (editor.session.getTextRange(range).trim().length === 0) { // selected is blank
                range = _range; // restore original range
            }
            return range;
        },

        actionTypes = {
            heading: function (editor, attrs) {

                var level = attrs.level,
                    p = editor.getCursorPosition();

                p.column += level + 1; // cursor offset
                editor.navigateTo(editor.getSelectionRange().start.row, 0); // navigateLineStart has issue when there is wrap
                editor.insert(repeatStr('#', level) + ' ');
                editor.moveCursorToPosition(p); // restore cursor position
                editor.focus();
            },

            style: function (editor, attrs) {
                var modifier = attrs.modifier,
                    range = smartRange(editor),
                    p = editor.getCursorPosition();

                p.column += modifier.length; // cursor offset

                editor.session.replace(range, modifier + editor.session.getTextRange(range) + modifier);
                editor.moveCursorToPosition(p); // restore cursor position
                editor.selection.clearSelection(); // don't know why statement above selects some text
                editor.focus();
            },

            codeBlock: function (editor, attrs) {
                var text = editor.session.getTextRange(editor.selection.getRange()).trim(),
                    language = attrs.language;

                editor.insert('\n```' + (language || '') + '\n' + text + '\n```\n');
                editor.focus();
                editor.navigateUp(2);
                editor.navigateLineEnd();
            },

            list: function (editor, attrs) {
                var prefix = attrs.prefix,
                    p = editor.getCursorPosition(),
                    range,
                    i,
                    n;

                p.column += prefix.length + 1; // cursor offset
                range = editor.selection.getRange();
                for (i = range.start.row + 1, n = 1; i < range.end.row + 2; i += 1) {
                    editor.gotoLine(i);
                    if (prefix === '#') {
                        editor.insert(n + '. ');
                        n += 1;
                    } else {
                        editor.insert(prefix + ' ');
                    }
                }
                editor.moveCursorToPosition(p); // restore cursor position
                editor.focus();
            }
        },

        componentsApp = require('./components-module');

    function createMarkdownIt(options) {

        var md;

        options = _.extend({

            html: true,
            linkify: true,
            typographer: true,

            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return '<pre class="hljs hljs-' + lang + '"><code>' +
                            hljs.highlight(lang, str).value +
                            '</code></pre>';
                    } catch (ignore) {
                    }
                }

                return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
            }
        }, options);

        md = markdownit(options);

        return md;
    }

    angular.module(componentsApp.name)

        .directive('bindMarkdown', [
            function () {

                var md = createMarkdownIt();

                return {
                    strict: 'A',
                    scope: {
                        code: '=bindMarkdown',
                        displayInline: '='
                    },
                    link: function (scope, elem) {

                        var cached;

                        function update() {
                            var code = scope.code,
                                inline = scope.displayInline;

                            if (code) {
                                if (!cached) {
                                    cached = md.render(code);
                                }
                                elem[0].innerHTML = cached;
                                if (inline) { elem[0].innerHTML = elem.text(); }
                            } else {
                                cached = null;
                                elem[0].innerHTML = '';
                            }
                        }

                        scope.$watch('code', update);
                        scope.$watch('displayInline', update);
                    }
                };
            }
        ])
        .directive('markdownPreview', [
            function () {

                return {
                    strict: 'EA',
                    template: '<div ng-bind-html="html"></div>',
                    scope: {
                        code: '=',
                        options: '=',
                        snippets: '=',
                        language: '='
                    },
                    link: function (scope) {

                        var md = createMarkdownIt(scope.options);

                        function update() {
                            var code = scope.code.replace(/_\{(\d+)\}/g, function (match, p1) {
                                var snippet = scope.snippets[p1] || {};
                                if (scope.language && snippet.language !== scope.language) {
                                    return '';
                                }
                                return '```' + snippet.language + '\n' + snippet.code + '\n```';
                            });
                            scope.html = md.render(code || '');
                        }

                        scope.$watch('code', update);
                        scope.$watch('language', update);
                        scope.$watchCollection('snippets', update);
                    }
                };
            }
        ])

        .directive('markdownEditor', [
            function () {

                return {
                    strict: 'E',
                    templateUrl: 'components/templates/markdown-editor.tpl.html',
                    scope: {
                        problem: '=',
                        selectedLanguage: '=',
                        debug: '@'
                    },
                    controller: [
                        '$scope',
                        '$translate',
                        function ($scope, $translate) {

                            var actionMap = {},
                                editor;

                            if (!$scope.preferredLanguage) {
                                $scope.preferredLanguage = $translate.proposedLanguage() || $translate.use();
                            }

                            ///////////////////////////////////////////////////////////

                            function executeAction(actionName) {
                                return function (editor) {
                                    var action = actionMap[actionName];
                                    if (action) {
                                        action(editor);
                                    }
                                };
                            }

                            function lang() {
                                return $scope.preferredLanguage;
                            }

                            function parseProblem() {

                                var stem = $scope.problem.stem,
                                    snippets = $scope.problem.snippets,
                                    choices = $scope.problem.choices,
                                    currentLang = lang(),
                                    codeChoices = [],
                                    codeStem = '';

                                if (stem && stem.locales) {
                                    codeStem = stem.locales[currentLang];
                                }

                                _.each(choices, function (choice) {
                                    codeChoices.push({
                                        code: choice.locales[currentLang] || '--',
                                        correct: choice.correct
                                    });
                                });

                                if (codeStem && codeChoices.length > 0) {

                                    codeStem = codeStem.replace(/_\{(\d+)\}/g, function (match, p1) {
                                        var snippet = snippets[p1] || {};
                                        return '```' + snippet.language + '\n' + snippet.code + '\n```';
                                    });

                                    return [
                                        codeStem,
                                        '\n\n',
                                        codeChoices.map(function (c) {
                                            return (c.correct ? '[x] ' : '[ ] ') + c.code;
                                        }).join('\n')
                                    ].join('');
                                }

                                return EXAMPLE_CODE;
                            }

                            ///////////////////////////////////////////////////////////////////////////////

                            $scope.formatContent = function () {
                                $scope.code = parseProblem();
                            };

                            $scope.togglePreview = function () {
                                $scope.showPreview = !$scope.showPreview;
                                editor.resize();
                            };

                            this.getEditor = function () {
                                return editor;
                            };

                            this.registerAction = function (actionName, handler) {
                                if (actionMap[actionName]) {
                                    throw new Error('Já existe uma ação registrada para: "' + actionName + '"');
                                }

                                actionMap[actionName] = handler;
                                return function () {
                                    delete actionMap[actionName];
                                };
                            };

                            $scope.onEditorLoad = function (_editor) {
                                editor = _editor;
                                editor.setScrollSpeed(1);
                                //editor.setOption('scrollPastEnd', true);
                                //editor.session.setFoldStyle('manual');
                                editor.focus();

                                // overwrite some ACE editor keyboard shortcuts
                                editor.commands.addCommands([
                                    {
                                        name: 'bold',
                                        bindKey: {win: 'Ctrl-B', mac: 'Command-B'},
                                        exec: executeAction('bold')
                                    },
                                    {
                                        name: 'italic',
                                        bindKey: {win: 'Ctrl-I', mac: 'Command-I'},
                                        exec: executeAction('italic')
                                    },
                                    {
                                        name: 'underline',
                                        bindKey: {win: 'Ctrl-U', mac: 'Command-U'},
                                        exec: executeAction('underline')
                                    }
                                ]);
                            };

                            $scope.updateProblem = function () {

                                var questionRegex = /\[(x| )\] ([^]*?)(\[|$)/g,
                                    snippetRegex = /``` *(\w+)\n([^]*?)```/g,
                                    idx = 0,
                                    currentChoices = [],
                                    currentSnippets = [],
                                    currentLang = lang(),
                                    correctChoicesCount = 0,
                                    firstMatch,
                                    code,
                                    snippetRes,
                                    questionRes,
                                    problemChoices,
                                    problemChoice,
                                    currentChoice,
                                    n,
                                    i;

                                if ($scope.problem.choices) {
                                    problemChoices = $scope.problem.choices;
                                } else {
                                    $scope.problem.choices = problemChoices = [];
                                }

                                snippetRes = snippetRegex.exec($scope.code);
                                while (snippetRes !== null) {
                                    currentSnippets.push({
                                        language: snippetRes[1].trim(),
                                        code: snippetRes[2].trim()
                                    });
                                    snippetRes = snippetRegex.exec($scope.code);
                                }

                                i = -1;
                                snippetRegex.index = 0;
                                code = $scope.code.replace(snippetRegex, function () {
                                    i += 1;
                                    return '_{' + i + '}';
                                });

                                questionRes = questionRegex.exec(code);
                                firstMatch = questionRes ? questionRes.index : code.length;

                                while (questionRes !== null) {
                                    currentChoices[idx] = {
                                        code: questionRes[2].trim(),
                                        correct: questionRes[1] === 'x'
                                    };

                                    if (questionRes[1] === 'x') {
                                        correctChoicesCount += 1;
                                    }

                                    idx += 1;
                                    questionRegex.lastIndex = questionRegex.lastIndex - 2;
                                    questionRes = questionRegex.exec(code);
                                }

                                n = Math.max(problemChoices.length, currentChoices.length);

                                for (i = 0; i < n; i += 1) {

                                    problemChoice = problemChoices[i];
                                    currentChoice = currentChoices[i];

                                    if (currentChoice && problemChoice) {
                                        // Existe os 2 casos: Sobrescreve a resposta correta da outra lingua e
                                        problemChoice.locales[currentLang] = currentChoice.code;
                                        problemChoice.correct = currentChoice.correct;
                                    } else if (currentChoice) {
                                        // Se não houver a escolha no problema, adiciona
                                        problemChoices[i] = problemChoice = {
                                            locales: {},
                                            correct: currentChoice.correct
                                        };
                                        problemChoice.locales[currentLang] = currentChoice.code;
                                    } else if (problemChoice) {
                                        // Se houver a escolha no problema e não houver na atual, apaga
                                        problemChoice.locales[currentLang] = '--';
                                    }
                                }

                                if (!$scope.problem.stem) {
                                    $scope.problem.stem = {};
                                }
                                if (!$scope.problem.stem.locales) {
                                    $scope.problem.stem.locales = {};
                                }

                                $scope.problem.stem.locales[currentLang] = code.substring(0, firstMatch);
                                $scope.problem.snippets = currentSnippets;
                                $scope.problem.kind = correctChoicesCount > 1 ? 'MULTIPLE_CHOICE'
                                    : correctChoicesCount > 0 ? 'SINGLE_CHOICE' : 'INVALID';
                            };

                            ///////////////////////////////////////////////////////////

                            $scope.$watch('problem', function () {
                                $scope.formatContent();
                            });

                            if ($scope.problem && $scope.problem.stem) {
                                $scope.code = parseProblem();
                            } else {
                                if (!$scope.problem) {
                                    $scope.problem = {};
                                }
                                $scope.code = EXAMPLE_CODE;
                                $scope.updateProblem();
                            }
                        }
                    ]
                };
            }]);

    _.forEach(actionTypes, function (handler, type) {
        var directiveName = 'markdown' + (type[0].toUpperCase() + type.slice(1));

        componentsApp.directive(directiveName, [
            function () {

                return {
                    restrict: 'A',
                    require: '^markdownEditor',
                    link: function (scope, element, attrs, ctrl) {

                        var unregister;

                        function onClickElement() {
                            var editor = ctrl.getEditor();

                            handler(editor, attrs);
                            scope.$apply();
                        }

                        if (attrs.registerAction) {
                            unregister = ctrl.registerAction(attrs.registerAction, function (editor) {
                                handler(editor, attrs);
                                scope.$apply();
                            });
                        }

                        element.on('click', onClickElement);

                        scope.$on('$destroy', function () {
                            element.off('click', onClickElement);
                            unregister();
                        });
                    }
                };
            }
        ]);
    });

}(module, angular));
