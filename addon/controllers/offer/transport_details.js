import Ember from "ember";

const VAN_BOOKING_LINKS = {
  gogox: {
    ios: {
      en:
        "https://apps.apple.com/hk/app/gogox-gogovan-24-7-delivery/id708390467?l=en-GB",
      "zh-tw":
        "https://apps.apple.com/hk/app/gogox-%E5%89%8D%E7%82%BAgogovan-%E5%8D%B3%E6%99%82%E8%B2%A8%E9%81%8B%E5%8F%8A%E9%80%9F%E9%81%9E%E5%8F%AB%E8%BB%8A/id708390467"
    },
    android: {
      en:
        "https://play.google.com/store/apps/details?id=hk.gogovan.GoGoVanClient2&hl=en_US",
      "zh-tw":
        "https://play.google.com/store/apps/details?id=hk.gogovan.GoGoVanClient2&hl=zh_TW"
    },
    web: {
      en: "https://www.gogox.com/index/",
      "zh-tw": "https://www.gogox.com/hk/"
    }
  },
  lalamove: {
    ios: {
      en:
        "https://apps.apple.com/hk/app/lalamove-fast-affordable/id735701965?l=en-GB",
      "zh-tw":
        "https://apps.apple.com/hk/app/lalamove-%E5%8D%B3%E6%99%82%E9%80%81%E8%B2%A8-%E5%83%B9%E6%A0%BC%E5%AF%A6%E6%83%A0/id735701965"
    },
    android: {
      en:
        "https://play.google.com/store/apps/details?id=hk.easyvan.app.client&hl=en_US",
      "zh-tw":
        "https://play.google.com/store/apps/details?id=hk.easyvan.app.client&hl=zh_TW"
    },
    web: {
      en: "https://www.lalamove.com/en-hk/",
      "zh-tw": "https://www.lalamove.com/zh-hk/"
    }
  }
};

function vanBookingLink(appName, platform, locale) {
  const localeKey = locale === "zh-tw" ? "zh-tw" : "en";
  return VAN_BOOKING_LINKS[appName][platform][localeKey];
}

export default Ember.Controller.extend({
  delivery: Ember.computed.alias("model.delivery"),
  contact: Ember.computed.alias("delivery.contact"),
  hasActiveGGVOrder: Ember.computed.alias("delivery.gogovanOrder.isActive"),
  messageBox: Ember.inject.service(),
  cordova: Ember.inject.service(),
  i18n: Ember.inject.service(),
  isDonorApp: Ember.computed.alias("session.isDonorApp"),

  user: Ember.computed(function() {
    var userId =
      this.get("model.createdBy.id") || this.session.get("currentUser.id");
    return this.store.peekRecord("user", userId);
  }).volatile(),

  userName: Ember.computed("contact.name", "user.fullName", function() {
    return this.get("contact.name") || this.get("user.fullName");
  }),

  userMobile: Ember.computed("contact.mobile", "user.mobile", function() {
    return this.get("contact.mobile") || this.get("user.mobile");
  }),

  district: Ember.computed(
    "contact.address.district.name",
    "user.address.district.name",
    function() {
      return (
        this.get("contact.address.district.name") ||
        this.get("user.address.district.name")
      );
    }
  ),

  locale: Ember.computed.alias("session.language"),

  vanBookingPlatform: Ember.computed(function() {
    var cordova = this.get("cordova");
    if (cordova.isIOS()) {
      return "ios";
    }
    return cordova.isAndroid() ? "android" : "web";
  }),

  gogoxLink: Ember.computed("locale", "vanBookingPlatform", function() {
    return vanBookingLink(
      "gogox",
      this.get("vanBookingPlatform"),
      this.get("locale")
    );
  }),
  lalamoveLink: Ember.computed("locale", "vanBookingPlatform", function() {
    return vanBookingLink(
      "lalamove",
      this.get("vanBookingPlatform"),
      this.get("locale")
    );
  }),

  actions: {
    handleBrokenImage() {
      this.get("model.reviewedBy").set("hasImage", null);
    },

    cancelDelivery() {
      if (this.get("hasActiveGGVOrder")) {
        // this.set('cancelBooking', true);
        this.transitionToRoute(
          "delivery.cancel_booking",
          this.get("delivery")
        ).then(newRoute => newRoute.controller.set("isCancel", true));
      } else {
        this.send("removeDelivery", this.get("delivery"));
      }
    },

    modifyBooking() {
      if (this.get("hasActiveGGVOrder")) {
        this.transitionToRoute(
          "delivery.cancel_booking",
          this.get("delivery")
        ).then(newRoute => newRoute.controller.set("isCancel", false));
      } else {
        this.transitionToRoute(
          "offer.plan_delivery",
          this.get("delivery.offer"),
          { queryParams: { modify: true } }
        );
      }
    },
    /* jshint ignore:start */
    removeDelivery(delivery) {
      var _this = this;
      var message = this.get("i18n")
        .t("delete_confirm")
        .toString();
      if (delivery.get("isSelfArrangedVan")) {
        message +=
          " " +
          this.get("i18n").t("self_arranged_van.confirmed.cancel_reminder");
      }

      this.get("messageBox").custom(
        message,
        this.get("i18n").t("delivery.cancel.cancel_transport"),
        () => {
          var loadingView = _this.container
            .lookup("component:loading")
            .append();
          var offer = delivery.get("offer");

          delivery.deleteRecord();
          delivery
            .save()
            .then(function() {
              offer.set("state", "reviewed");
              var route = _this.get("session.isAdminApp")
                ? "review_offer"
                : "offer.offer_details";
              _this.transitionToRoute(route, offer);
            })
            .finally(() => loadingView.destroy());
        },
        this.get("i18n").t("not_now"),
        null
      );
    }
    /* jshint ignore:end */
  }
});
