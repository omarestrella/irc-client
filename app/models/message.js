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

    time: function () {
        return moment(this.get('timestamp')).format('LT');
    }.property('timestamp')
});
