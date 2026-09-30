import VerifyOfferStateRoute from "./verify_offer_state";

export default VerifyOfferStateRoute.extend({
  setupController(controller, model) {
    this._super(controller, model);
    controller.set("acknowledged", false);

    if (model.get("schedule") && model.get("isSelfArrangedVan")) {
      var selectedSlot = model.get("schedule.slot").toString();
      var timeslot = controller
        .get("slots")
        .filterBy("id", selectedSlot)
        .get("firstObject");
      controller.set("selectedDate", model.get("schedule.scheduledAt"));
      controller.set("selectedId", timeslot);
    } else {
      controller.set("selectedDate", null);
      controller.set("selectedId", null);
    }
  }
});
