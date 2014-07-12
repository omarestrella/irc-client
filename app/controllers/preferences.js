import Ember from 'ember';

var pathSplitRegex = /(\w+)?\.([\w\.]+)/;

export default Ember.Controller.extend({
    namespaces: ['clientSettings', 'channelSettings'],

    registerNamespaces: function () {
        var self = this;
        var namespaces = this.get('namespaces');
        namespaces.forEach(function (namespace) {
            var string = window.localStorage.getItem(namespace);
            var preference = JSON.parse(string);
            if (preference) {
                Ember.set(self, namespace, preference);
            } else {
                window.localStorage.setItem(namespace, JSON.stringify({}));
            }
        });
    }.on('init'),

    getPreference: function (path) {
        var rawData;
        if (path.indexOf('.') > -1) {
            var match = path.match(pathSplitRegex);
            if (match && match.length > 2) {
                var namespace = match[1];
                var extra = match[2];
                var namespaceData = this.getPreference(namespace);
                rawData = Ember.get(namespaceData, extra);
            }
        } else {
            rawData = window.localStorage.getItem(path);
        }

        if (rawData === undefined) {
            return rawData;
        }

        return JSON.parse(rawData);
    },

    setPreference: function (path, preference) {
        var string = JSON.stringify(preference);

        if (path.indexOf('.') > -1) {
            var match = path.match(pathSplitRegex);
            if (match && match.length > 2) {
                var namespace = match[1];
                var extra = match[2];
                var namespaceData = this.getPreference(namespace);
                Ember.set(namespaceData, extra, preference);
                this.setPreference(namespace, namespaceData);
            }
        } else {
            window.localStorage.setItem(path, string);
        }
    }
});
