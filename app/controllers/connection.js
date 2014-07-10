import Ember from 'ember';

import EventMixin from '../mixins/event';
import Room from '../models/room';

import MockIRC from '../services/mock_irc';

var irc;
if (requireNode) {
    irc = requireNode('irc');
} else {
    irc = MockIRC.create({});
}

export default Ember.Controller.extend(EventMixin, {
    server: null,
    username: null,

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
        var server = this.get('server');
        var username = this.get('username');

        var client = new irc.Client(server, username, {
            channels: ['#thebestfriendsgang'],
            autoConnect: false
        });

        this.set('client', client);

        return new Ember.RSVP.Promise(function (resolve) {
            client.connect(function (data) {
                Client.set('connected', true);

                resolve(data);
            });
        });
    },

    initializeRoom: function (channel, nickname, message) {
        var currentRoom = this.get('rooms').findBy('channelName', channel);

        if (!currentRoom) {
            var room = Room.create({
                connection: this,
                client: this.client,
                channelName: channel,
                joinMessage: message
            });

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

    updateMessages: function (from, channel, text, message) {
        var room = this.get('rooms').findBy('channelName', channel);
        if (room) {
            Ember.Logger.info('Updating messages in:', channel, message);

            room.storeMessage(from, channel, text, message);
        }
    }.listener('message#'),

    join: function (args) {
        if (args.indexOf('#') === 0) {
            this.get('client').join(args, function () {

            });
        }
    }
});
