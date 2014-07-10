import Ember from 'ember';

var listeners = {};

function Client() {
    return {
        connect: function (cb) {
            cb({});
        },

        addListener: function (event, cb) {
            if (!listeners[event]) {
                listeners[event] = [];
            }

            listeners[event].push(cb);
        },

        say: function () {}
    };
}

export default Ember.Controller.extend({
    Client: Client,

    emitEventRandomly: function () {
        var choices = ['names', 'join', 'message#'];
        window.setInterval(function () {
            var choice = 10;
            while(choice > 3) {
                choice = Math.round(Math.random() * 10);
            }

            var event = choices[choice];
            var funcs = listeners[event];

            if (funcs) {
                var args = [];

                if (event === 'names') {
                    args = ['#mockirc', ['test1', 'test2']];
                } else if (event === 'join') {
                    args = ['#mockirc', '', {}];
                } else if (event === 'message#') {
                    args = ['test1', '#mockirc', 'whats up yo?', ''];
                }

                for (var i = 0; i < funcs.length; i++) {
                    funcs[i].apply(null, args);
                }
            }
        }, 500);
    }.on('init')
});
