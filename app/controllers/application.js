import Ember from 'ember';

export default Ember.Controller.extend({
    needs: ['connection'],

    attachUnloadListener: function () {
        var connection = this.get('controllers.connection');

        window.onbeforeunload = function () {
            var client = connection.get('client');

            if (client) {
                client.disconnect();
            }
        };
    }
});
