import Ember from 'ember';
import DS from 'ember-data';

var attr = DS.attr,
  hasMany = DS.hasMany;

export default DS.Model.extend({
  name: attr('string'),
  items: hasMany('item', { async: false }),

  specialId: Ember.computed('id', function() {
    return this.get("id") + "_reason";
  })
});
