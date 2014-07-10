import Ember from 'ember';

export default Ember.Controller.extend({
    needs: ['connection'],

    server: 'irc.freenode.net',
    username: null,

    connecting: false,

    actions: {
        connect: function () {
            var self = this;
            var server = this.get('server');
            var username = this.get('username');

            var connection = this.get('controllers.connection');

            connection.setProperties({
                server: server,
                username: username
            });

            this.set('connecting', true);

            connection.connectToServer().then(function () {
                self.set('connecting', false);

                self.transitionToRoute('index');
            });
        }
    },

    connectAutomaticallyFromLocal: function () {
        if (!requireNode) {
            this.set('username', 'mockusername');
            this.send('connect');
        }
    }.on('init'),

    connectDisabled: function () {
        var server = this.get('server');
        var username = this.get('username');

        return Ember.isEmpty(server) || Ember.isEmpty(username);
    }.property('server', 'username')
});
