import Ember from 'ember';

var moment = require('moment');

export default Ember.Object.extend({
    room: null,
    from: null,
    channel: null,
    text: null,
    messageData: null,

    setTimestamp: function () {
        this.set('timestamp', new Date());
    }.on('init'),

    mentions: function () {
        var text = this.get('text');
        var match = text.match(/(?!@\w+\.\w+)(@\w+)/g);

        if (match && match.length) {
            return match;
        }

        return [];
    }.property('text'),

    time: function () {
        return moment(this.get('timestamp')).format('LT');
    }.property('timestamp')
});
