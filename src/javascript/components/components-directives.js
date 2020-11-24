/*global require, angular, _, moment, $*/

(function (require, angular) {
    'use strict';

    var componentsApp = require('./components-module');

    angular.module(componentsApp.name)

        .config(['$compileProvider',
            function ($compileProvider) {
                $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
            }])

        .directive('thDatepicker', function () {
            //noinspection JSLint
            return {
                restrict: 'E',
                replace: true,
                require: '^form',
                scope: {
                    label: '=?label',
                    elementId: '=?elementId',
                    date: '=?date',
                    options: '=?options',
                    validateMsg: '=?validateMsg',
                    validateFunction: '&validateFunction',
                    customValidation: '=?customValidation',
                    isRequired: '=?isRequired',
                    withTime: '=?withTime',
                    hours: '=?hours',
                    minutes: '=?minutes',
                    alwaysSetDate: '=?alwaysSetDate'
                },
                templateUrl: 'components/templates/datepicker.tpl.html',

                link: function (scope, element, attrs, formCtrl) {
                    scope.element = formCtrl[scope.elementId];
                    if (scope.customValidation === true) {
                        scope.element.$parsers.unshift(function (value) {
                            var valid = scope.validateFunction()(value);
                            if (scope.withTime) {
                                valid = scope.validateFunction()(value, scope.hours, scope.minutes);
                            }
                            scope.element.$setValidity('custom', valid);
                            if(scope.alwaysSetDate) {
                                return value;
                            }
                            return valid ? value : undefined;
                        });
                    }
                    scope.setHours = function(hours) {
                        scope.hours = hours;
                    };
                    scope.setMinutes = function(minutes) {
                        scope.minutes = minutes;
                    };
                },

                controller: function ($scope) {
                    $scope.dateOptions = {'show-weeks': 'false'};
                    $scope.isOpen = false;
                    $scope.open = function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        $scope.isOpen = true;
                    };
                    $scope.disableDropdown = function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        $scope.isOpen = true;
                    };
                    if ($scope.withTime === true) {
                        if (!$scope.hours) {
                            $scope.hours = 0;
                        }
                        if (!$scope.minutes) {
                            $scope.minutes = 0;
                        }
                        if ($scope.date !== undefined) {
                            $scope.hours = new Date($scope.date).getHours();
                            $scope.minutes = new Date($scope.date).getMinutes();
                        }

                        $scope.hoursMap = {};
                        $scope.minutesMap = {};
                        for (var i = 0; i < 60; i++) {
                            if (i < 24) {
                                if (i < 10) {
                                    $scope.hoursMap[i] = '0' + i.toString();
                                    $scope.minutesMap[i] = '0' + i.toString();
                                } else {
                                    $scope.hoursMap[i] = i.toString();
                                    $scope.minutesMap[i] = i.toString();
                                }

                            } else {
                                $scope.minutesMap[i] = i.toString();
                            }

                        }
                    }
                }
            };
        })

        .directive('simpleScrollbar', [

            function() {

                return {
                    restrict: 'A',
                    link: function(scope, elem, attr) {
                        var obj = scope.$eval(attr.simpleScrollbar);
                        elem.perfectScrollbar(obj || {});
                        scope.$on('$destroy', function() {
                            elem.perfectScrollbar('destroy');
                        });
                    }
                };
            }])

        .directive('perfectScrollbar', ['$window', function ($window) {

                return {
                    restrict: 'EA',
                    transclude: true,
                    template: '<div><div ng-transclude></div></div>',
                    replace: true,
                    scope: {
                        element: '=?refreshOnChange',
                        selectedIndex: '=?selectedIndex',
                        keepScrollAtBottom: '=?keepScrollAtBottom'
                    },

                    link: function ($scope, $elem) {
                        var jqWindow = angular.element($window);
                        $elem.perfectScrollbar();

                        var delay = (function () {
                            var timer = 0;

                            return function (callback, ms) {
                                clearTimeout(timer);
                                timer = setTimeout(callback, ms);
                            };
                        }());

                         function update () {
                            $elem.perfectScrollbar('update');
                            if ($scope.element !== undefined && $elem.find('li')[0] !== undefined) {
                                $scope.liHeight = $elem.find('li').css('height');
                                $scope.liHeight = $scope.liHeight.substring(0, $scope.liHeight.length - 2);
                            }
                            if($scope.keepScrollAtBottom) {
                                $elem.scrollTop( Number.MAX_VALUE , Number.MAX_VALUE );
                            }
                        }

                        $elem.on('mouseenter', function () {
                            update();
                        });

                        if($scope.element !== undefined) {
                            $scope.$watch('element', function () {
                                delay(function () {
                                    update();
                                }, 500);
                            }, true);
                        }

                        if($scope.selectedIndex !== undefined ) {
                            $scope.$watch('selectedIndex', function () {
                                if ($scope.element !== undefined && $elem.find('li')[0] !== undefined) {
                                    $elem.scrollTop(($scope.liHeight) * $scope.selectedIndex);
                                }
                                update();
                            });
                        }

                        jqWindow.on('resize', $scope.update);

                        $elem.bind('$destroy', function () {
                            jqWindow.off('resize', update);
                            $elem.perfectScrollbar('destroy');
                        });
                    }
                };
            }])
        //From: http://stackoverflow.com/questions/24296881/how-do-i-synchronize-the-scroll-position-of-two-divs-using-angularjs
        .directive('syncScrolls', [function(){
            var scrollTop = 0, scrollLeft = 0;
            function combine(elements){
                elements.on('scroll', function(e){
                    if(e.isTrigger){
                        e.target.scrollTop = scrollTop;
                        e.target.scrollLeft = scrollLeft;
                    } else {
                        scrollTop = e.target.scrollTop;
                        scrollLeft = e.target.scrollLeft;
                        elements.each(function () {
                            if( !this.isSameNode(e.target) ){
                                angular.element(this).trigger('scroll');
                            }
                        });
                    }
                });
            }

            return {
                restrict: 'A',
                replace: false,
                link: function (scope, $elem, attrs) {
                    combine($elem.find('.'+attrs.syncScrolls));
                }


            };
        }])

        .directive('thSelectBox', function () {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    label: '=?label',
                    element: '=?element',
                    map: '=?for',
                    default: '=?default',
                    onChange: '&onChange',
                    hideArrow: '=?hideArrow',
                    helpLink: '=?helpLink'
                },
                templateUrl: 'components/templates/selectbox.tpl.html',

                controller: function ($scope) {
                    $scope.isOpen = false;
                    $scope.$watch('map', function (newValue, oldValue) {
                        if (($scope.element === '' || $scope.element === undefined) || ((oldValue !== newValue) && $scope.map.length !== 0)) {
                            $scope.element = _.keys($scope.map)[0];

                            if ($scope.map && $scope.element) {
                                $scope.selectedText = $scope.map[$scope.element];
                            }
                        }
                    });
                    $scope.$watch('element', function (now, before) {
                        if ($scope.map) {
                            $scope.selectedText = $scope.map[$scope.element];
                        }
                        if ((now !== before) && $scope.onChange !== undefined) {
                            $scope.onChange();
                        }
                    });
                    $scope.choose = function (key) {
                        $scope.element = key;
                        $scope.isOpen = false;
                    };


                    $scope.disableDropdown = function ($event) {
                        $event.stopPropagation();
                    };
                }
            };
        })

        .directive('thInputCompleteBox', ['UserService', 'ProblemService', 'InstitutionService', 'GroupService',
            //noinspection JSLint
            function (UserService, ProblemService, InstitutionService, GroupService) {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        label: '=?label',
                        placeholder: '=?placeholder',
                        chosenList: '=?chosenList',
                        required: '=?isRequired',
                        elementId: '=?elementId',
                        customValidation: '=?customValidation',
                        validateMsg: '=?validateMsg',
                        validateFunction: '&validateFunction',
                        addUser: '=?addUser',
                        type: '=?type',
                        fixed: '=?fixedSize',
                        onlyOne: '=?onlyOne',
                        for: '=?for',
                        institution: '=?institution',
                        hasError: '=?hasError',
                        modelName: '=?modelName'
                    },
                    require: '^form',

                    link: function (scope, element, attrs, formCtrl) {
                        scope.element = formCtrl[scope.elementId];
                        scope.input = element[0].children[1].children[0].children[0].children[0];
                        scope.checkValidity();
                        if (scope.customValidation === true) {
                            scope.element.$parsers.unshift(function (value) {
                                var valid = scope.validateFunction(value);
                                scope.element.$setValidity('custom', valid);
                                return valid ? value : undefined;
                            });
                        }
                    },

                    templateUrl: 'components/templates/input-complete.tpl.html',

                    controller: function ($scope, $timeout, $filter) {
                        $scope.hasError = false;
                        $scope.inputOnFocus = false;
                        $scope.updateInput = function () {
                            if ($scope.onlyOne === undefined || $scope.onlyOne === false) {
                                if ($scope.chosenList.length === 0) {
                                    $scope.t.element = '';
                                } else {
                                    $scope.t.element = ' ';
                                }
                            } else if ($scope.onlyOne === true) {
                                if ($scope.chosenList && $scope.chosenList.length !== 0) {
                                    $scope.t.element = $scope.chosenList[0].name;
                                }
                            }
                        };
                        $scope.$watch('inputOnFocus', function () {
                            if ($scope.inputOnFocus === false) {
                                $scope.t.isOpen = false;
                            }
                        });

                        if($scope.modelName){
                            $scope.$watch('t.element', function() {
                                $scope.$parent.institutionName = $scope.t.element;
                            });
                        }

                        $scope.chooseAndValidate = function () {
                            $scope.inputOnFocus = false;
                            if ($scope.t.element !== undefined && $scope.t.element.trim().length > 0 && !$scope.onlyOne) {
                                $timeout(function () {
                                    if ($scope.t.element !== undefined && $scope.t.element.trim().length > 0) {
                                        $scope.t.element += ';';
                                        $scope.checkEmail(false);
                                    }
                                }, 400);
                            } else {
                                $scope.checkValidity();
                            }
                        };
                        $scope.checkValidity = function () {
                            if ($scope.required) {
                                if ($scope.chosenList.length === 0) {
                                    $scope.element.$setValidity('empty', false);
                                } else {
                                    $scope.element.$setValidity('empty', true);
                                }
                            }
                            if($scope.hasError !== undefined) {
                                $scope.hasError = false;
                                _.each($scope.chosenList, function (user) {
                                    if(user.valid === false) {
                                        $scope.hasError = true;
                                    }
                                });

                            }
                        };

                        var canPush = true, delay;

                        delay = (function () {
                            var timer = 0;
                            return function (callback, ms) {
                                clearTimeout(timer);
                                timer = setTimeout(callback, ms);
                            };
                        }());

                        $scope.t = {element: '', isopen: false};
                        if ($scope.chosenList === undefined || $scope.chosenList.length === undefined) {
                            $scope.chosenList = [];
                        }
                        $scope.updateInput();

                        $scope.checkEmail = function (focus) {
                            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, email = $scope.t.element.substring(0, $scope.t.element.length - 1);
                            email = email.trim();
                            if(re.test(email)) {
                                $scope.t.choose({email: email, valid: true, name: email}, focus);
                            } else {
                                $scope.t.choose({email: email, valid: false, name: email}, focus);
                            }
                        };

                        $scope.t.choose = function (element, focus) {
                            $scope.t.isopen = false;
                            if (focus === undefined || focus === true) {
                                $scope.input.focus();
                            }
                            angular.forEach($scope.chosenList, function (elementSelected) {
                                if (element.id !== undefined) {
                                    if (element.id === elementSelected.id) {
                                        canPush = false;
                                    }
                                } else if ($scope.type === 'USER') {
                                    if (element.email === elementSelected.email) {
                                        canPush = false;
                                    }
                                }
                            });

                            if (canPush) {
                                if ($scope.onlyOne === true) {
                                    $scope.chosenList = [];
                                    if (element) {
                                        $scope.t.element = element.name;
                                    }
                                }
                                if (element) {
                                    $scope.chosenList.push(element);
                                } else {
                                    $scope.t.element = '';
                                }

                            }

                            canPush = true;
                            $scope.updateInput();
                            $scope.checkValidity();
                        };

                        $scope.t.remove = function (element) {
                            _.remove($scope.chosenList, function (elementInList) {
                                return elementInList === element;
                            });
                            $scope.updateInput();
                            $scope.checkValidity();
                        };

                        $scope.disableDropdown = function ($event) {
                            $event.stopPropagation();
                        };

                        $scope.selectedIndex = -1;
                        $scope.onFocus = -1;
                        $scope.updateIsOpen = function () {
                            if ($scope.inputOnFocus === true && $scope.searchList.length > 0 && $scope.t.element !== undefined && $scope.t.element.trim().length > 0) {
                                $scope.t.isopen = true;
                            } else {
                                $scope.t.isopen = false;
                            }
                        };
                        $scope.getList = function (e) {
                            var val = $scope.t.element;
                            if (val.trim().length > 0) {
                                if ($scope.t.isopen && e.keyCode === 13) {
                                    $scope.t.choose($scope.searchList[$scope.selectedIndex]);
                                } else if ($scope.t.isopen && (e.keyCode === 40 || e.keyCode === 38)) {
                                    if ($scope.selectedIndex === -1) {
                                        $scope.selectedIndex = 0;
                                    } else {
                                        if (e.keyCode === 40) {
                                            $scope.selectedIndex = $scope.selectedIndex + 1;
                                        } else {
                                            $scope.selectedIndex = $scope.selectedIndex - 1;
                                        }
                                        if ($scope.selectedIndex === $scope.searchList.length) {
                                            $scope.selectedIndex = 0;
                                        } else if ($scope.selectedIndex === -1) {
                                            $scope.selectedIndex = $scope.searchList.length - 1;
                                        }
                                    }
                                    $scope.onFocus = $scope.searchList[$scope.selectedIndex].id;

                                } else {
                                    if ($scope.addUser === true && (val.indexOf(',') !== -1 || val.indexOf(';') !== -1)) {
                                        $scope.t.isopen = false;
                                        $scope.checkEmail();
                                    } else {
                                        delay(function () {
                                            if ($scope.for !== undefined) {
                                                $scope.searchList = $filter('filter')($scope.for, $scope.t.element);
                                                $scope.selectedIndex = -1;
                                                $scope.onFocus = -1;
                                                $timeout(function () {
                                                    $scope.updateIsOpen();
                                                });
                                            } else if ($scope.type === 'USER') {
                                                UserService.list({q: val, max: 5}).then(
                                                    function (response) {
                                                        var users = [];
                                                        angular.forEach(response.data, function (item) {
                                                            users.push(item);
                                                        });

                                                        $scope.searchList = users;
                                                        $scope.selectedIndex = -1;
                                                        $scope.onFocus = -1;
                                                        $timeout(function () {
                                                            $scope.updateIsOpen();
                                                        });
                                                    }
                                                );
                                            } else if ($scope.type === 'TEACHER') {
                                                InstitutionService.getTeachers($scope.institution, {q: val, max: 5}).then(
                                                    function (response) {
                                                        var users = [];
                                                        angular.forEach(response.data, function (item) {
                                                            users.push(item);
                                                        });

                                                        $scope.searchList = users;
                                                        $scope.selectedIndex = -1;
                                                        $scope.onFocus = -1;
                                                        $timeout(function () {
                                                            $scope.updateIsOpen();
                                                        });
                                                    }
                                                );
                                            } else if ($scope.type === 'TEACHER_ASSISTANT') {
                                                InstitutionService.getTeachersAssistants($scope.institution, {q: val, max: 5}).then(
                                                    function (response) {
                                                        var users = [];
                                                        angular.forEach(response.data, function (item) {
                                                            users.push(item);
                                                        });

                                                        $scope.searchList = users;
                                                        $scope.selectedIndex = -1;
                                                        $scope.onFocus = -1;
                                                        $timeout(function () {
                                                            $scope.updateIsOpen();
                                                        });
                                                    }
                                                );
                                            } else if ($scope.type === 'PROBLEM') {
                                                ProblemService.list({q: val, max: 5}).then(
                                                    function (response) {
                                                        var problems = [];
                                                        angular.forEach(response.data, function (item) {
                                                            problems.push(item);
                                                        });

                                                        $scope.searchList = problems;
                                                        $scope.selectedIndex = -1;
                                                        $scope.onFocus = -1;
                                                        $timeout(function () {
                                                            $scope.updateIsOpen();
                                                        });
                                                    }
                                                );
                                            }else if ($scope.type === 'GROUP') {
                                                GroupService.list({q: val, max: 5}).then(
                                                    function (response) {
                                                        var problems = [];
                                                        angular.forEach(response.data, function (item) {
                                                            problems.push(item);
                                                        });

                                                        $scope.searchList = problems;
                                                        $scope.selectedIndex = -1;
                                                        $scope.onFocus = -1;
                                                        $timeout(function () {
                                                            $scope.updateIsOpen();
                                                        });
                                                    }
                                                );
                                            } else if ($scope.type === 'INSTITUTION') {
                                                InstitutionService.list({q: val, max: 5}).then(
                                                    function (response) {
                                                        var problems = [];
                                                        angular.forEach(response.data, function (item) {
                                                            problems.push(item);
                                                        });

                                                        $scope.searchList = problems;
                                                        $scope.selectedIndex = -1;
                                                        $scope.onFocus = -1;
                                                        $timeout(function () {
                                                            $scope.updateIsOpen();
                                                        });
                                                    }
                                                );
                                            }
                                        }, 1000);
                                    }
                                }
                            } else {
                                $scope.t.isopen = false;
                                if ($scope.onlyOne) {
                                    $scope.chosenList = [];
                                }
                            }

                        };
                    }
                };
            }])

        .directive('thOrderArrow', function () {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    label: '=?label',
                    order: '=?order',
                    sort: '=?sortBy',
                    element: '=?element',
                    'searchFunction': '&searchFunction'
                },
                templateUrl: 'components/templates/order-arrow.tpl.html',
                controller: function ($scope, $timeout) {
                    $scope.choose = function () {
                        if ($scope.element === $scope.sort) {
                            $scope.order = $scope.order === 'asc' ? 'desc' : 'asc';
                        } else {
                            $scope.order = 'desc';
                        }
                        $scope.element = $scope.sort;
                        $timeout($scope.searchFunction);
                    };
                }
            };
        })

        .directive('thAutoSelect', function ($timeout) {
            return {
                restrict: 'A',
                replace: true,
                templateUrl: 'components/templates/input-auto-select.tpl.html',
                scope: {
                    value: '=?inputValue',
                    onSelect: '=?onSelect'
                },

                link: function (scope, element) {
                    scope.$watch('value', function () {
                        element.select();
                    });

                    element.on('click', function () {
                        element.select();
                    });

                    element.on('select', function () {
                        scope.onSelect = true;
                        $timeout(function () {
                            scope.onSelect = false;
                        }, 2500);
                    });
                }
            };
        })

        .directive('thAlert', function () {
            return {
                restrict: 'A',
                templateUrl: 'components/templates/alert.tpl.html',
                scope: {
                    'close': '=?closable'
                },
                transclude: true,
                controller: function ($scope) {
                    $scope.alert =  true;
                    $scope.closeAlert = function () {
                        $scope.alert = false;
                    };
                }
            };
        })

        .directive('thDifficultyLevelBox', function ($timeout) {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'components/templates/difficulty-level-box.tpl.html',
                scope: {
                    levelSelected: '=?levelSelected',
                    onSelect: '&onSelect'

                },
                controller: function ($scope) {
                    $scope.selectLevel = function (level) {
                        $scope.levelSelected = $scope.levelSelected === level ? undefined : level;
                        $timeout(function () {
                            $scope.onSelect();
                        });

                    };
                }
            };
        })

        .directive('thHead', function (SecurityService) {
            return {
                restrict: 'E',
                scope: {
                    title: '=?headerTitle',
                    group: '=?',
                    institution: '=?',
                    topic: '=?',
                    quiz: '=?'
                },
                templateUrl: 'components/templates/group-head.tpl.html',
                link: function ($scope) {
                    SecurityService.requestCurrentUser().then(
                        function (currentUser) {
                            $scope.currentUser = currentUser;
                        }
                    );
                }
            };
        })

        .directive('thGroupThermometer', function () {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'components/templates/group-thermometer.tpl.html',
                scope: {
                    group: '=?group'
                },
                controller: function ($scope, GroupService, $timeout, $q) {
                    $scope.activity = 'INACTIVE';
                    $scope.activityList = [];
                    $scope.thermometer = {};
                    $scope.thermometer.loading = true;
                    $scope.group.stats = {};
                    $scope.group.users = {};
                    $scope.getStats = function () {
                        var deferred = $q.defer();
                        GroupService.getGroupThermometer($scope.group.id).then(
                            function (response) {
                                $scope.group.users.stats = response.data;
                                deferred.resolve($scope.group.users);
                            },
                            function () {
                                deferred.reject();
                            }
                        );
                        $q.all([deferred.promise]).then(
                            function () {
                                $scope.thermometer.loading = false;
                                $scope.group.stats.activity = [];
                                var submissions = [];
                                var totalAccess = [];
                                var totalUser = 0;
                                angular.forEach($scope.group.users.stats, function (user, key) {
                                    if(!isNaN(key)) {
                                        angular.forEach(user.history, function (submission, key) {
                                            if(submissions[key] === undefined) {
                                                submissions[key] = 0;
                                            }
                                            if(totalAccess[key] === undefined) {
                                                totalAccess[key] = 0;
                                            }
                                            submissions[key] =  submissions[key] + submission.submissionCount;
                                            totalAccess[key] =  totalAccess[key] + 1;
                                        });
                                    } else if(key === 'totalMembers') {
                                        totalUser = user;
                                    }
                                });

                                var today = moment().set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
                                var sT = 0, aT = 0, auxDate = '';
                                for (var i = 0; i < 7 ; i++, today.subtract(1, 'day')) {
                                    auxDate = today.format('YYYYMMDD');
                                    if (submissions[auxDate] !== undefined && totalAccess[auxDate] !== undefined) {
                                        if ($scope.group.users.stats.length !== 0 ) {
                                            sT = (submissions[auxDate])/totalUser;
                                            aT = (totalAccess[auxDate])/totalUser;
                                        }
                                        console.log(sT, aT, totalUser);
                                        $scope.group.stats.activity.push(sT * 0.3 + aT * 0.7);
                                    }

                                }

                                _($scope.group.stats.activity).forEach(function (n) {
                                    var activityStatus = 'INACTIVE';
                                    if (n > 0 && n <= 0.2) {
                                        activityStatus = 'LOW';
                                    } else if (n > 0.2 && n <= 0.4) {
                                        activityStatus = 'MEDIUM';
                                    } else if (n > 0.4) {
                                        activityStatus = 'HIGH';
                                    }
                                    $scope.activity = activityStatus;
                                    $scope.activityList.push(activityStatus);
                                });
                            },
                            function () {
                                $scope.thermometer.loading = 'fail';
                            }
                        );
                    };
                    $scope.getStats();
                }
            };
        })

        .directive('thNotification', function () {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    notification: '=?notification',
                    size: '=?size'
                },
                template: '<div ng-include="getContentUrl()"></div>',
                link: function(scope) {
                    scope.getContentUrl = function() {
                        var url = (scope.size === 'small')? 'components/templates/notification-small.tpl.html' : 'components/templates/notification-normal.tpl.html';
                        return url;
                    };
                },
                controller: function ($scope, ProblemService, QuizService) {
                    $scope.quest = {};
                    $scope.problem = {};
                    $scope.submission = {};
                    if ($scope.notification.kind === '2') {
                        QuizService.get($scope.notification.entityId).then(function (response) {
                            $scope.quest = response.data;
                        });
                    } else if ($scope.notification.kind === '3') {
                        ProblemService.get($scope.notification.entityId).then(function (response) {
                            $scope.problem = response.data;
                        });
                    } else if ($scope.notification.type === 'GROUP_MEMBER_SOLVED_PROBLEM' || $scope.notification.type === 'USER_SUBMISSION_STATUS') {
                        if ($scope.notification.body && $scope.notification.body.submission) {
                            $scope.submission = $scope.notification.body.submission;
                            $scope.user = $scope.submission.user;
                            $scope.problem = $scope.submission.problem;
                        }

                    } else if ($scope.notification.type === 'USER_CHAT_MESSAGE') {
                        $scope.user = $scope.notification.body.sender;
                    }

                }
            };
        })

        .directive('fileModel', ['$parse', function ($parse) { //tirada de http://uncorkedstudios.com/blog/multipartformdata-file-upload-with-angularjs
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var model = $parse(attrs.fileModel), modelSetter = model.assign;

                    element.bind('change', function () {
                        scope.$apply(function () {
                            modelSetter(scope, element[0].files[0]);
                        });
                    });
                }
            };
        }])

        .directive('thQuizPerformance', function () {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'components/templates/quiz-performance.tpl.html',
                scope: {
                    quiz: '=?quiz'
                },
                controller: function ($scope) {

                    var score = $scope.quiz.calcpartial && !$scope.quiz.penalties ?  $scope.quiz.partialscore : $scope.quiz.userscore;

                    if(score === 0 || $scope.quiz.quizzscore === 0) {
                        $scope.percentage = 0;
                    } else {
                        $scope.percentage = parseInt(score / $scope.quiz.quizzscore * 10, 10) * 10;
                    }
                    $scope.class = 'performance-' + $scope.percentage;
                }
            };
        })

        .directive('thCropper', function () {
            return {
                //replace: true,
                //templateUrl: 'components/templates/quiz-performance.tpl.html',
                scope: {
                  onChange: '=?onChange'
                },
                link: function ($scope, $elem) {
                    $scope.$watch('onChange', function () {
                        //if (before !== after) {
                            $elem.cropper({
                                aspectRatio: 1,
                                modal: false
                            });
                        //}

                    });
                }
            };
        })

        .directive('thCodeView', function () {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    submission: '=?submission',
                    submissionList: '=?submissionList',
                    showTipContainer: '=?tip',
                    info: '=?info',
                    editor: '=?editor',
                    problem: '=?problem'
                },
                templateUrl: 'components/templates/code-view.tpl.html',

                link: function(scope) {
                    scope.lookForReevaluation = true;
                    scope.$on('$destroy', function() {
                        scope.lookForReevaluation = false;
                    });
                },

                controller: function ($scope, SubmissionService, SecurityService, ProblemService, apiURL, LanguageService, $state, $timeout, $http) {
                    $scope.editable = $state.is('problem-show.code-editor');
                    $scope.similarity = $state.is('quiz-show.similarity');
                    $scope.blobFile = '';

                    var codeLoaded = false;
                    var delay = (function () {
                        var timer = 0;
                        return function (callback, ms) {
                            clearTimeout(timer);
                            timer = setTimeout(callback, ms);
                        };
                    }());
                    if (!$scope.submission) {
                        $scope.submission = {};
                    }
                    $scope.loading = false;
                    $scope.loadingData = false;
                    $scope.changeSubmission = function (submission) {
                        $timeout(function () {
                            SubmissionService.get(submission.id).then(function (response) {
                                $scope.submission = response.data;
                            });
                        },0);


                    };
                    $scope.ie = false;
                    if (window.navigator.msSaveOrOpenBlob !== undefined) {
                        $scope.ie = true;
                    }

                    $scope.javaTemplate = 'public class HuxleyCode {\n' +
                    '  public static void main(String args[]) {\n' +
                    '    \n' +
                    '  }\n' +
                    '}';
                    $scope.updatingStatus = false;

                    $scope.updateStatus = function () {
                        if ($scope.submission.evaluation === 'WAITING' && !$scope.updatingStatus) {
                            $scope.updatingStatus = true;
                            SubmissionService.getEvaluation($scope.submission.id).then(function(response) {
                                $scope.updatingStatus = false;
                                if (response.data.evaluation === 'WAITING' && $scope.lookForReevaluation) {
                                    $timeout($scope.updateStatus, 7000);
                                } else {

                                    $scope.submission.evaluation = response.data.evaluation;

                                    SubmissionService.get($scope.submission.id).then(function(resp) {
                                        $scope.submission.testCaseEvaluations = resp.data.testCaseEvaluations;
                                    });

                                    if($scope.$parent.$parent.problem.currentUser.status !== 'CORRECT') {
                                        $scope.$parent.$parent.problem.currentUser.status = $scope.submission.evaluation;
                                    }
                                }
                            });

                        }
                    };
                    $scope.downloadCode = function () {
                        window.navigator.msSaveOrOpenBlob($scope.blobFile, $scope.submission.filename);
                    };

                    $scope.suggestLanguage = function (file) {
                        $scope.solutionFile = file[0];
                        var fileExtension = file[0].name.substring(file[0].name.indexOf('.') + 1).toLowerCase();
                        if (fileExtension === 'cpp') {
                            $scope.selectedLanguage = $scope.suggestLanguageMap.cpp;
                        } else if (fileExtension === 'pas') {
                            $scope.selectedLanguage = $scope.suggestLanguageMap.pascal;
                        } else if (fileExtension === 'm') {
                            $scope.selectedLanguage = $scope.suggestLanguageMap.octave;
                        } else if (fileExtension === 'py') {
                            if (parseInt($scope.selectedLanguage) !== 5 && parseInt($scope.selectedLanguage) !== 2) {
                                $scope.selectedLanguage = 5;
                            }

                        } else{
                            $scope.selectedLanguage = $scope.suggestLanguageMap[fileExtension];
                        }

                        var reader = new FileReader();
                        reader.onload = function(event) {
                            $scope.$apply(function() {
                                $scope.submission.code = event.target.result;
                            });
                        };
                        reader.readAsText($scope.solutionFile);
                    };

                    $scope.$watch('submission', function (submission, before) {
                        if (submission.id !== before.id) {
                            $scope.url = apiURL + '/submissions/' + $scope.submission.id + '/sourcecode';
                            if (submission.code === undefined) {
                                codeLoaded = false;
                                $scope.newCode = false;
                            }
                        }
                        if (submission.evaluation === 'WAITING' && !$scope.updatingStatus) {
                            $scope.updateStatus();
                        }
                        $timeout(function () {
                            if($scope.$parent.$parent.problem.currentUser && $scope.$parent.$parent.problem.currentUser.status !== 'CORRECT') {
                                $scope.$parent.$parent.problem.currentUser.status = $scope.submission.evaluation;
                            }
                        }, 200);
                        if(submission.id && !codeLoaded && submission.language !== undefined){
                            codeLoaded = true;
                            $scope.loading = true;
                            SubmissionService.getSubmissionCode($scope.submission.id).then(
                                function (response) {
                                    $scope.submission.code = response.data;
                                    $scope.updateMode($scope.submission.language.name);
                                    $scope.blob = new Blob([ $scope.submission.code ], { type : 'text/plain' });
                                    $scope.url = (window.URL || window.webkitURL).createObjectURL( $scope.blob );
                                    $scope.loading = false;
                                    $scope.hasCode = true;
                                    $scope.newCode = false;
                                },
                                function () {
                                    submission.code = 'Code Not Found';
                                    $scope.loading = false;
                                    $scope.hasCode = false;
                                    $scope.newCode = false;
                                });
                        } else {
                            if (submission.id === undefined) {
                                submission.code = '';
                                $scope.hasCode = false;
                                $scope.newCode = true;
                            }
                            if (before.id === submission.id && submission.code === undefined) {
                                submission.code = before.code;
                            }
                            $scope.loading = false;

                        }

                    });
                    $scope.$watch('submission.code', function () {
                        $scope.blobFile = new Blob([ $scope.submission.code ], { type : 'text/plain' });
                        $scope.url = (window.URL || window.webkitURL).createObjectURL( $scope.blobFile );

                    });
                    $scope.resetCode = function () {
                        var language = $scope.submission.language, problem = $scope.problem,
                            mode = $scope.submission.mode, code= '', filename = 'NewSubmission' + $scope.submission.language.extension;

                        $scope.submission = {
                            code: code,
                            language: language,
                            problem: problem,
                            filename: filename,
                            mode: mode
                        };

                        CodeStorage.updateLanguageCode(problem.id, language.id, null);

                        delay(function () {
                            $scope.submission.code = CodeStorage.getLanguageCode(problem.id, language.id);
                            if(mode === 'java') {
                                $scope.submission.filename = 'HuxleyCode.java';
                            }
                            $scope.$apply();
                        },200);

                    };
                    $scope.$watch('submissionList', function () {
                        if($scope.submissionList) {
                            if ($scope.submissionList !== undefined && $scope.submissionList.length !== 0){
                                if (!$scope.submission || !$scope.submission.id) {
                                    $scope.changeSubmission($scope.submissionList[0]);
                                }
                            }
                        }
                    });

                    $scope.aceLoaded = function(_editor){
                        _editor.$blockScrolling = 'Infinity';
                        _editor.getSession().on('change', _.throttle(function() {
                            CodeStorage.updateLanguageCode($scope.problem.id, $scope.submission.language.id, $scope.submission.code);
                        }, 1000, { leading: false }));

                    };
                    $scope.closeJavaDropdown = function () {
                        $scope.javaDropdown = !$scope.javaDropdown;
                    };

                    if ($scope.editor) {
                        $scope.availableLanguages = {};
                        $scope.compileParams = {};
                        $scope.suggestLanguageMap = {};
                        $scope.suggestLanguageMapById = {};
                        LanguageService.list().then(
                            function (response) {
                                var respLang = [], i;
                                respLang = response.data;
                                for (i = 0; i < respLang.length; i = i + 1) {
                                    $scope.availableLanguages[respLang[i].id] = respLang[i].name + ' (' + respLang[i].compiler + ')';
                                    $scope.suggestLanguageMap[respLang[i].name.toLowerCase()] = respLang[i].id;
                                    $scope.suggestLanguageMapById[respLang[i].id] = respLang[i];
                                    $scope.compileParams[respLang[i].id] = respLang[i].compileParams;
                                }

                                if ($scope.submission.language !== undefined) {
                                    $scope.selectedLanguage = $scope.submission.language.id.toString();
                                    $scope.updateModeById($scope.selectedLanguage);
                                }

                                if (!$scope.selectedLanguage) {
                                    $scope.selectedLanguage = '' + $scope.suggestLanguageMap.c;
                                    $scope.updateModeById($scope.selectedLanguage);
                                }
                            }
                        );
                    }
                    $scope.updateMode = function (languageName) {
                        $scope.javaDropdown = false;
                        $scope.submission.mode = 'c_cpp';
                        if (languageName === 'Java') {
                            $scope.submission.mode = 'java';
                            $scope.submission.filename = 'HuxleyCode.java';
                        } else if (languageName === 'Python') {
                            $scope.submission.mode = 'python';
                        } else if (languageName === 'Pascal') {
                            $scope.submission.mode = 'pascal';
                        } else if (languageName === 'Octave') {
                            $scope.submission.mode = 'matlab';
                        }
                    };

                    $scope.updateModeById = function (id) {
                        $scope.submission.code =CodeStorage.getLanguageCode($scope.problem.id, id);
                        $scope.submission.language = $scope.suggestLanguageMapById[id];
                        $scope.languageError = false;
                        if($scope.problem && $scope.problem.name && $scope.problem.name.indexOf(' ') === -1) {
                            $scope.submission.filename = $scope.problem.name;
                        } else if ($scope.problem.name) {
                            $scope.submission.filename = $scope.problem.name.substring(0, $scope.problem.name.indexOf(' '));
                        }
                        if($scope.submission.filename && $scope.submission.filename.indexOf('.') === -1) {
                            $scope.submission.filename = $scope.submission.filename + $scope.submission.language.extension;
                        } else if ($scope.submission.filename) {
                            $scope.submission.filename = $scope.submission.filename.substring(0, $scope.submission.filename.indexOf('.')) + $scope.submission.language.extension;
                        }
                        $scope.updateMode($scope.submission.language.name);
                    };
                    $scope.sendSolution = function () {
                        if($scope.submission.language === undefined) {
                            $scope.languageError = true;
                        } else {
                            var formData = new FormData(), code = $scope.submission.code;
                            formData.append('language', $scope.submission.language.id);
                            formData.append('file', $scope.blobFile, $scope.submission.filename);
                            $scope.languageError = false;
                            ProblemService.sendSolutionFile($scope.problem.id, formData).then(
                                function (response) {
                                    response.data.code = code;
                                    $scope.submission = response.data;
                                    codeLoaded = true;
                                    $scope.hasCode = true;
                                    $scope.newCode = false;
                                    //$state.go('problem-show.submission-show', {subId : $scope.submission.id});
                                }
                            );
                        }
                    };
                    $scope.waitingAnswerRunCode = false;
                    $scope.run = {};
                    $scope.runCode = function () {
                        if($scope.submission.language === undefined) {
                            $scope.languageError = true;
                            $scope.waitingAnswerRunCode = false;
                        } else {
                            var formData = {language : $scope.submission.language.id, code : $scope.submission.code};
                            $scope.canHelp = formData.language === 2 || formData.language === 5;
                            $scope.selectedOption = $scope.submission.language;
                            $scope.languageError = false;
                            $scope.waitingAnswerRunCode = true;

                            if ($scope.run.customizedInput === true) {
                                formData.input = $scope.run.input;
                            }
                            ProblemService.runCode($scope.problem.id, formData).then(function (response) {
                                $scope.hash = response.data.hash;
                                $scope.updateStatusRunCode();
                            }, function () {
                                $scope.waitingAnswerRunCode = false;
                                $scope.error = true;
                            });
                        }
                    };
                    $scope.updateStatusRunCode = function () {
                        ProblemService.getCodeResult($scope.problem.id, $scope.hash, true).then(function(response) {
                            if (response.data.status === 'PENDING') {
                                $timeout($scope.updateStatusRunCode, 3000);
                            } else {
                                if ($scope.run.customizedInput !== true) {
                                    ProblemService.getExamples($scope.problem.id, {max: 10}).then(
                                        function (response) {
                                            $scope.run.input = response.data.sort(function(a, b) { return a.id - b.id ; })[0].input;
                                        }
                                    );
                                }
                                var answer = response.data;

                                $scope.runError = answer.startsWith('!#ERROR:');

                                if ($scope.runError) {
                                    answer =  answer.substring(8);
                                    SecurityService.requestCurrentUser().then(function(user) {
                                        if (user && user.getLocale() && user.getLocale().startsWith('pt')) {
                                            if ($scope.canHelp) {
                                                pythonTrans();
                                            }
                                        }
                                    });
                                }

                                $scope.output = answer;
                                $scope.waitingAnswerRunCode = false;
                            }
                        }, function () {
                            $timeout($scope.updateStatusRunCode, 3000);
                        });
                    };

                    var pythonTrans = function() {
                        $http({
                            method: 'POST',
                            url: apiURL + '/problems/exception',
                            data: {
                                errorMessage: $scope.output
                            }
                        }).then(function(resp) {
                            $scope.output = resp.data.message +'\nSaída original:\n' + $scope.output ;
                        }, function() {
                            $scope.friendly = false;
                            $scope.noMessage = true;
                        });
                    };
                }
            };
        })

        .directive('ngEnter', function () {
            return function (scope, element, attrs) {
                element.bind('keydown keypress', function (event) {
                    if(event.which === 13) {
                        scope.$apply(function (){
                            scope.$eval(attrs.ngEnter);
                        });

                        event.preventDefault();
                    }
                });
            };
        })

        .directive('thDiff', function () {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'components/templates/diff.tpl.html',
                scope: {
                    diff: '=?diff'
                },
                link: function (scope) {
                    scope.$watch('diff', function() {
                        if (scope.diff) {
                            scope.lineExpected = [];
                            scope.lineReceived = [];
                            var diff = JSON.parse(scope.diff);
                            var nextLine = 1, i = 0, expectedLine = '', actualLine = '';
                            if (diff && typeof diff === 'string') {
                                diff = diff.replace('<th width="45%" class="diff-legend-header legend">', '<th width="50%" class="solution-title-default diff-legend-header"><i class="icon img-short img-short-output background-img"></i>');
                                diff = diff.replace('<th width="45%" class="diff-legend-header legend">', '<th width="50%" class="solution-title-default diff-legend-header"><i class="icon img-short img-short-output-not-correct background-img"></i>');
                                diff = diff.replace(/<strong>|<big>|<\/strong>|<\/big>/g, '');
                                if (diff.indexOf('<div class="legend-box">') !== -1) {
                                    diff = diff.substring(0, diff.indexOf('<div class="legend-box">'));
                                }
                                scope.brokenLines = diff.match(/<td class=\"modified\">.*?<\/td>|<td class=\"normal\">.*?<\/td>|<td class=\"removed\">.*?<\/td>|<td class=\"added\">.*?<\/td>/g);

                                _.each(scope.brokenLines, function (line, index) {
                                    var cssClass = line.match(/<td class=\".*?\">/)[0].replace('<td class=\"','').replace('\">','');
                                    line = line.replace(/<td class=\"modified\">|<td class=\"normal\">|<td class=\"removed\">|<td class=\"added\">|<\/td>/g, '');
                                    if(index % 2 === 0) {
                                        scope.lineExpected.push({class: cssClass, line: line});
                                    } else {
                                        scope.lineReceived.push({class: cssClass, line: line});
                                    }
                                });
                            } else if (diff) {
                                scope.newDiff = true;
                                scope.lineCount = [];
                                if(diff.diffs) {
                                    _.each(diff.diffs, function (line) {
                                        expectedLine = '';
                                        actualLine = '';
                                        for (i = 0; i < line.expectedLine.length || i < line.actualLine.length; i++) {

                                            if (line.expectedLine[i] === line.actualLine[i] && line.actualLine[i] && line.expectedLine[i]) {
                                                expectedLine += line.expectedLine[i];
                                                actualLine += line.actualLine[i];
                                            } else if (line.expectedLine[i] !== line.actualLine[i] && line.actualLine[i] && line.expectedLine[i]) {
                                                expectedLine += line.expectedLine[i];
                                                actualLine += '<u>' + line.actualLine[i] + '</u>';
                                            } else if (line.expectedLine[i]) {
                                                expectedLine += line.expectedLine[i];
                                            } else if (line.actualLine[i]) {
                                                actualLine += '<u>' + line.actualLine[i] + '</u>';
                                            }

                                        }
                                        if (actualLine.length === 0) {
                                            actualLine += '&nbsp';
                                        }
                                        if (expectedLine.length === 0) {
                                            expectedLine += '&nbsp';
                                        }

                                        if (nextLine !== parseInt(line.lineNumber)) {
                                            var lineCount = nextLine;
                                            scope.lineExpected.push({class: 'diff-expected truncated', line: '...'});
                                            scope.lineReceived.push({class: 'diff-expected truncated', line: '...'});
                                            if (parseInt(line.lineNumber) - nextLine === 1) {
                                                lineCount = parseInt(line.lineNumber) - 1;
                                            } else if (parseInt(line.lineNumber) - nextLine > 1) {
                                                lineCount += '...' + (parseInt(line.lineNumber) - 1);
                                            }
                                            scope.lineCount.push(lineCount);
                                        }
                                        scope.lineCount.push(line.lineNumber);


                                        scope.lineExpected.push({class: 'diff-expected', line: expectedLine});
                                        scope.lineReceived.push({class: 'diff-actual', line: actualLine});
                                        nextLine = line.lineNumber + 1;
                                    });
                                    if (diff.totalLines && parseInt(diff.totalLines) > nextLine) {
                                        scope.lineCount.push(nextLine + '...' + diff.totalLines);
                                        scope.lineExpected.push({class: 'diff-expected truncated', line: '...'});
                                        scope.lineReceived.push({class: 'diff-expected truncated', line: '...'});
                                    } else if (diff.totalLines && parseInt(diff.totalLines) === nextLine) {
                                        scope.lineCount.push(nextLine);
                                        scope.lineExpected.push({class: 'diff-expected truncated', line: '...'});
                                        scope.lineReceived.push({class: 'diff-expected truncated', line: '...'});
                                    }
                                } else if(diff.lines) {
                                    scope.newDiff = true;
                                    scope.lineCount = [];
                                    _.each(diff.lines, function (line) {
                                        expectedLine = '';
                                        actualLine = '';
                                        for (i = 0; i < line.expected.length || i < line.actual.length; i++) {

                                            if (line.expected[i] === line.actual[i] && line.actual[i] && line.expected[i]) {
                                                expectedLine += line.expected[i];
                                                actualLine += line.actual[i];
                                            } else if (line.expected[i] !== line.actual[i] && line.actual[i] && line.expected[i]) {
                                                expectedLine += line.expected[i];
                                                actualLine += '<u>' + line.actual[i] + '</u>';
                                            } else if (line.expected[i]) {
                                                expectedLine += line.expected[i];
                                            } else if (line.actual[i]) {
                                                actualLine += '<u>' + line.actual[i] + '</u>';
                                            }

                                        }
                                        if (actualLine.length === 0) {
                                            actualLine += '&nbsp';
                                        }
                                        if (expectedLine.length === 0) {
                                            expectedLine += '&nbsp';
                                        }

                                        if (nextLine !== parseInt(line.number)) {
                                            var lineCount = nextLine;
                                            scope.lineExpected.push({class: 'diff-expected truncated', line: '...'});
                                            scope.lineReceived.push({class: 'diff-expected truncated', line: '...'});
                                            if (parseInt(line.number) - nextLine === 1) {
                                                lineCount = parseInt(line.number) - 1;
                                            } else if (parseInt(line.number) - nextLine > 1) {
                                                lineCount += '...' + (parseInt(line.number) - 1);
                                            }
                                            scope.lineCount.push(lineCount);
                                        }
                                        scope.lineCount.push(line.number);


                                        scope.lineExpected.push({class: 'diff-expected', line: expectedLine});
                                        scope.lineReceived.push({class: 'diff-actual', line: actualLine});
                                        nextLine = line.number + 1;
                                    });
                                    if (diff.totalLines && parseInt(diff.totalLines) > nextLine) {
                                        scope.lineCount.push(nextLine + '...' + diff.totalLines);
                                        scope.lineExpected.push({class: 'diff-expected truncated', line: '...'});
                                        scope.lineReceived.push({class: 'diff-expected truncated', line: '...'});
                                    } else if (diff.totalLines && parseInt(diff.totalLines) === nextLine) {
                                        scope.lineCount.push(nextLine);
                                        scope.lineExpected.push({class: 'diff-expected truncated', line: '...'});
                                        scope.lineReceived.push({class: 'diff-expected truncated', line: '...'});
                                    }
                                }
                            }
                        }
                    });


                }
            };
        })

        .directive('thEvaluationOutput', function () {
            return {
                restrict: 'EA',
                replace: true,
                template: '<div style="margin-top: 11px">' +
                '<div class="evaluation-output" ng-if="!friendly">{{ message }}</div> ' +
                '<div class="evaluation-output" ng-if="friendly">{{ betterMessage }}</div> ' +
                '<a href="#" ng-click="toggleFriendly()" ng-if="canHelp">' +
                '<span ng-if="!friendly" translate>Ver saída amigavel</span>' +
                '<span ng-if="friendly" translate>Ver saída original</span>' +
                '</a>' +
                '</div>',
                scope: {
                    message: '=?message',
                    language: '=?language',
                },
                controller: function($scope, $http, apiURL) {
                    $scope.canHelp = $scope.language === 2 || $scope.language === 5;
                    $scope.friendly = false;

                    $scope.toggleFriendly = function() {
                        if (!$scope.betterMessage && !$scope.noMessage) {
                            pythonTrans();
                        }

                        $scope.friendly = !$scope.friendly;
                    };

                    var pythonTrans = function() {
                        $http({
                            method: 'POST',
                            url: apiURL + '/problems/exception',
                            data: {
                                errorMessage: $scope.message
                            }
                        }).then(function(resp) {
                            $scope.betterMessage = resp.data.message;
                        }, function() {
                            $scope.friendly = false;
                            $scope.noMessage = true;
                        });
                    };
                }
            };
        })

        .directive('thLoading', function () {
            return {
                restrict: 'EA',
                replace: true,
                transclude:true,
                template:'<div class="loading-container">' +
                    '<div class="img-loading" ng-if="loading === true || loading === \'building\'"></div>' +
                    '<ng-transclude ng-if="loading === false"></ng-transclude>' +
                    '<div class="img-loading-fail" ng-if="loading === \'fail\'"></div>' +
                    '<div class="loading-msg text-center">' +
                        '<span ng-if="loading === \'fail\'">{{\'component.loading.error\' | translate}}</span>' +
                        '<span ng-if="loading === \'building\'">{{\'component.loading.building\' | translate}}</span>' +
                        '<span ng-if="loading === true">{{\'component.loading.loading\' | translate}}</span>' +
                    '</div>' +

                '</div>',
                scope: {
                    loading: '=?loading'
                }
            };
        })

        .directive('thImageUploader', function () {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'components/templates/file-uploader.tpl.html',
                controller: function ($scope, FileUploader, apiURL, SecurityService) {
                    $scope.uploader = new FileUploader({url: apiURL + '/problems/image',
                        withCredentials : true,
                    headers: {Authorization: SecurityService.requestToken()}});
                    $scope.uploader.onSuccessItem = function (item, response) {
                            item.responseLink = apiURL + '/problems/image/' + response.name;
                    };
                }
            };
        })
        //From: http://stackoverflow.com/questions/24628410/how-can-i-trigger-the-click-event-of-another-element-in-ng-click-using-angularjs
        .directive('uploadFile', function () {
            return {
                restrict: 'A',
                link: function(scope, element) {
                    element.bind('click', function(e) {
                        angular.element(e.target).siblings('.file-uploader-input').trigger('click');
                    });
                }
            };
        })

        .directive('datepickerPopup', function (dateFilter, datepickerPopupConfig) {
            return {
                restrict: 'A',
                priority: 1,
                require: 'ngModel',
                link: function(scope, element, attr, ngModel) {
                    var dateFormat = attr.datepickerPopup || datepickerPopupConfig.datepickerPopup;
                    ngModel.$formatters.push(function (value) {
                        return dateFilter(value, dateFormat);
                    });
                }
            };
        })

        .directive('thShowCase', function () {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: 'components/templates/show-case.tpl.html',
                transclude: true,
                scope: {
                    title: '=?info'
                }

            };
        })

        .directive('thShowCaseBody', function () {
            return {
                restrict: 'EA',
                replace: true,
                template: '<div class="show-case-body scrollable" ng-transclude></div>',
                transclude: true
            };
        })
        .directive('thShowCaseHeader', function () {
            return {
                restrict: 'EA',
                replace: true,
                template: '<div class="show-case-header" ng-transclude></div>',
                transclude: true
            };
        })
        .directive('thProgress', function (ProblemService, SubmissionService, FileSaver) {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'components/templates/progress.tpl.html',
                scope: {
                    testCaseEvaluations: '=testCaseEvaluations',
                    language: '=language',
                    submission: '=submission',
                },
                link: function (scope) {
                    _.each(scope.testCaseEvaluations, function (testCaseEvaluation) {
                        testCaseEvaluation.show = false;
                        if (testCaseEvaluation.evaluation === 'WAITING') {
                            testCaseEvaluation.class = 'img-medium-submission-waiting';
                            testCaseEvaluation.msg = 'submission.status.waiting';
                        } else if (testCaseEvaluation.evaluation === 0 || testCaseEvaluation.evaluation === 'CORRECT') {
                            testCaseEvaluation.class = 'img-medium-submission-correct';
                            testCaseEvaluation.msg = 'submission.status.correct';
                        } else if (testCaseEvaluation.evaluation === 1 || testCaseEvaluation.evaluation === 'WRONG_ANSWER') {
                            testCaseEvaluation.class = 'img-medium-submission-wrong-answer';
                            testCaseEvaluation.msg = 'submission.status.wrongAnswer';
                        } else if (testCaseEvaluation.evaluation === 2 || testCaseEvaluation.evaluation === 'RUNTIME_ERROR') {
                            testCaseEvaluation.class = 'img-medium-submission-runtime-error';
                            testCaseEvaluation.msg = 'submission.status.runtimeError';
                        } else if (testCaseEvaluation.evaluation === 3 || testCaseEvaluation.evaluation === 'COMPILATION_ERROR') {
                            testCaseEvaluation.class = 'img-medium-submission-compilation-error';
                            testCaseEvaluation.msg = 'submission.status.compilationError';
                        } else if (testCaseEvaluation.evaluation === 4 || testCaseEvaluation.evaluation === 'EMPTY_ANSWER') {
                            testCaseEvaluation.class = 'img-medium-submission-empty-answer';
                            testCaseEvaluation.msg = 'submission.status.emptyAnswer';
                        } else if (testCaseEvaluation.evaluation === 5 || testCaseEvaluation.evaluation === 'TIME_LIMIT_EXCEEDED') {
                            testCaseEvaluation.class = 'img-medium-submission-time-limit-exceeded';
                            testCaseEvaluation.msg = 'submission.status.timeLimitExceeded';
                        } else if (testCaseEvaluation.evaluation === 6 || testCaseEvaluation.evaluation === 'WAITING') {
                            testCaseEvaluation.class = 'img-medium-submission-waiting';
                            testCaseEvaluation.msg = 'submission.status.waiting';
                        } else if (testCaseEvaluation.evaluation === 7 || testCaseEvaluation.evaluation === 'EMPTY_TEST_CASE') {
                            testCaseEvaluation.class = 'img-medium-submission-empty-test-case';
                            testCaseEvaluation.msg = 'submission.status.emptyTestCase';
                            testCaseEvaluation.backgroundImg = '  new-submission-img';
                        } else if (testCaseEvaluation.evaluation === 8 || testCaseEvaluation.evaluation === 'WRONG_FILE_NAME') {
                            testCaseEvaluation.class = 'img-medium-submission-wrong-file-name';
                            testCaseEvaluation.msg = 'submission.status.wrongFileName';
                            testCaseEvaluation.backgroundImg = '  new-submission-img';
                        } else if (testCaseEvaluation.evaluation === 9 || testCaseEvaluation.evaluation === 'PRESENTATION_ERROR') {
                            testCaseEvaluation.class = 'img-medium-submission-presentation-error';
                            testCaseEvaluation.msg = 'submission.status.presentationError';
                            testCaseEvaluation.backgroundImg = '  new-submission-img';
                        } else if (testCaseEvaluation.evaluation === 10 || testCaseEvaluation.evaluation === 'HUXLEY_ERROR') {
                            testCaseEvaluation.class = 'img-medium-submission-huxley-error';
                            testCaseEvaluation.msg = 'submission.status.huxleyError';
                            testCaseEvaluation.backgroundImg = '  new-submission-img';
                        }
                    });

                    scope.showTip = false;

                    scope.showTestCaseEvaluation = function(testCaseId) {
                        scope.showTip = false;
                        _.each(scope.testCaseEvaluations, function (testCaseEvaluation) {
                            if (testCaseEvaluation.testCaseId === testCaseId) {
                                if (testCaseEvaluation.show) {
                                    testCaseEvaluation.show = false;
                                } else {
                                    testCaseEvaluation.show = true;
                                }
                            } else {
                                testCaseEvaluation.show = false;
                            }
                        });
                    };

                    scope.downloadTestCase = function (id) {
                        SubmissionService.getTestCase(scope.submission.id, id, true).then(function(response) {
                            var blob = new Blob([response.data], {
                                type: 'application/zip;charset=utf-8'
                            });
                            FileSaver.saveAs(blob, id + '.zip');
                        });
                    };

                    scope.viewTip = function() {
                        scope.showTip = !scope.showTip;
                    };

                    scope.hasVoted = false;
                    scope.vote = function (testCaseId, vote) {
                        scope.voteError = false;
                        ProblemService.vote(testCaseId, {useful: vote}).then(function () {
                            scope.hasVoted = true;
                        }, function () {
                            scope.voteError = true;
                        });
                    };

                }

            };
        })
        .directive('thSubmissionLink', function ($interpolate, SubmissionService, $state) {
            return {
                restrict: 'A',
                link: function (scope, element) {
                    var replaceSubId = function(data) {
                        var idPattern = /#\d+/g, subIds = [];
                        _.each(data.match(idPattern), function (subId) {
                            if(subIds.indexOf(subId) === -1) {
                                subIds.push(subId);
                            }
                        });
                        _.each(subIds, function (subId) {
                            var id = subId.replace('#', ''), regExp = new RegExp(subId, 'g');
                            SubmissionService.get(id).then ( function (response) {
                                var submission = response.data, aux;
                                aux = '<a href="' + $state.href('problem-show.submission-show', {id: submission.problem.id, subId: submission.id}) + '">' + subId + '</a>';
                                data = data.replace(regExp, aux);
                                element.html(data);
                            });
                        });

                    };
                    var replaceUserId = function(data) {
                        var idPattern = /@\d+/g;

                        _.each(data.match(idPattern), function (userId) {
                            var id = userId.replace('@', ''), regExp = new RegExp(userId, 'g');
                            SubmissionService.get(id).then ( function (response) {
                                var submission = response.data, aux;
                                aux = '<a href="' + $state.href('profile-show.problems', {id: submission.user.id}) + '">' + userId + '</a>';
                                data = data.replace(regExp, aux);
                                element.html(data);
                            });
                        });

                    };
                    replaceSubId($interpolate(element.text())(scope));
                    replaceUserId($interpolate(element.text())(scope));
                }
            };
        })

    /**
     * The ng-thumb directive
     * @author: nerv
     * @version: 0.1.2, 2014-01-09
     * from: https://github.com/nervgh/angular-file-upload/blob/d744768da615ab7269935efceb1227473c08ec23/examples/image-preview/directives.js
     */
        .directive('ngThumb', function($window) {
            var helper = {
                support: !!($window.FileReader && $window.CanvasRenderingContext2D),
                isFile: function(item) {
                    return angular.isObject(item) && item instanceof $window.File;
                },
                isImage: function(file) {
                    var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                    return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                }
            };

            return {
                restrict: 'A',
                template: '<canvas/>',
                link: function(scope, element, attributes) {
                    if (!helper.support) {
                        return;
                    }

                    var params = scope.$eval(attributes.ngThumb);

                    if (!helper.isFile(params.file)) {
                        return;
                    }
                    if (!helper.isImage(params.file)) {
                        return;
                    }

                    function onLoadFile(event) {
                        var img = new Image();
                        img.onload = onLoadImage;
                        img.src = event.target.result;
                    }

                    var canvas = element.find('canvas');
                    var reader = new FileReader();

                    reader.onload = onLoadFile;
                    reader.readAsDataURL(params.file);



                    function onLoadImage() {
                        var width = params.width || this.width / this.height * params.height;// jshint ignore:line
                        var height = params.height || this.height / this.width * params.width;// jshint ignore:line
                        canvas.attr({ width: width, height: height });// jshint ignore:line
                        canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);// jshint ignore:line
                    }
                }
            };
        })
        .directive('thTimeDifference', function() {
        return {
            restrict: 'AE',
            template: '{{difference}}',
            scope: {
                date: '=?date',
                serverDate: '=?serverDate'

            },
            controller: function ($scope, $timeout) {
                var date = moment(_.clone($scope.date, true));

                $scope.serverDate = moment($scope.serverDate);
                $scope.difference = date.from($scope.serverDate);
                $scope.$watch('date', function (after) {
                    if (moment(after) !== date) {
                        date = moment(_.clone(after, true));
                        $scope.serverDate = moment($scope.serverDate);
                    }
                });
                $scope.updateDifference = function () {
                    $scope.serverDate.add(1, 's');

                    $timeout(function() {
                        $scope.difference = date.from($scope.serverDate);
                        $scope.updateDifference();
                    }, 1000);
                };
                $scope.updateDifference();
            }
        };
    })
    .directive('thInfinitePagination', function($window, $timeout) {
        return {
            restrict: 'E',
            template: '<div>' +
            '<div ng-if="loading === true" class="text-center"><i class="img-medium img-medium-submission-waiting  background-img icon img-bottom"></i></div>' +
            '<div ng-if="hasMore === true && loading === false && hasError === false" class="text-center"><a ng-click="emitEvent()" translate>component.infinitePagination.hasMore</a></div>' +
            '<div ng-if="hasMore === true && loading === false && hasError === true" class="text-center">' +
            '<i class="img-medium img-medium-submission-wrong-answer  background-img icon img-bottom"></i><a ng-click="emitEvent()" translate>component.infinitePagination.hasError</a>' +
            '<span ng-if="errorCounter === 1">({{"component.infinitePagination.tryingAgain" | translate}} {{counterToRetry}}s)</span>' +
            '</div>' +
            '</div>',
            scope: {
                loading: '=?loading',
                eventId: '=?eventId',
                hasMore: '=?hasMore',
                hasError: '=?hasError'

            },
            link: function (scope) {
                /*var elm = element[0];

                element.bind('scroll', function () {
                    if (elm.scrollTop + elm.offsetHeight > elm.scrollHeight) { //at the bottom
                        console.log('Load mf!');
                    }
                });*/
                scope.tryingAgain = false;
                scope.errorCounter = 0;
                scope.emitEvent = function () {
                    scope.$emit(scope.eventId);
                };
                scope.$watch('hasError', function (after) {
                   if (after) {
                       scope.errorCounter = scope.errorCounter + 1;
                   } else {
                       scope.errorCounter = 0;
                   }
                });

                scope.$watch('errorCounter', function (after) {
                    if (after === 1) {
                        scope.retry();
                    }
                });

                scope.counterToRetry = undefined;
                scope.retry = function () {
                    if (scope.counterToRetry === 0 && !scope.loading) {
                        scope.counterToRetry = undefined;
                        scope.emitEvent();
                        scope.errorCounter = scope.errorCounter + 1;
                    } else if (!scope.counterToRetry){
                        scope.counterToRetry = 5;
                        $timeout(scope.retry, 1000);
                    } else {
                        scope.counterToRetry = scope.counterToRetry - 1;
                        $timeout(scope.retry, 1000);
                    }
                };

                angular.element($window).bind('scroll', function() {
                    var windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
                    var body = document.body, html = document.documentElement;
                    var docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight,  html.scrollHeight, html.offsetHeight);
                    var windowBottom = windowHeight + window.pageYOffset;
                    if (windowBottom >= docHeight && scope.hasMore) {
                        scope.emitEvent();
                    }

                });
            }
        };
    })
        .directive('thCopy', function () {
            return {
                restrict: 'E',
                templateUrl: 'components/templates/th-copy.tpl.html',
                scope: {
                    'target': '=?target',
                    'text': '=?text'
                },
                controller: function ($scope) {

                    $('button').popover({
                        trigger: 'click',
                        placement: 'top'
                    });

                    function setTooltip(btn, message) {
                        $(btn).popover('hide')
                            .attr('data-content', message)
                            .popover('show');
                    }

                    function hideTooltip(btn) {
                        setTimeout(function() {
                            $(btn).popover('hide');
                        }, 1000);
                    }

                    $scope.onSuccess = function(e) {
                        setTooltip(e.trigger, 'Copiado!');
                        hideTooltip(e.trigger);
                        e.clearSelection();
                    };

                    $scope.onError = function(e) {
                        setTooltip(e.trigger, 'Pressione ctrl+c para copiar!');
                        hideTooltip(e.trigger);
                    };
                }
            };
        })
        .directive('thCompleteCode', function () {
            return {
                restrict: 'E',
                templateUrl: 'components/templates/complete-code.tpl.html',
                scope: {
                    'problem': '=problem'
                },
                controller: function ($timeout, $scope, LanguageService, $translate) {
                    $scope.availableLanguages = {};
                    var defaultText = '';
                    $scope.comment = '//';
                    LanguageService.list().then(
                        function (response) {
                            var respLang = [], i;
                            respLang = response.data;
                            for (i = 0; i < respLang.length; i = i + 1) {
                                $scope.availableLanguages[respLang[i].id] = respLang[i].name;
                            }
                            if(!$scope.problem.id) {
                                $scope.updateModeById(1);
                                $scope.selectedLanguage = 1;
                            } else {
                                $scope.updateModeById($scope.problem.baseLanguage.id);
                                $scope.selectedLanguage = $scope.problem.baseLanguage.id;
                            }
                        }
                    );

                    $scope.updateModeById = function (id) {
                        $scope.problem.baseLanguage = {
                            id: id
                        };
                        $scope.updateMode($scope.availableLanguages[id]);
                    };

                    $scope.updateMode = function (languageName) {
                        $scope.options.mode = 'text/x-c++src';
                        $scope.comment = '//';
                        if (languageName === 'Java') {
                            $scope.options.mode = 'text/x-java';
                        } else if (languageName === 'Python') {
                            $scope.comment = '#';
                            $scope.options.mode = 'text/x-python';
                        } else if (languageName === 'Python3.2') {
                            $scope.comment = '#';
                            $scope.options.mode = 'text/x-python';
                        }else if (languageName === 'Pascal') {
                            $scope.options.mode = 'text/x-pascal';
                        } else if (languageName === 'Octave') {
                            $scope.comment = '#';
                            $scope.options.mode = 'text/x-octave';
                        }
                    };

                    $scope.options = {
                        mode: 'text/x-c++src',
                        lineNumbers: true,
                        lineWrapping: true,
                        gutters: ['CodeMirror-linenumbers', 'breakpoints']
                    };
                    var defaultComment = '';
                    $translate('problem.insertCodeHere').then(function (translated) {
                        defaultComment = $scope.comment + translated;
                    });

                    $timeout(function () {
                        var editor = $('#editor')[0].childNodes[0].CodeMirror;

                        function makeMarker() {
                            var marker = document.createElement('div');
                            marker.style.color = '#822';
                            marker.innerHTML = '●';
                            return marker;
                        }

                        editor.on('mousedown', function () {
                            if($scope.problem.baseCode === defaultText) {
                                $scope.problem.baseCode = '';
                                $scope.$apply();
                            }
                        });

                        editor.on('gutterClick', function(cm, n) {
                            var info = cm.lineInfo(n);
                            var line = info.line;
                            if(info.gutterMarkers) {
                                var index = $scope.problem.blankLines.indexOf(info.line);
                                $scope.problem.blankLines.splice(index, 1);
                                editor.replaceRange('', {line: line, ch: 0}, {line: line, ch: 1000});
                            } else {
                                $scope.problem.blankLines.push(info.line);
                                editor.replaceRange(defaultComment, {line: line, ch: 0}, {line: line, ch: 1000});
                            }
                            cm.setGutterMarker(n, 'breakpoints', info.gutterMarkers ? null : makeMarker());
                        });

                        editor.on('changes',function(cm) {
                            var lines = [];
                            for (var i = 0; i < cm.doc.lineCount(); i++) {
                                var gm = cm.lineInfo(i).gutterMarkers;
                                if (gm && gm.breakpoints) {
                                    lines.push(i);
                                }
                            }

                            $scope.problem.blankLines = lines;

                        });

                        $scope.selectLine = function () {
                            var line = editor.getCursor().line;
                            var info = editor.lineInfo(line);
                            if(info.gutterMarkers) {
                                var index = $scope.problem.blankLines.indexOf(info.line);
                                $scope.problem.blankLines.splice(index, 1);
                                editor.replaceRange('', {line: line, ch: 0}, {line: line, ch: 1000});
                            } else {
                                $scope.problem.blankLines.push(info.line);
                                editor.replaceRange(defaultComment, {line: line, ch: 0}, {line: line, ch: 1000});
                            }
                            editor.setGutterMarker(line, 'breakpoints', info.gutterMarkers ? null : makeMarker());
                        };

                        if(!$scope.problem.id) {
                            $translate('problem.create.codeBase').then( function (translation) {
                                defaultText = translation;
                                $scope.problem.baseCode = translation;
                            });
                        } else {
                            $scope.problem.blankLines.forEach(function (it) {
                                editor.replaceRange(defaultComment, {line: it, ch: 0}, {line: it, ch: 1000});
                                editor.setGutterMarker(it, 'breakpoints', makeMarker());
                            });
                        }

                    }, 1000);

                }
            };
        });

    var languagesTemplates = {
        1: '#include <stdio.h>\n' +
        '#include <string.h>\n' +
        '#include <math.h>\n' +
        '#include <stdlib.h>\n\n' +
        'int main() {\n' +
        '\treturn 0;\n' +
        '}',

        6: 'import java.io.*;\nimport java.util.*;\n\n' +
        'public class HuxleyCode {\n' +
        '  public static void main(String args[]) {\n' +
        '    \n' +
        '  }\n' +
        '}',

        4: '#include <cstdio>\n' +
        'using namespace std;\n\n' +
        'int main() {\n' +
        '\treturn 0;\n' +
        '}'
    };

    var CodeStorage = {

        updateLanguageCode: function(problem, language, code) {
            var key = problem + '#' + language;
            if (!code) {
                sessionStorage.removeItem(key);
            } else {
                sessionStorage.setItem(key, code);
            }
        },

        getLanguageCode: function(problem, language) {
            var code;
            if (sessionStorage) {
                code  = sessionStorage.getItem(problem + '#' + language);
            }

            if (!code) {
                code = languagesTemplates[language];
            }

            return code;
        }

    };

}(require, angular));
