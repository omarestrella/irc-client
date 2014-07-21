import Ember from 'ember';

var remote, Menu, MenuItem;

try {
    remote = require('remote');
    Menu = remote.require('menu');
    MenuItem = remote.require('menu-item');
} catch (e) {
    // No native on web...
}

export default Ember.Component.extend({
    classNames: ['room'],
    classNameBindings: ['room.isActive:active:', 'room.isServerRoom:server-room:'],

    isAutoJoinedRoom: 'room.isAutoJoinedRoom',
    connectionBinding: 'room.connection',

    room: null,

    target: null,

    actions: {
        setActiveRoom: function (room) {
            this.triggerAction({
                action: 'setActiveRoom',
                actionContext: room
            });
        }
    },

    attachRightClickMenu: function () {
        var self = this;

        if (window.isDesktop) {
            var menu = new Menu();

            menu.append(new MenuItem({
                label: 'Auto-join Room',
                type: 'checkbox',
                checked: this.get('isAutoJoinedRoom'),
                click: _.bind(self.setAutoJoin, self)
            }));
            menu.append(new MenuItem({ label: 'Leave Room', click: _.bind(self.leaveRoom, self) }));

            window.addEventListener('contextmenu', function (event) {
                if (Ember.$(event.target).attr('id') === self.$().attr('id')) {
                    event.preventDefault();
                    event.stopPropagation();
                    menu.popup(remote.getCurrentWindow());
                }
            }, false);
        }
    }.on('didInsertElement'),

    setAutoJoin: function (menuItem) {
        this.get('connection').setAutoJoin(this.get('room'), menuItem);
    },

    leaveRoom: function () {
        this.get('connection').leaveRoom(this.get('room'));
    },

    click: function () {
        this.send('setActiveRoom', this.get('room'));
    }
});
