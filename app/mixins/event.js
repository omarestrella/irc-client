import Ember from 'ember';

export var addListener = function (event, func) {
    func.__irc_event = event;
    return func;
};

export default Ember.Mixin.create({
    attachListeners: function () {
        var self = this;
        var func, prop;

        for(prop in this) {
            func = this[prop];

            (function (scopedFunc) {
                if (scopedFunc && scopedFunc.__irc_event) {
                    var event = scopedFunc.__irc_event;

                    self.get('client').addListener(event, function () {
                        scopedFunc.apply(self, arguments);
                    });
                }
            })(func);
        }
    }
});
