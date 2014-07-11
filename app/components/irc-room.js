import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['room'],
    classNameBindings: ['isActive:active:'],

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
        debugger;
    }.on('didInsertElement'),

    click: function () {
        this.send('setActiveRoom', this.get('room'));
    }
});
