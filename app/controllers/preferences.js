import Ember from 'ember';

localforage.config({
    name: 'irc',
    version: 1.0,
    size: 4980736, // Size of database, in bytes. WebSQL-only for now.
    storeName: 'irc',
    description: 'IRC storage'
});

localforage.setDriver(localforage.WEBSQL);

export default Ember.Controller.extend({
    namespaces: ['clientSettings', 'channelSettings', 'autojoinRooms'],

    registerNamespaces: function () {
        var self = this;
        var namespaces = this.get('namespaces');
        namespaces.forEach(function (namespace) {
            localforage.getItem(namespace).then(function (preference) {
                if (preference) {
                    Ember.set(self, namespace, preference);
                } else {
                    return localforage.setItem(namespace, {});
                }
            });
        });
    }.on('init'),

    getPreference: function (path) {
        return localforage.getItem(path);
    },

    setPreference: function (path, preference) {
        var self = this;
        var splitRegex = /(\w+)?\.([\w\.]+)/;

        if (path.indexOf('.') > -1) {
            var match = path.match(splitRegex);
            if (match && match.length > 2) {
                var namespace = match[1];
                var extra = match[2];

                return localforage.getItem(namespace).then(function (data) {
                    Ember.set(data, extra, preference);
                    Ember.set(this, namespace, data);
                    return localforage.setItem(namespace, data);
                });
            }
        } else {
            return localforage.setItem(path, preference).then(function () {
                self.set(path, preference);
            });
        }
    }
});
