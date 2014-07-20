import Ember from 'ember';

export default Ember.View.extend({
    attachLinkHandler: function () {
        Ember.$(document).on('click', 'a', function (event) {
            var location = Ember.$(event.target).attr('href');
            if (location) {
                var isHttp = location.indexOf('http://') === 0 || location.indexOf('https://') === 0;
                if (isHttp && window.isDesktop) {
                    require('child_process').spawn('open', [location]);
                }
            }
        });
    }.on('didInsertElement')
});
