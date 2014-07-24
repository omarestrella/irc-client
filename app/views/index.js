import Ember from 'ember';

var ENTER = 13;

export default Ember.View.extend({
    classNames: ['row', 'chat-container'],

    attachSendMessageHandler: function () {
        var self = this;
        this.$('textarea').on('keypress', function (event) {
            if (event.keyCode === ENTER && !event.shiftKey) {
                event.preventDefault();
                event.stopPropagation();

                self.get('controller').send('sendMessage');
            }
        });
    }.on('didInsertElement'),

    setServerRoomAsActive: function () {
        Ember.run.scheduleOnce('afterRender', this, function () {
            var rooms = this.get('controller.rooms');
            if (rooms) {
                this.get('controller').send('setActiveRoom', rooms.objectAt(0));
            }
        });
    }.on('didInsertElement'),

    scrollDownOnMessage: function () {
        var container = this.$('.message-container');
        if (container) {
            var scrollPosition = container.scrollTop() + container.height();
            var scrollHeight = container.prop('scrollHeight');
            var following = scrollPosition === scrollHeight;

            Ember.run.scheduleOnce('afterRender', this, function () {
                if (following) {
                    container.scrollTop(scrollHeight);
                }
            });
        }
    }.observes('controller.activeRoom.messages.[]'),

    keyUp: function (event) {
        if (keystroke.codeToString(event.keyCode) === 'UP_ARROW' && Ember.$(event.target).is('textarea')) {
            var messages = this.get('controller.activeRoom.messages');
            var last = _.last(messages);
            var textarea = this.$('textarea');
            if (last && !textarea.val()) {
                textarea.val(last.get('text'));
            }
        }
    }
});
