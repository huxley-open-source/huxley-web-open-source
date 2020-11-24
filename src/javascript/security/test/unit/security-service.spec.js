/*global require, describe, it, iit, expect, afterEach, beforeEach, module, inject, $, dump, jasmine, angular*/

require('../../security-module');
require('../../../main/config-module');
require('angular-mocks');

describe('Tests for SecurityService', function () {
    'use strict';

    var SecurityServiceMock, $httpBackend, windowLocationReloadSpy, routeReloadSpy, apiURL;

    beforeEach(function () {

        windowLocationReloadSpy = jasmine.createSpy();
        routeReloadSpy = jasmine.createSpy();

        angular.mock.module('thehuxley.security');
        angular.mock.module('thehuxley.config');

        angular.mock.module(['$provide', function ($provide) {
            $provide.value('$route', { reload: routeReloadSpy });
        }]);

        angular.mock.module(['$provide', function ($provide) {
            $provide.value('$window',  { location: { reload: windowLocationReloadSpy } });
        }]);

        inject(['$injector', function ($injector) {
            apiURL = $injector.get('apiURL');
            SecurityServiceMock = $injector.get('SecurityService');
            $httpBackend = $injector.get('$httpBackend');
        }]);

        $httpBackend.when('GET', apiURL + '/user').respond(200, {
            username: 'aldohuxley',
            roles: [
                { id: 3, authority: 'ROLE_TEACHER' }
            ]
        });

    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('test without a logged user', function () {
        beforeEach(function () {
            $httpBackend.expectGET(apiURL + '/user').respond(401);
        });

        it('when call requestCurrentUser function without failOnError, should return object without user`s data', function () {
            SecurityServiceMock.requestCurrentUser().then(function (user) {
                expect(user).toBeDefined();
                expect(user.username).not.toBeDefined();
                expect(user.isAuthenticated()).toBe(false);
            });

            $httpBackend.flush();
        });

        it('when call requestCurrentUser function with failOnError as true, promise reject function should be call', function () {
            var acceptFunctionSpy = jasmine.createSpy(),
                rejectFunctionSpy = jasmine.createSpy();

            SecurityServiceMock.requestCurrentUser(true).then(acceptFunctionSpy, rejectFunctionSpy);

            $httpBackend.flush();

            expect(rejectFunctionSpy.calls.count()).toEqual(1);
            expect(acceptFunctionSpy.calls.count()).toEqual(0);

        });

        it('when call getCurrentUser should return an object without user`s data', function () {
            SecurityServiceMock.requestCurrentUser();
            $httpBackend.flush();

            var currentUser = SecurityServiceMock.getCurrentUser();

            expect(currentUser.username).not.toBeDefined();
            expect(currentUser.roles).not.toBeDefined();
            expect(currentUser.isAuthenticated()).toBe(false);
        });

    });

    it('when call requestCurrentUser function should return the data of the user logged', function () {
        SecurityServiceMock.requestCurrentUser().then(function (user) {
            expect(user).toBeDefined();
            expect(user.username).toEqual('aldohuxley');
            expect(user.roles).toBeDefined();
            expect(user.roles.length).toEqual(1);
            expect(user.isAuthenticated()).toBe(true);
        });

        $httpBackend.flush();
    });

    it('when call the login function successfully should call $route.reload function', function () {
        $httpBackend.expectPOST(apiURL + '/login', 'username=aldohuxley&password=secret', function (headers) {
            return headers['Content-Type'] === 'application/x-www-form-urlencoded';
        }).respond(200);

        $httpBackend.expectGET(apiURL + '/user').respond(200, {
            username: 'aldohuxley',
            roles: [
                { id: 3, authority: 'ROLE_TEACHER' }
            ]
        });

        var rejectFunctionSpy = jasmine.createSpy(),
            acceptFunctionSpy = jasmine.createSpy();

        SecurityServiceMock.login({ username: 'aldohuxley', password: 'secret' }).then(acceptFunctionSpy, rejectFunctionSpy);

        $httpBackend.flush();

        expect(SecurityServiceMock.getCurrentUser().isAuthenticated()).toBe(true);
        expect(acceptFunctionSpy.calls.count()).toEqual(1);
        expect(rejectFunctionSpy.calls.count()).toEqual(0);
        expect(routeReloadSpy.calls.count()).toEqual(0);
    });

    describe('tests with user logged in', function () {

        var currentUser;

        beforeEach(function () {
            SecurityServiceMock.requestCurrentUser();
            $httpBackend.flush();
        });


        it('when call getCurrentUser with user logged in, should return an object with user`s data', function () {
            currentUser = SecurityServiceMock.getCurrentUser();
            expect(currentUser.username).toEqual('aldohuxley');
            expect(currentUser.roles).toBeDefined();
            expect(currentUser.roles.length).toEqual(1);
        });

        it('when call logout function, current user data should be null and call $windows.location.reload', function () {
            $httpBackend.expectGET(apiURL + '/logout').respond(200);

            SecurityServiceMock.logout();
            $httpBackend.flush();

            currentUser = SecurityServiceMock.getCurrentUser();

            expect(currentUser.username).not.toBeDefined();
            expect(windowLocationReloadSpy.calls.count()).toEqual(1);
            expect(currentUser.isAdmin()).toBe(false);
            expect(currentUser.isAdminInst()).toBe(false);
            expect(currentUser.isTeacher()).toBe(false);
            expect(currentUser.isTeacherAssistant()).toBe(false);
            expect(currentUser.isStudent()).toBe(false);
        });

    });

    it('when a user with admin_inst role is logged, call isAdminInst should return true', function () {
        $httpBackend.expectGET(apiURL + '/user').respond(200, {
            username: 'admin_inst',
            roles: [
                { id: 2, authority: 'ROLE_ADMIN_INST' }
            ]
        });

        SecurityServiceMock.requestCurrentUser();
        $httpBackend.flush();

        var currentUser = SecurityServiceMock.getCurrentUser();

        expect(currentUser.username).toEqual('admin_inst');
        expect(currentUser.isAdmin()).toBe(false);
        expect(currentUser.isAdminInst()).toBe(true);
        expect(currentUser.isTeacher()).toBe(false);
        expect(currentUser.isTeacherAssistant()).toBe(false);
        expect(currentUser.isStudent()).toBe(false);
    });

    it('when a user with teacher role is logged, call isTeacher should return true', function () {
        $httpBackend.expectGET(apiURL + '/user').respond(200, {
            username: 'teacher',
            roles: [
                { id: 3, authority: 'ROLE_TEACHER' }
            ]
        });

        SecurityServiceMock.requestCurrentUser();
        $httpBackend.flush();

        var currentUser = SecurityServiceMock.getCurrentUser();

        expect(currentUser.username).toEqual('teacher');
        expect(currentUser.isAdmin()).toBe(false);
        expect(currentUser.isAdminInst()).toBe(false);
        expect(currentUser.isTeacher()).toBe(true);
        expect(currentUser.isTeacherAssistant()).toBe(false);
        expect(currentUser.isStudent()).toBe(false);
    });

    it('when a user with teacher assistant role is logged, call isTeacherAssistant should return true', function () {
        $httpBackend.expectGET(apiURL + '/user').respond(200, {
            username: 'teacher_assistant',
            roles: [
                { id: 4, authority: 'ROLE_TEACHER_ASSISTANT' }
            ]
        });

        SecurityServiceMock.requestCurrentUser();
        $httpBackend.flush();

        var currentUser = SecurityServiceMock.getCurrentUser();

        expect(currentUser.username).toEqual('teacher_assistant');
        expect(currentUser.isAdmin()).toBe(false);
        expect(currentUser.isAdminInst()).toBe(false);
        expect(currentUser.isTeacher()).toBe(false);
        expect(currentUser.isTeacherAssistant()).toBe(true);
        expect(currentUser.isStudent()).toBe(false);
    });

    it('when a user with student role is logged, call isStudent should return true', function () {
        $httpBackend.expectGET(apiURL + '/user').respond(200, {
            username: 'student',
            roles: [
                { id: 5, authority: 'ROLE_STUDENT' }
            ]
        });

        SecurityServiceMock.requestCurrentUser();
        $httpBackend.flush();

        var currentUser = SecurityServiceMock.getCurrentUser();

        expect(currentUser.username).toEqual('student');
        expect(currentUser.isAdmin()).toBe(false);
        expect(currentUser.isAdminInst()).toBe(false);
        expect(currentUser.isTeacher()).toBe(false);
        expect(currentUser.isTeacherAssistant()).toBe(false);
        expect(currentUser.isStudent()).toBe(true);
    });

    it('when a user with admin_inst, teacher and student role is logged, call isAdminInst, isTeacher and isStudent should return true', function () {
        $httpBackend.expectGET(apiURL + '/user').respond(200, {
            username: 'admin_inst',
            roles: [
                { id: 2, authority: 'ROLE_ADMIN_INST' },
                { id: 3, authority: 'ROLE_TEACHER' },
                { id: 5, authority: 'ROLE_STUDENT' }
            ]
        });

        SecurityServiceMock.requestCurrentUser();
        $httpBackend.flush();

        var currentUser = SecurityServiceMock.getCurrentUser();

        expect(currentUser.username).toEqual('admin_inst');
        expect(currentUser.isAdmin()).toBe(false);
        expect(currentUser.isAdminInst()).toBe(true);
        expect(currentUser.isTeacher()).toBe(true);
        expect(currentUser.isTeacherAssistant()).toBe(false);
        expect(currentUser.isStudent()).toBe(true);
    });

});