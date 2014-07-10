/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var pickFiles = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');
var fileMover = require('broccoli-file-mover');

var nodeWebkit = pickFiles('app', {
    srcDir: '/',
    files: ['package.json'],
    destDir: '/'
});

var app = new EmberApp({
    wrapInEval: false
});

app.import('vendor/bootstrap/dist/css/bootstrap.css');
app.import('vendor/flexboxgrid/css/flexboxgrid.css');
app.import('vendor/ionicons/css/ionicons.css');

app.import('vendor/moment/moment.js');
app.import('vendor/localforage/dist/localforage.js');
app.import('vendor/jQuery-linkify/dist/jquery.linkify.js');

var fontAssets = pickFiles('vendor/ionicons/fonts', {
    srcDir: '/',
    files: ['**/*'],
    destDir: '/fonts'
});

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

module.exports = mergeTrees([app.toTree(), nodeWebkit, fontAssets]);
