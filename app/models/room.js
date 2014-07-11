import Ember from 'ember';

import EventMixin from '../mixins/event';
import Message from './message';

var commandRegex = /\/(\w+)\s+(.+)/;

var Notification = require('node-notifier');

export default Ember.Object.extend(EventMixin, {
    connection: null,
    client: null,

    channelName: null,
    joinMessage: null,

    nicks: null,
    messages: null,

    setPerRoomProperties: function () {
        this.set('messages', []);
        this.set('nicks', []);
    }.on('init'),

    storeMessage: function (from, channel, text, message) {
        var msg = Message.create({
            from: from,
            channel: channel,
            text: text,
            messageData: message
        });

        this.get('messages').pushObject(msg);

        this.sendNotification(msg);
    },

    sendMessage: function (nick, message) {
        var channelName = this.get('channelName');

        var match = message.match(commandRegex);
        if (match && match.length > 2) {
            var command = match[1];
            var args = match[2];

            if (command === 'join') {
                this.get('connection').join(args);
            }
        } else {
            this.get('client').say(channelName, message);
            this.storeMessage(nick, channelName, message);
        }

    },

    sendNotification: function (message) {
        if (!Notification) {
            return null;
        }

        if (message.get('from') === this.get('client.username')) {
            return null;
        }

        Ember.Logger.info('Sending notification for message:', message);

        var notifier = new Notification();
        notifier.notify({
            title: message.get('from'),
            subtitle: this.get('channelName'),
            message: message.get('text')
        }, function (err) {
            if (err) {
                Ember.Logger.error('Error sending notification:', err);
            }
        });
    }
});
