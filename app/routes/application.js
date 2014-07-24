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
            if (app.ircClient) {
                return connection.connectToServer();
            }
        }
        if (!Client.get('connected')) {
            this.transitionTo('login');
        }
    }
});
