/*global module, require, angular*/

(function (module, require, angular) {
    'use strict';

    var configModule = require('./config-module'),
        securityModule = require('../security/security-module'),
        groupApp = require('../group/group-app'),
        userApp = require('../user/user-app'),
        submissionApp = require('../submission/submission-app'),
        problemApp = require('../problem/problem-app'),
        quizApp = require('../quiz/quiz-app'),
        layoutApp = require('../layout/layout-app'),
        languageApp = require('../language/language-app'),
        chatApp = require('../chat/chat-app'),
        homeApp = require('../home/home-app'),
        institutionApp = require('../institution/institution-app'),
        pendencyApp = require('../pendency/pendency-app'),
        notificationApp = require('../notification/notification-app'),
        adminApp = require('../admin/admin-app'),
        helpApp = require('../help/help-app'),
        topcoderApp = require('../topcoder/topcoder-app');

    module.exports = angular.module('thehuxley.main', [
        'thehuxley.templates',
        configModule.name,
        securityModule.name,
        layoutApp.name,
        groupApp.name,
        userApp.name,
        submissionApp.name,
        quizApp.name,
        problemApp.name,
        languageApp.name,
        chatApp.name,
        homeApp.name,
        pendencyApp.name,
        institutionApp.name,
        notificationApp.name,
        adminApp.name,
        helpApp.name,
        topcoderApp.name
    ]);

}(module, require, angular));