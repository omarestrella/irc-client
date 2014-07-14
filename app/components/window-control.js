import Ember from 'ember';

var remote;

export default Ember.Component.extend({
    tagName: 'span',
    classNames: ['control'],
    classNameBindings: ['type'],

    type: null,

    click: function () {
        if (window.isDesktop) {
            remote = require('remote');

            var type = this.get('type');
            var browserWindow = remote.getCurrentWindow();

            browserWindow[type].call();
        }
    }
});
