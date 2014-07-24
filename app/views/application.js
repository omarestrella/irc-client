import Ember from 'ember';

var remote, Menu, MenuItem;

try {
    remote = require('remote');
    Menu = remote.require('menu');
    MenuItem = remote.require('menu-item');
} catch (e) {
    // No native on web...
}

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
    }.on('didInsertElement'),

    registerDefaultMenu: function () {
        if (window.isDesktop) {
            var template = [
                {
                    label: 'Cut',
                    accelerator: 'Command+X',
                    selector: 'cut:'
                },
                {
                    label: 'Copy',
                    accelerator: 'Command+C',
                    selector: 'copy:'
                },
                {
                    label: 'Paste',
                    accelerator: 'Command+V',
                    selector: 'paste:'
                },
                {
                    label: 'Select All',
                    accelerator: 'Command+A',
                    selector: 'selectAll:'
                }
            ];
            var menu = Menu.buildFromTemplate(template);

            window.addEventListener('contextmenu', function (event) {
                var target = Ember.$(event.target);

                if (target.is('.room') || target.parents('.room')) {
                    return;
                }

                menu.popup(remote.getCurrentWindow());
            }, false);
        }
    }.on('didInsertElement')
});
