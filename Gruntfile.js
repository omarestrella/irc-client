var grunt = require('grunt');

var package = require('./package.json');

grunt.loadNpmTasks('grunt-exec');
grunt.loadNpmTasks('grunt-download-atom-shell');

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
        },
        buildNodeWebkit: {
            command: 'zip -r app.nw index.html package.json assets/ fonts/ node_modules/',
            cwd: 'dist'
        },
        runNodeWebkit: {
            command: 'lib/node-webkit.app/Contents/MacOS/node-webkit dist/app.nw --remote-debugging-port=9222'
        }
    },

    'download-atom-shell': {
        version: '0.13.3',
        outputDir: 'atombinaries'
    }
});

grunt.registerTask('webkitBuild', ['exec:buildEmber', 'exec:moveNodeModules', 'nodewebkit']);
grunt.registerTask('build', ['exec:buildEmber', 'exec:moveNodeModules', 'exec:buildNodeWebkit', 'exec:runNodeWebkit']);
