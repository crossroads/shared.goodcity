import Ember from "ember";
import AjaxPromise from "../utils/ajax-promise";
import config from "../config/environment";

export default Ember.Mixin.create({
  messages: Ember.inject.service(),

  preloadData(includePublicTypes) {
    var promises = [];
    var isDonorApp = this.get("session.isDonorApp");
    var isAdminApp = this.get("session.isAdminApp");

    var retrieve = types =>
      types.map(type => this.store.findAll(type, { reload: true }));

    if (includePublicTypes && isDonorApp) {
      promises = retrieve(config.APP.PRELOAD_TYPES);
    }

    if (this.get("session.authToken")) {
      promises = promises.concat(
        this.store.query("cancellation_reason", { for: "offer" })
      );
      promises.push(
        new AjaxPromise(
          "/auth/current_user_profile",
          "GET",
          this.session.get("authToken")
        ).then(data => {
          this.store.pushPayload(data);
          this.store.pushPayload({ user: data.user_profile });
          this.notifyPropertyChange("session.currentUser");
        })
      );

      var offer_params = this.session.get("isAdminApp")
        ? { states: ["nondraft"], summarize: true }
        : { states: ["for_donor"] };

      if (isDonorApp) {
        promises = promises.concat(
          retrieve(config.APP.PRELOAD_AUTHORIZED_TYPES)
        );
      } else if (isAdminApp) {
        promises.push(
          this.get("messages").fetchUnreadMessageCount()
        );
      }
    }

    return Ember.RSVP.all(promises);
  },

  loadStaticData(includePublicTypes) {
    var promises = [];
    var retrieve = types =>
      types.map(type => this.store.findAll(type, { reload: true }));
    if (includePublicTypes) {
      promises = retrieve(config.APP.PRELOAD_TYPES);
    }
    if (this.get("session.authToken")) {
      promises = promises.concat(retrieve(config.APP.PRELOAD_AUTHORIZED_TYPES));
    }
    return Ember.RSVP.all(promises);
  }
});
