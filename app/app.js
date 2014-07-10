import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';

Function.prototype.listener = function (event) {
    this.__irc_event = event;
    return this;
};

Ember.MODEL_FACTORY_INJECTIONS = true;

var App = Ember.Application.extend({
    modulePrefix: 'client', // TODO: loaded via config
    Resolver: Resolver,

    connected: false,

    bindMoment: function () {
        if (window.moment) {
            this.moment = moment;
        } else {
            if (requireNode) {
                try {
                    this.moment = requireNode('moment');
                } catch(e) {}
            }
        }

    }.on('init')
});

loadInitializers(App, 'client');

export default App;
