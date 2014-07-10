import Ember from 'ember';

export default Ember.Controller.extend({
    needs: ['connection'],

    clientBinding: 'controllers.connection.client',
    roomsBinding: 'controllers.connection.rooms',

    activeRoom: null,
    currentMessage: null,

    actions: {
        setActiveRoom: function (room) {
            this.set('activeRoom', room);
        },

        sendMessage: function () {
            var message = this.get('currentMessage');
            var nick = this.get('controllers.connection.username');

            if (!Ember.isEmpty(message)) {
                this.get('activeRoom').sendMessage(nick, message);

                this.set('currentMessage', '');
            }
        }
    },

    roomMessages: function () {
        return this.get('activeRoom.messages');
    }.property('activeRoom', 'activeRoom.messages.[]'),

    setActiveRoomIfNone: function () {
        if (!this.get('activeRoom') && this.get('rooms')) {
            this.set('activeRoom', this.get('rooms')[0]);
        }
    }.observes('rooms.[]')
});
