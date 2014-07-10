import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['message'],

    linkifyText: function () {
        this.$('.text').linkify();
    }.on('didInsertElement')
});
