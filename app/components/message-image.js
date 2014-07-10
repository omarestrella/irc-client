import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['image'],
    classNameBindings: ['expanded'],

    expanded: false,

    actions: {
        toggleExpand: function () {
            this.toggleProperty('expanded');
        }
    }
});
