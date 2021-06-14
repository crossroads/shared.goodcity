import Model, { attr, hasMany } from "@ember-data/model";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";

export default Model.extend({
  resource: attr("string"),
  slot: attr("number"),
  slotName: attr("string"),
  zone: attr("string"),
  scheduledAt: attr("date"),

  deliveries: hasMany("delivery", { async: false }),

  i18n: service(),

  dayTime: computed("slotName", function () {
    var slot = (this.get("slotName") || "").match(/\d+/);
    var day_time = "";
    if (slot) {
      slot = parseInt(slot, 10);
      day_time = this.get("i18n").t(
        "day." + (slot > 8 && slot < 12 ? "morning" : "afternoon")
      );
    }
    return day_time;
  }),
});
