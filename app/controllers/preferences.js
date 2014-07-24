import Ember from 'ember';

var get = Ember.get, set = Ember.set;

var pathSplitRegex = /(\w+)?\.([\w\.]+)/;

var fs, dir, prefPath;

(function setupPreferences (desktop) {
    if (desktop) {
        var remote = require('remote');
        var process = remote.process;

        fs = remote.require('fs');
        dir = '%@/.irksome'.fmt(process.env['HOME']);
        prefPath = '%@/config.json'.fmt(dir);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        if (!fs.existsSync(prefPath)) {
            fs.writeFileSync(prefPath, '{}');
        }
    }
}(window.isDesktop));

function registerNamespaces (controller) {
    var namespaces = controller.get('namespaces');

    if (window.isDesktop) {
        var data = fs.readFileSync(prefPath);
        if (data) {
            var json = JSON.parse(data);

            namespaces.forEach(function (namespace) {
                var preference = get(json, namespace);
                if (preference) {
                    set(controller, namespace, preference);
                } else {
                    set(json, namespace, {});
                    set(controller, namespace, {});
                }
            });

            fs.writeFile(prefPath, JSON.stringify(json));
        }
    } else {
        namespaces.forEach(function (namespace) {
            var string = window.localStorage.getItem(namespace);
            var preference = JSON.parse(string);
            if (preference) {
                set(controller, namespace, preference);
            } else {
                window.localStorage.setItem(namespace, JSON.stringify({}));
            }
        });
    }
}

function setPreference (controller, path, value) {
    if (window.isDesktop) {
        fs.readFile(prefPath, function (error, data) {
            if (!error) {
                var json = JSON.parse(data);

                if (path.indexOf('.') > -1) {
                    var match = path.match(pathSplitRegex);
                    if (match && match.length > 2) {
                        var namespace = match[1];
                        var extra = match[2];
                        var namespaceData = get(json, namespace);

                        set(namespaceData, extra, value);
                        set(controller, namespace, namespaceData);
                    }
                } else {
                    set(json, path, value);
                    set(controller, path, value);
                }

                fs.writeFile(prefPath, JSON.stringify(json));
            }
        });
    } else {
        var string = JSON.stringify(value);

        if (path.indexOf('.') > -1) {
            var match = path.match(pathSplitRegex);
            if (match && match.length > 2) {
                var namespace = match[1];
                var extra = match[2];
                var namespaceData = controller.getPreference(namespace);
                set(namespaceData, extra, value);
                controller.setPreference(namespace, namespaceData);
            }
        } else {
            window.localStorage.setItem(path, string);
        }
    }
}

export default Ember.Controller.extend({
    namespaces: ['clientSettings', 'channelSettings'],

    registerNamespaces: function () {
        registerNamespaces(this);
    }.on('init'),

    getPreference: function (path) {
        return this.get(path);
    },

    setPreference: function (path, value) {
        setPreference(this, path, value);
    }
});
