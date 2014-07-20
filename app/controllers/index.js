import Ember from 'ember';

export default Ember.Controller.extend({
    needs: ['connection'],

    connectionBinding: 'controllers.connection',
    serverRoomBinding: 'connection.serverRoom',
    clientBinding: 'connection.client',
    roomsBinding: 'connection.rooms',

    activeRoom: null,
    currentMessage: null,

    hideRooms: false,

    actions: {
        setActiveRoom: function (room) {
            var serverRoom = this.get('serverRoom');
            var currentActiveRoom = this.get('rooms').findBy('isActive', true);

            this.set('activeRoom', room);

            if (currentActiveRoom) {
                currentActiveRoom.set('isActive', false);
            }

            if (room !== serverRoom) {
                serverRoom.set('isActive', false);
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
        },

        toggleRooms: function () {
            this.toggleProperty('hideRooms');
        }
    },

    messageGroups: function () {
        return this.get('activeRoom.messageGroups');
    }.property('activeRoom', 'activeRoom.messageGroups.[]'),

    roomNicknames: function () {
        return this.get('activeRoom.nicks');
    }.property('activeRoom', 'activeRoom.nicks.[]')
});
