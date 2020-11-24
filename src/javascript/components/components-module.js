/*global module, angular, require*/

(function (module, angular) {
    'use strict';
    var messagesPtBr = require('./i18n/messages_pt_BR'),
        messagesEnUs = require('./i18n/messages_en_US');
    module.exports = angular.module('thehuxley.components', [
        'angularFileUpload',
        'ui.codemirror'
    ])

        .config(['$translateProvider',
            function ($translateProvider) {
                $translateProvider.translations('pt_BR', messagesPtBr);
                $translateProvider.translations('en_US', messagesEnUs);
                $translateProvider.preferredLanguage('pt_BR');
            }]);

}(module, angular));

require('./components-directives');
require('./markdown-editor');
require('./loading-directives');
