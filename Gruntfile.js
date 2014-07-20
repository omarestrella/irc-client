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
            command: 'ember build'
        },

        moveNodeModules: {
            command: function () {
                var modules = package['browserModules'];
                var cmdPattern = 'rsync -aqR node_modules/{lib} dist/';
                var cmdList = ['mkdir -p dist/node_modules'];
                for (var i = 0; i < modules.length; i++) {
                    cmdList.push(cmdPattern.replace(/\{lib\}/gi, modules[i]));
                }

                return cmdList.join('; ');
            }
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
        outputDir: 'atombinaries'
    }
});

grunt.registerTask('ircServer', function () {
    shell.exec('node node_modules/ircdjs/bin/ircd.js');
});

grunt.registerTask('emberServer', function () {
    shell.exec('ember server --port ' + config.emberPort);
});

grunt.registerTask('devAtomMac', function () {
    shell.exec('./lib/Atom.app/Contents/MacOS/Atom .');
});

grunt.registerTask('server', ['concurrent:server']);

grunt.registerTask('build', ['exec:buildEmber', 'exec:moveNodeModules', 'exec:buildNodeWebkit', 'exec:runNodeWebkit']);
