import Ember from 'ember';

export default Ember.Route.extend({
    actions: {
        willTransition: function () {

        }
    },

    beforeModel: function () {
        if (window.isDesktop) {
            var remote = require('remote');
            var app = remote.require('app');
            var connection = this.controllerFor('connection');
            var prefs = this.controllerFor('preferences');
            if (app.ircClient || prefs.get('clientSettings.autoConnect')) {
                return connection.connectToServer();
            }
        }

        if (!Client.get('connected')) {
            this.transitionTo('login');
        }
    }
});
