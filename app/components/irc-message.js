import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['message'],

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

        links.each(function (index, link) {
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
});
