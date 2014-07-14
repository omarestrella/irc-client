import Ember from 'ember';

export default Ember.Controller.extend({
    needs: ['connection'],

    connectionBinding: 'controllers.connection',
    serverRoomBinding: 'connection.serverRoom',
    clientBinding: 'connection.client',
    roomsBinding: 'connection.rooms',

    activeRoom: null,
    currentMessage: null,

    actions: {
        setActiveRoom: function (room) {
            this.set('activeRoom', room);

            var currentActiveRoom = this.get('rooms').findBy('isActive', true);
            if (currentActiveRoom) {
                currentActiveRoom.set('isActive', false);
            }

            room.set('isActive', true);
        },

        sendMessage: function () {
            var message = this.get('currentMessage');
            var nick = this.get('controllers.connection.nickname');

            if (!Ember.isEmpty(message)) {
                this.get('activeRoom').sendMessage(nick, message);

                this.set('currentMessage', '');
            }
        }
    },

    roomMessages: function () {
        return this.get('activeRoom.messages');
    }.property('activeRoom', 'activeRoom.messages.[]'),

    roomNicknames: function () {
        return this.get('activeRoom.nicks');
    }.property('activeRoom', 'activeRoom.nicks.[]')
});
