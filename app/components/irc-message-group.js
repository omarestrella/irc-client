import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['irc-message-group'],

    group: null,

    from: function () {
        return this.get('group.from');
    }.property('group.from'),

    messages: function () {
        return this.get('group.messages');
    }.property('group.messages.[]')
});
