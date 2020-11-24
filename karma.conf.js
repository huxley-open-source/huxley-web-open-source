/*global module*/

module.exports = function (config) {
    'use strict';

    config.set({

        basePath: "./",

        files: [
            // bower:
            'vendor/jquery/dist/jquery.js',
            'vendor/angular/angular.js',
            'vendor/angular-translate/angular-translate.js',
            'vendor/angular-route/angular-route.js',
            'vendor/angular-resource/angular-resource.js',
            'vendor/angular-bootstrap/ui-bootstrap-tpls.js',
            'vendor/bootstrap/dist/js/bootstrap.js',
            'vendor/lodash/dist/lodash.compat.js',
            'vendor/angular-ui-select/dist/select.js',
            'vendor/angular-sanitize/angular-sanitize.js',
            'vendor/angular-ui-router/release/angular-ui-router.js',
            'vendor/moment/moment.js',
            'vendor/angular-moment/angular-moment.js',
            'vendor/perfect-scrollbar/src/perfect-scrollbar.js',
            'vendor/restangular/dist/restangular.js',
            'vendor/hamsterjs/hamster.js',
            'vendor/angular-mousewheel/mousewheel.js',
            'vendor/spin.js/spin.js',
            'vendor/angular-spinner/angular-spinner.js',
            'vendor/angular-ui-ace/ui-ace.js',
            'vendor/angular-file-upload/dist/angular-file-upload.min.js',
            'vendor/bootstrap-filestyle/src/bootstrap-filestyle.js',
            'vendor/d3/d3.js',
            'vendor/nvd3/build/nv.d3.js',
            'vendor/angular-cookies/angular-cookies.js',
            'vendor/angular-nvd3/dist/angular-nvd3.js',
            'vendor/blueimp-canvas-to-blob/js/canvas-to-blob.js',
            'vendor/rangy/rangy-core.js',
            'vendor/rangy/rangy-classapplier.js',
            'vendor/rangy/rangy-highlighter.js',
            'vendor/rangy/rangy-selectionsaverestore.js',
            'vendor/rangy/rangy-serializer.js',
            'vendor/rangy/rangy-textrange.js',
            'vendor/textAngular/src/textAngular.js',
            'vendor/textAngular/src/textAngular-sanitize.js',
            'vendor/textAngular/src/textAngularSetup.js',
            'vendor/cropper/dist/cropper.js',
            'vendor/angularjs-facebook-sdk/dist/angularjs-facebook-sdk.js',
            'vendor/angular-ui-scroll/dist/ui-scroll.js',
            'vendor/angular-ui-scroll/dist/ui-scroll-jqlite.js',
            'vendor/markdown-it/dist/markdown-it.js',
            'vendor/highlightjs/highlight.pack.js',
            'vendor/angularjs-scroll-glue/src/scrollglue.js',
            'vendor/blob-polyfill/Blob.js',
            'vendor/file-saver.js/FileSaver.js',
            'vendor/angular-file-saver/dist/angular-file-saver.bundle.js',
            'vendor/clipboard/dist/clipboard.js',
            'vendor/ngclipboard/dist/ngclipboard.js',
            'vendor/sifter/sifter.js',
            'vendor/microplugin/src/microplugin.js',
            'vendor/selectize/dist/js/selectize.js',
            'vendor/angular-selectize2/dist/angular-selectize.js',
            'vendor/slick-carousel/slick/slick.min.js',
            'vendor/angular-slick/dist/slick.js',
            'vendor/jquery-ui/jquery-ui.js',
            'vendor/angular-ui-slider/src/slider.js',
            'vendor/codemirror/lib/codemirror.js',
            'vendor/codemirror/lib/codemirror.js',
            'vendor/angular-ui-codemirror/ui-codemirror.js',
            'vendor/codemirror/mode/clike/clike.js',
            'vendor/codemirror/mode/pascal/pascal.js',
            'vendor/codemirror/mode/python/python.js',
            'vendor/codemirror/mode/octave/octave.js',
            'vendor/ng-file-upload/ng-file-upload.js',
            'vendor/floating-scroll/src/jquery.floatingscroll.js',
            // endbower
            { pattern: "src/**/test/unit/**/*.spec.*", watched: true, include: true, served: true }
        ],

        exclude: [],

        proxies: {},

        reporters: ['progress'],

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        frameworks: ['browserify', 'jasmine'],

        browsers: ['PhantomJS'],

        preprocessors: {
            'src/**/test/unit/**/*.spec.*': ['browserify']
        },

        captureTimeout: 60000,

        singleRun: false,

        browserify: {
            watch: true
        }

    });
};