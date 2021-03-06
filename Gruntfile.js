/* global process */

var fs = require('fs');
var grunt = require('grunt');
var shell = require('shelljs');

var packageJson = require('./package.json');
var config = packageJson.config;

grunt.loadNpmTasks('grunt-exec');
grunt.loadNpmTasks('grunt-download-atom-shell');
grunt.loadNpmTasks('grunt-concurrent');

var ATOM_LOCATION = 'https://github.com/atom/atom-shell/releases/download/v0.14.0/atom-shell-v0.14.0-darwin-x64.zip';

grunt.initConfig({
    exec: {
        buildEmber: {
            command: function () {
                process.env['irc_deployment'] = true;

                return './node_modules/ember-cli/bin/ember build';
            }
        },

        moveNodeModules: {
            command: function () {
                var modules = packageJson['browserModules'];
                var cmdPattern = 'rsync -aqR node_modules/{lib} dist/';
                var cmdList = ['mkdir -p dist/node_modules'];
                for (var i = 0; i < modules.length; i++) {
                    cmdList.push(cmdPattern.replace(/\{lib\}/gi, modules[i]));
                }

                return cmdList.join('; ');
            }
        },

        cleanBuildDir: {
            command: 'rm -rf release'
        }
    },

    concurrent: {
        options: {
            logConcurrentOutput: true
        },
        server: {
            tasks: ['ircServer', 'emberServer']
        }
    },

    'download-atom-shell': {
        version: '0.13.3',
        outputDir: 'release',
        downloadDir: 'cache',
        rebuild: false
    }
});

grunt.registerTask('downloadDependencies', function () {
    if (!fs.existsSync('./lib/Atom.app')) {
        var downloadCmd = ['curl -o', './lib/atom-shell.zip', '-L', ATOM_LOCATION];
        var extractCmd = ['unzip -o ./lib/atom-shell.zip -d ./lib/'];

        shell.exec('mkdir -p lib');
        shell.exec(downloadCmd.join(' '));
        shell.exec(extractCmd.join(''));
        shell.rm('./lib/atom-shell.zip');
    }
});

grunt.registerTask('ircServer', function () {
    shell.exec('node node_modules/ircdjs/bin/ircd.js');
});

grunt.registerTask('emberServer', function () {
    process.env['irc_development'] = true;
    shell.exec('ember server --port ' + config.emberPort);
});

grunt.registerTask('devAtomMac', function () {
    process.env['irc_development'] = true;
    shell.exec('./lib/Atom.app/Contents/MacOS/Atom .');
});

grunt.registerTask('copyAtomShell', function () {
    shell.exec('mkdir -p release/IRC.app');
    shell.cp('-R', './lib/Atom.app/*', 'release/IRC.app/');
});

grunt.registerTask('copyFiles', function () {
    var atomDir = 'release/IRC.app/Contents/Resources/';
    shell.rm('-rf', atomDir + 'default_app');
    shell.exec('rsync -aqR dist/ release/IRC.app/Contents/Resources/');
    shell.mv(atomDir + 'dist', atomDir + 'default_app');
});

grunt.registerTask('compressDirectory', function () {
    shell.cd('release');
    shell.exec('zip -r IRC.zip IRC.app');
    shell.rm('-rf', 'IRC.app');
});

grunt.registerTask('server', ['concurrent:server']);

grunt.registerTask('build', [
    'exec:buildEmber',
    'exec:moveNodeModules',
    'exec:cleanBuildDir',
    'downloadDependencies',
    'copyAtomShell',
    'copyFiles',
    'compressDirectory'
]);
