import Ember from 'ember';

var remote = require('remote');
var Menu = remote.require('menu');
var MenuItem = remote.require('menu-item');

export default Ember.Component.extend({
    classNames: ['room'],
    classNameBindings: ['isActive:active:'],

    isAutoJoinedRoom: 'room.isAutoJoinedRoom',
    connectionBinding: 'room.connection',

    room: null,

    target: null,
    isActive: false,

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
                menu.popup(remote.getCurrentWindow());
            }
        }, false);
    }.on('didInsertElement'),

    setAutoJoin: function (menuItem, browserWindow) {
        this.get('connection').setAutoJoin(this.get('room'), menuItem);
    },

    leaveRoom: function (menuItem, browserWindow) {
        this.get('connection').leaveRoom(this.get('room'));
    },

    click: function () {
        this.send('setActiveRoom', this.get('room'));
    }
});
