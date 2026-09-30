import DS from "ember-data";
import Ember from "ember";

var attr = DS.attr,
  belongsTo = DS.belongsTo;

export default DS.Model.extend({
  start: attr("date"),
  finish: attr("date"),
  deliveryType: attr("string"),

  offer: belongsTo("offer", { async: false }),
  contact: belongsTo("contact", { async: false }),
  schedule: belongsTo("schedule", { async: false }),
  gogovanOrder: belongsTo("gogovan_order", { async: false }),

  isGogovan: Ember.computed.equal("deliveryType", "Gogovan"),
  isDropOff: Ember.computed.equal("deliveryType", "Drop Off"),
  isAlternate: Ember.computed.equal("deliveryType", "Alternate"),
  isSelfArrangedVan: Ember.computed.equal("deliveryType", "Self Arranged Van"),
  wasDropOff: Ember.computed.notEmpty("schedule.slot"),
  hasGGVorder: Ember.computed.and("isGogovan", "gogovanOrder"),

  noDropOff: Ember.computed("deliveryType", function() {
    return this.get("deliveryType") !== "Drop Off";
  }),

  noGogovan: Ember.computed("deliveryType", function() {
    return this.get("deliveryType") !== "Gogovan";
  }),

  completedWithGogovan: Ember.computed(
    "gogovanOrder",
    "gogovanOrder.status",
    function() {
      return this.get("isGogovan") && this.get("gogovanOrder.isCompleted");
    }
  )
});
