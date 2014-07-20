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
        Ember.run.scheduleOnce('render', this, function () {
            var serverRoom = this.get('controller.serverRoom');
            if (serverRoom) {
                this.get('controller').send('setActiveRoom', serverRoom);
            }
        });
    }.on('didInsertElement'),

    scrollDownOnMessage: function () {
        var container = this.$('.message-container');
        if (container) {
            var padding = 20;
            var scrollPosition = container.scrollTop() + container.height() + padding;
            var scrollHeight = container.prop('scrollHeight');
            var following = scrollPosition === scrollHeight;

            Ember.run.scheduleOnce('afterRender', this, function () {
                if (following) {
                    container.scrollTop(scrollHeight);
                }
            });
        }
    }.observes('controller.activeRoom.messages.[]')
});
