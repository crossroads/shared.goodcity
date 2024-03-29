import Ember from "ember";
import config from '../config/environment';
import AjaxPromise from '../utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Service.extend({
  session: Ember.inject.service(),
  logger: Ember.inject.service(),
  store: Ember.inject.service(),
  messagesUtil: Ember.inject.service("messages"),

  isAndroid() {
    if (!config.cordova.enabled || !window.device) {
      return;
    }
    return (
      ["android", "Android", "amazon-fireos"].indexOf(window.device.platform) >=
      0
    );
  },

  isIOS: function() {
    if (!config.cordova.enabled || !window.device) {
      return;
    }
    return window.device.platform === "iOS";
  },

  verifyIosNotificationSetting: function(onEnabled, onDisabled) {
    PushNotificationsStatus.isPushNotificationsEnabled(function(response) {
      response === "true" ? onEnabled() : onDisabled();
    }, function() {
      onEnabled();
    });
  },

  appLoad: function() {
    if (!config.cordova.enabled) {
      return;
    }
    this.initiatePushNotifications();
  },

  initiatePushNotifications: function() {

    var _this = this;

    function onDeviceReady() {

      var push = PushNotification.init({
        android: {
          icon: "notification",
          iconColor: "#002352"
        },
        ios: {
          alert: true,
          sound: true,
          badge: true
        }
      });

      push.on('registration', function(data) {
        sendToken(data.registrationId, platformCode());
      });

      push.on('notification', function(data) {
        if (!data.additionalData.foreground) {
          if (window.device.platform === "iOS") {
            processTappedNotification(data.additionalData.payload);
          } else {
            processTappedNotification(data.additionalData);
          }

        }
      });

      push.on("error", e => {
        console.log(e);
      });
    }

    function sendToken(handle, platform) {
      return new AjaxPromise("/auth/register_device", "POST", _this.get("session.authToken"), { handle: handle, platform: platform });
    }

    function platformCode() {
      var platform;
      if (_this.isAndroid()) {
        platform = "fcm";
      } else if (window.device.platform === "iOS") {
        platform = "aps";
      }
      return platform;
    }

    function processTappedNotification(payload) {
      var notifications = getOwner(_this).lookup("controller:notifications");
      if (payload.category === "incoming_call") {
        notifications.acceptCall(payload);
      }

      notifications.setRoute(payload);

      if (payload.category === "message") {
        var hasMessage = _this.get("store").peekRecord("message", payload.message_id);
        if (hasMessage) {
          notifications.transitionToRoute.apply(notifications, payload.route);
        } else {
          var loadingView = getOwner(_this).lookup('component:loading').append();
          var messageUrl = payload.item_id ? `/messages?item_id=${payload.item_id}` : `/messages?offer_id=${payload.offer_id}`;
          new AjaxPromise(messageUrl, "GET", _this.get("session.authToken"), {})
            .then(function(data) {
              _this.get("store").pushPayload(data);
              notifications.transitionToRoute.apply(notifications, payload.route);
            })
            .finally(() => loadingView.destroy());
        }
      } else {
        notifications.transitionToRoute.apply(notifications, payload.route);
      }
    }

    document.addEventListener('deviceready', onDeviceReady, true);

  }

});
