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
    }.on('didInsertElement')
});
