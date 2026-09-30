import Ember from "ember";
import AjaxPromise from "./../../utils/ajax-promise";
import { translationMacro as t } from "ember-i18n";
const { getOwner } = Ember;

export default Ember.Controller.extend({
  delivery: Ember.inject.controller(),
  selectedId: null,
  selectedDate: null,
  acknowledged: false,
  datePrompt: t("gogovan.book_van.date"),
  timePrompt: t("gogovan.book_van.time"),
  i18n: Ember.inject.service(),

  slots: Ember.computed("timeslot.[]", function() {
    return this.store.peekAll("timeslot").sortBy("name");
  }),

  available_dates: Ember.computed("available_dates.[]", {
    get: function() {
      new AjaxPromise(
        "/available_dates",
        "GET",
        this.get("session.authToken"),
        { schedule_days: 40 }
      ).then(data => this.set("available_dates", data));
    },
    set: function(key, value) {
      return value;
    }
  }),

  requiredFieldsFilled: Ember.computed(
    "selectedId",
    "selectedDate",
    "acknowledged",
    function() {
      return !!(
        this.get("selectedId") &&
        this.get("selectedDate") &&
        this.get("acknowledged")
      );
    }
  ),

  actions: {
    bookSchedule() {
      var controller = this;
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      var selectedSlot = controller.get("selectedId");
      var slotName = controller
        .get("slots")
        .filterBy("id", selectedSlot.get("id"))
        .get("firstObject.name");

      var deliveryId = this.get("delivery.model.id");
      var delivery = this.get("store").peekRecord("delivery", deliveryId);
      var offer = delivery.get("offer");

      var properties = {
        delivery: {
          id: deliveryId,
          deliveryType: "Self Arranged Van",
          offerId: offer.id,
          scheduleAttributes: {
            slot: selectedSlot.get("id"),
            scheduledAt: controller.get("selectedDate"),
            slotName: slotName
          }
        }
      };

      new AjaxPromise(
        "/confirm_delivery",
        "POST",
        this.get("session.authToken"),
        properties
      )
        .then(function(data) {
          controller.store.pushPayload(data);
          offer.set("state", "scheduled");
          loadingView.destroy();
          if (controller.get("session.isAdminApp")) {
            controller.transitionToRoute("review_offer.logistics", offer);
          } else {
            controller.transitionToRoute("offer.transport_details", offer);
          }
        })
        .catch(error => {
          loadingView.destroy();
          throw error;
        });
    }
  }
});
