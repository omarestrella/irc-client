import Ember from 'ember';

import EventMixin from '../mixins/event';
import Room from '../models/room';

import MockIRC from '../services/mock_irc';

var irc = require('irc');

if (!irc) {
    irc = MockIRC.create({});
}

export default Ember.Controller.extend(EventMixin, {
    needs: ['preferences'],

    server: null,
    nickname: null,
    defaultChannels: null,

    serverRoom: null,

    client: null,

    rooms: [],

    attachErrorListenerToClient: function () {
        var client = this.get('client');
        if (client) {
            client.addListener('error', function (message) {
                console.error('IRC Error: ', message);
            });

            this.attachListeners();
        }
    }.observes('client'),

    connectToServer: function () {
        var self = this;
        var server = this.get('server');
        var nickname = this.get('nickname');
        var defaultChannels = this.get('defaultChannels');

        var client = new irc.Client(server, nickname, {
            channels: defaultChannels,
            autoConnect: false,
            floodProtection: false
        });

        this.set('client', client);

        return new Ember.RSVP.Promise(function (resolve) {
            client.connect(function (data) {
                Client.set('connected', true);

                self.initializeServerRoom();

                resolve(data);
            });
        });
    },

    initializeRoom: function (channel, nickname, message) {
        var prefs = this.get('controllers.preferences');
        var autoJoinRooms = prefs.get('clientSettings.autoJoinRooms');
        var currentRoom = this.get('rooms').findBy('channelName', channel);

        if (!currentRoom) {
            var autoJoined = _.contains(autoJoinRooms, channel);

            var room = Room.create({
                connection: this,
                client: this.client,
                channelName: channel,
                joinMessage: message
            });

            room.set('isAutoJoinedRoom', autoJoined);

            Ember.Logger.info('Joining:', channel);

            this.get('rooms').addObject(room);
        }
    }.listener('join'),

    updateNames: function (channel, nicks) {
        var room = this.get('rooms').findBy('channelName', channel);
        if (room) {
            Ember.Logger.info('Updating names in:', channel);

            if (!Ember.isArray(nicks)) {
                nicks = Object.keys(nicks);
            }

            room.set('nicks', nicks);
        }
    }.listener('names'),

    userLeftRoom: function (channel, nick, reason, message) {
        var room = this.get('rooms').findBy('channelName', channel);
        if (room) {
            Ember.Logger.info('User leaving room:', channel);

            this.get('rooms').removeObject(room);
        }
    }.listener('part'),

    updateMessages: function (from, channel, text, message) {
        var room = this.get('rooms').findBy('channelName', channel);
        if (room) {
            Ember.Logger.info('Updating messages in:', channel, message);

            room.storeMessage(from, channel, text, message);
        }
    }.listener('message#'),

    handleInitialServerConnection: function (message) {
        Ember.run.scheduleOnce('render', this, function () {
            var room = this.get('serverRoom');

            var from = room.get('channelName');
            var text = message.args[1];

            room.storeMessage(from, from, text, message);
        });
    }.listener('registered'),

    handleCCTPMessages: function (message) {
        Ember.Logger.debug('Received CCTP message:', message);
    }.listener('cctp'),

    handleRawMessages: function (message) {
        var args = message.args;
        if (args.length > 1) {
            var room = this.get('serverRoom');
            if (room) {
                var from = room.get('channelName');

                args = _.rest(args);

                args.forEach(function (arg) {
                    var text = '%@: %@'.fmt(message.rawCommand, arg);
                    room.storeMessage(from, from, text, message);
                });
            }
        }

        Ember.Logger.debug('Received raw message:', message);
    }.listener('raw'),

    initializeServerRoom: function () {
        var room = Room.create({
            connection: this,
            client: this.get('client'),
            channelName: this.get('client.opt.server')
        });

        this.set('serverRoom', room);
    },

    join: function (args) {
        if (args.indexOf('#') === 0) {
            this.get('client').join(args, function () {

            });
        }
    },

    setAutoJoin: function (room, menuItem) {
        var prefs = this.get('controllers.preferences');
        var rooms = prefs.get('clientSettings.autoJoinRooms');

        if (!rooms) {
            rooms = [];
        }

        room.set('isAutoJoinedRoom', menuItem.checked);

        if (menuItem.checked) {
            rooms.addObject(room.get('channelName'));
        } else {
            rooms.removeObject(room.get('channelName'));
        }

        prefs.setPreference('clientSettings.autoJoinRooms', rooms);
    },

    leaveRoom: function (room) {
        var channelName = room.get('channelName');
        this.get('client').part(channelName, 'Leaving.', function () {

        });
    },

    leave: function (channelName) {
        var connection = this.get('connection');
        var channelName = args;
        if (channelName[0] !== '#') {
            channelName = '#' + channelName;
        }
        var room = connection.get('rooms').findBy(
                'channelName', channelName);
        connection.leaveRoom(room);
    }
});
