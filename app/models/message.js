import Ember from 'ember';

var moment = require('moment');

export default Ember.Object.extend({
    from: null,
    channel: null,
    text: null,
    messageData: null,

    setTimestamp: function () {
        this.set('timestamp', new Date());
    }.on('init'),

    time: function () {
        return moment(this.get('timestamp')).format('LLL');
    }.property('timestamp')
});
