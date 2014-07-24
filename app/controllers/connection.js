import Ember from 'ember';

import EventMixin from '../mixins/event';
import Room from '../models/room';

import MockIRC from '../services/mock_irc';

var irc = require('irc');
var remote = require('remote');
//var irc = remote.require('irc');

if (!irc) {
    irc = MockIRC.create({});
    remote = {};
}

export default Ember.Controller.extend(EventMixin, {
    needs: ['preferences'],

    server: null,
    nickname: null,
    defaultChannels: null,
    autoConnect: false,

    serverRoom: null,

    client: null,

    rooms: [],

    attachErrorListenerToClient: function () {
        var client = this.get('client');
        if (client) {
            client.addListener('error', function (message) {
                console.info('IRC Error: ', message);
            });

            this.attachListeners();
        }
    }.observesImmediately('client'),

    connectToServer: function () {
        var client, app, options;
        var server, nickname, defaultChannels;

        var self = this;
        var prefs = this.get('controllers.preferences');

        if (prefs.get('clientSettings.autoConnect')) {
            var data = prefs.get('clientSettings.autoConnectData');
            if (data) {
                this.setProperties(data);
            }

            var channels = prefs.get('clientSettings.autoJoinRooms');
            this.set('defaultChannels', channels || []);
        }

        defaultChannels = this.get('defaultChannels');
        server = this.get('server');
        nickname = this.get('nickname');

        if (window.isDesktop) {
            app = remote.require('app');

            if (app.ircClient && app.ircClient.opt) {
                options = app.ircClient.opt;
                options = _.extend({}, options, {
                    channels: defaultChannels
                });
            }
        }

        client = new irc.Client(server, nickname, options || {
            channels: defaultChannels,
            autoConnect: false,
            floodProtection: false
        });

        self.set('client', client);

        return new Ember.RSVP.Promise(function (resolve) {
            if (app) {
                app.ircClient = client;
            }

            client.connect(function (data) {
                Client.set('connected', true);

                self.initializeServerRoom();

                if (prefs.get('clientSettings.autoConnect')) {
                    self.saveConnectionDetails();
                }

                resolve(data);
            });
        });
    },

    initializeRoom: function (channel, nick, message) {
        var prefs = this.get('controllers.preferences');
        var autoJoinRooms = prefs.get('clientSettings.autoJoinRooms');
        var currentRoom = this.get('rooms').findBy('channelName', channel);

        if (!currentRoom) {
            Ember.Logger.info('Joining:', channel);

            var autoJoined = _.contains(autoJoinRooms, channel);

            var room = Room.create({
                connection: this,
                client: this.client,
                channelName: channel,
                joinMessage: message
            });

            room.set('isAutoJoinedRoom', autoJoined);

            this.get('rooms').addObject(room);

            currentRoom = room;
        }

        if (this.get('client.nick') !== nick) {
            currentRoom.get('nicks').addObject(nick);
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

    userLeftRoom: function (channel, nick /*, reason, message */) {
        var room = this.get('rooms').findBy('channelName', channel);
        if (room) {
            Ember.Logger.info('User leaving room:', channel);


            if (this.get('client.nick') === nick) {
                this.get('rooms').removeObject(room);
            } else {
                room.get('nicks').removeObject(nick);
            }
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

    saveConnectionDetails: function () {
        var prefs = this.get('controllers.preferences');
        prefs.setPreference('clientSettings.autoConnectData', {
            nickname: this.get('nickname'),
            server: this.get('server')
        });
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
        if (channelName[0] !== '#') {
            channelName = '#' + channelName;
        }
        var room = this.get('rooms').findBy(
                'channelName', channelName);
        this.leaveRoom(room);
    }
});
