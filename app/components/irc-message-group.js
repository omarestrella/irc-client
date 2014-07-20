import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['irc-message-group'],
    classNameBindings: ['isYourself:you:other'],

    group: null,

    from: function () {
        return this.get('group.from');
    }.property('group.from'),

    isYourself: function () {
        return this.get('group.room.connection.nickname') === this.get('from');
    }.property('from', 'group.room.connection.nickname'),

    messages: function () {
        return this.get('group.messages');
    }.property('group.messages.[]')
});
