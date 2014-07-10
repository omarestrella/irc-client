import Ember from 'ember';

export default Ember.Route.extend({
    actions: {
        willTransition: function () {

        }
    },

    beforeModel: function () {
        if (!Client.get('connected')) {
            this.transitionTo('login');
        }
    }
});
