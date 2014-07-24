import Ember from 'ember';

import EventMixin from '../mixins/event';
import Message from './message';
import MessageGroup from './message-group';

var commandRegex = /^\/(\w+)\s*(.*)/;

var Notification = require('node-notifier');
var ipc = require('ipc');

export default Ember.Object.extend(EventMixin, {
    connection: null,
    client: null,

    channelName: null,
    joinMessage: null,

    nicks: null,

    messages: null,
    messageGroups: null,

    isAutoJoinedRoom: false,

    setPerRoomProperties: function () {
        this.set('messages', []);
        this.set('messageGroups', []);
        this.set('nicks', []);
    }.on('init'),

    isServerRoom: function () {
        var name = this.get('channelName');
        if (name) {
            return this.get('channelName').charAt(0) !== '#';
        }

        return false;
    }.property('channelName'),

    storeMessage: function (from, channel, text, message) {
        var lastMessageGroup = _.last(this.get('messageGroups'));

        var msg = Message.create({
            room: this,
            from: from,
            channel: channel,
            text: text,
            messageData: message
        });

        if (lastMessageGroup && lastMessageGroup.get('from') === from) {
            lastMessageGroup.get('messages').pushObject(msg);
        } else {
            var group = MessageGroup.create({
                room: this,
                from: from,
                messages: [msg]
            });

            this.get('messageGroups').pushObject(group);
        }

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
            } else if ((command === 'leave') || (command === 'part')) {
                if (!args) {
                    args = channelName;
                }

                this.get('connection').leave(args);
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

        var from = message.get('from');
        var mentions = message.get('mentions');
        var nickname = this.get('client.nick');

        if (from === nickname) {
            return null;
        }

        if (this.get('isServerRoom')) {
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

        if (_.contains(mentions, '@' + nickname) && window.isDesktop) {
            ipc.send('bounce-dock');
        }
    }
});
