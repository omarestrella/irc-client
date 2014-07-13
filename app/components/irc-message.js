import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['message'],

    message: null,

    imageUrls: null,

    setPerMessageProperties: function () {
        this.set('imageUrls', []);
    }.on('init'),

    linkifyText: function () {
        this.$('.text').linkify();
        var links = this.$('a');
        this.collectImageUrls(links);
    }.on('didInsertElement'),

    collectImageUrls: function (links) {
        var self = this;

        if (!this.get('message.room.isServerRoom')) {
            links.each(function () {
                var url = Ember.$(this).attr('href');

                Ember.$.ajax({
                    type: 'head',
                    url: url,
                    success: function (data, status, xhr) {
                        var contentType = xhr.getResponseHeader('Content-Type');
                        if (contentType.indexOf('image') > -1) {
                            self.get('imageUrls').addObject(url);
                        }
                    }
                });
            });
        }
    }
});
