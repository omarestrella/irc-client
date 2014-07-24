import Ember from 'ember';

export default Ember.Controller.extend({
    needs: ['connection', 'preferences'],

    server: 'irc.freenode.net',
    nickname: null,
    channels: '',
    autoConnect: false,

    connecting: false,

    actions: {
        connect: function () {
            var self = this;
            var prefs = this.get('controllers.preferences');
            var server = this.get('server');
            var nickname = this.get('nickname');
            var channels = this.get('channels');
            var autoConnect = this.get('autoConnect');

            var channelsArr = channels.split(',');
            var autoJoinRooms = prefs.get('clientSettings.autoJoinRooms');

            if (!channelsArr) {
                channelsArr = ['#thebestfriendsgang'];
            }

            if (autoJoinRooms) {
                channelsArr = _.uniq(channelsArr.concat(autoJoinRooms));
            }

            var connection = this.get('controllers.connection');

            connection.setProperties({
                server: server,
                nickname: nickname,
                defaultChannels: channelsArr,
                autoConnect: autoConnect
            });

            this.set('connecting', true);

            connection.connectToServer().then(function () {
                self.set('connecting', false);

                self.transitionToRoute('index');
            });
        }
    },

    connectAutomaticallyFromLocal: function () {
        if (!window.isDesktop) {
            this.set('server', 'irc.mocking.net');
            this.set('nickname', 'mockusername');
            this.send('connect');
        }
    }.on('init'),

    connectDisabled: function () {
        var server = this.get('server');
        var nickname = this.get('nickname');

        return Ember.isEmpty(server) || Ember.isEmpty(nickname);
    }.property('server', 'nickname'),

    autoConnectChanged: function () {
        var prefs = this.get('controllers.preferences');
        prefs.setPreference('clientSettings.autoConnect', this.get('autoConnect'));
    }.observesImmediately('autoConnect')
});
