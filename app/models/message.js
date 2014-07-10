import Ember from 'ember';

export default Ember.Object.extend({
    from: null,
    channel: null,
    text: null,
    messageData: null,

    setTimestamp: function () {
        this.set('timestamp', new Date());
    }.on('init'),

    time: function () {
        return Client.moment(this.get('timestamp')).format('LLL');
    }.property('timestamp')
});
