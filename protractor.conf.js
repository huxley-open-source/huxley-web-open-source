/*global exports*/
exports.config = {

    chromeOnly: true,
    chromeDriver: 'vendor/selenium/chromedriver',

    capabilities: {
        'browserName': 'chrome'
    },

    specs: ['test/e2e/**/*.spec.js'],
    baseUrl: 'http://localhost:8080/',
    
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 300000
    }
};