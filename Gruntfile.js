/* global process */

var grunt = require('grunt');
var shell = require('shelljs');

var packageJson = require('./package.json');
var config = packageJson.config;

grunt.loadNpmTasks('grunt-exec');
grunt.loadNpmTasks('grunt-download-atom-shell');
grunt.loadNpmTasks('grunt-concurrent');

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

grunt.registerTask('downloadAtomShell', function () {
    var location = 'https://github.com/atom/atom-shell/releases/download/v0.14.0/atom-shell-v0.14.0-darwin-x64.zip';
    var downloadCmd = ['curl -o', './cache/atom-shell.zip', '-L', location];
    var extractCmd = ['unzip -o ./cache/atom-shell.zip -d ./cache/atom-shell'];

    shell.exec(downloadCmd.join(' '));
    shell.exec(extractCmd.join(''));
});

grunt.registerTask('moveAtomShell', function () {
    shell.exec('mkdir -p release');
    shell.mv('./cache/atom-shell/Atom.app', 'release/Atom.app');
});

grunt.registerTask('copyFiles', function () {
    var atomDir = 'release/Atom.app/Contents/Resources/';
    shell.rm('-rf', atomDir + 'default_app');
    shell.exec('rsync -aqR dist/ release/Atom.app/Contents/Resources/');
    shell.mv(atomDir + 'dist', atomDir + 'default_app');
});

grunt.registerTask('server', ['concurrent:server']);

grunt.registerTask('build', [
    'exec:buildEmber',
    'exec:moveNodeModules',
    'exec:cleanBuildDir',
    'downloadAtomShell',
    'moveAtomShell',
    'copyFiles'
]);
