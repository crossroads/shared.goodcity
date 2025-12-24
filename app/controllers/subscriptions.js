import config from "../config/environment";

const { getOwner } = Ember;

function run(func) {
  if (func) {
    func();
  }
}

export default Ember.Controller.extend(Ember.Evented, {
  notifications: Ember.inject.controller(),
  socket: null,
  lastOnline: Date.now(),
  deviceTtl: 0,
  deviceId: Math.random()
    .toString()
    .substring(2),
  logger: Ember.inject.service(),
  i18n: Ember.inject.service(),
  appName: config.APP.NAME,
  status: {
    online: false,
    hidden: true,
    text: ""
  },

  init() {
    this.customHandlers = {};
  },

  addHandler(type, fn) {
    this.customHandlers[type] = this.customHandlers[type] || [];
    this.customHandlers[type].push(fn);
  },

  applyCustomHandler(payload) {
    const { type } = payload;

    if (!type) return false;

    const handlers = this.customHandlers[type] || [];
    if (handlers.length === 0) {
      return false;
    }

    handlers.forEach(fn => fn(payload));
    return true;
  },

  updateStatus: Ember.observer("socket", function() {
    var socket = this.get("socket");
    var online = navigator.connection
      ? navigator.connection.type !== "none"
      : navigator.onLine;
    online = socket && socket.connected && online;
    var hidden =
      !this.session.get("isLoggedIn") ||
      (online &&
        config.environment === "production" &&
        config.staging !== true);
    var text = !online
      ? this.get("i18n").t("socket_offline_error")
      : "Online - " +
        this.session.get("currentUser.fullName") +
        " (" +
        socket.io.engine.transport.name +
        ")";
    this.set("status", { online: online, hidden: hidden, text: text });

    if (!this.session.get("currentUser.fullName") && online) {
      var currentUrl = getOwner(this)
        .lookup("router:main")
        .get("url");
      if (currentUrl === "/offline") {
        this.transitionToRoute("/");
      } else {
        window.location.reload();
      }
    }
  }),

  // resync if offline longer than deviceTtl
  checkdeviceTtl: Ember.observer("status.online", function() {
    var online = this.get("status.online");
    var deviceTtl = this.get("deviceTtl");
    if (
      online &&
      deviceTtl !== 0 &&
      Date.now() - this.get("lastOnline") > deviceTtl * 1000
    ) {
      this.resync();
    } else if (online === false) {
      this.set("lastOnline", Date.now());
    }
  }),

  initController: Ember.on("init", function() {
    this.set("status.text", this.get("i18n").t("offline_error"));
    var updateStatus = Ember.run.bind(this, this.updateStatus);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
  }),

  actions: {
    wire() {
      var updateStatus = Ember.run.bind(this, this.updateStatus);
      var connectUrl =
        config.APP.SOCKETIO_WEBSERVICE_URL +
        "?token=" +
        encodeURIComponent(this.session.get("authToken")) +
        "&deviceId=" +
        this.get("deviceId") +
        "&meta=appName:" +
        config.APP.NAME;
      // pass mutilple meta values by seperating '|' like this
      // "&meta=appName:" + config.APP.NAME +"|version:" + config.APP.NAME;

      var socket = io(connectUrl, { autoConnect: false, forceNew: true });
      this.set("socket", socket);
      socket.on("connect", function() {
        updateStatus();
        socket.io.engine.on("upgrade", updateStatus);
      });
      socket.on("disconnect", updateStatus);
      socket.on(
        "error",
        Ember.run.bind(this, function(reason) {
          // ignore xhr post error related to no internet connection
          if (
            typeof reason !== "object" ||
            (reason.type !== "TransportError" &&
              reason.message !== "xhr post error")
          ) {
            if (reason.indexOf("Auth") === 0) {
              this.transitionToRoute("login");
            } else {
              this.get("logger").error(reason);
            }
          }
        })
      );
      socket.on("notification", Ember.run.bind(this, this.notification));
      socket.on("update_store", Ember.run.bind(this, this.update_store));
      socket.on("_batch", Ember.run.bind(this, this.batch));
      socket.on("_resync", Ember.run.bind(this, this.resync));
      socket.on(
        "_settings",
        Ember.run.bind(this, function(settings) {
          this.set("deviceTtl", settings.device_ttl);
          this.set("lastOnline", Date.now());
        })
      );
      socket.connect(); // manually connect since it's not auto-connecting if you logout and then back in
    },

    unwire() {
      var socket = this.get("socket");
      if (socket) {
        socket.close();
        this.set("socket", null);
      }
    },

    unloadNotifications() {
      this.get("notifications").send("unloadNotifications");
    }
  },

  batch: function(events, success) {
    events.forEach(function(args) {
      var event = args[0];
      this[event].apply(this, args.slice(1));
    }, this);

    run(success);
  },

  resync: function() {
    if (!navigator.onLine) {
      return false;
    }
    var offer_params = this.get("session.isAdminApp")
      ? { states: ["nondraft"] }
      : { states: ["for_donor"] };
    this.store.query("offer", offer_params);
  },

  notification: function(data, success) {
    data.date = new Date(data.date);
    this.get("notifications.model").pushObject(data);
    run(success);
  },

  onError(e) {
    console.error("Live update error", e);
    this.get("logger").notifyErrorCollector(e);
  },

  // each action below is an event in a channel
  update_store: function(data, success) {
    try {
      this.processStoreEvent(data, success);
    } catch (e) {
      this.onError(e);
    }
  },

  processStoreEvent: function(data, success) {
    if (this.applyCustomHandler(data)) {
      run(success);
      return;
    }

    this.store.pushPayload(data.sender);

    var type = Object.keys(data.item)[0];

    var pkg;
    if (type === "Package") {
      pkg = data.item.Package;
    } else if (type === "package") {
      pkg = data.item.package;
    }

    if (this.get("appName") === "admin.goodcity") {
      if (type.toLowerCase() === "designation") {
        this.store.pushPayload(data.item);
        return false;
      }
      if (
        (type === "Package" || type === "package") &&
        pkg &&
        pkg.packages_location_ids
      ) {
        type === "Package"
          ? (data.item.Package.packages_location_ids = pkg.packages_location_ids.compact())
          : (data.item.package.packages_location_ids = pkg.packages_location_ids.compact());
      }
    }

    if (this.get("appName") === "app.goodcity") {
      if (type.toLowerCase() === "designation") {
        return false;
      }
      if (
        (type === "Item" && data.item.Item && data.item.Item.message_ids) ||
        (type === "Offer" && data.item.Offer && data.item.Offer.message_ids)
      ) {
        var message_ids =
          type === "Item"
            ? data.item.Item.message_ids
            : data.item.Offer.message_ids;
        message_ids.forEach(msgId => {
          if (msgId) {
            var msg = this.store.peekRecord("message", msgId);
            if (!msg) {
              type === "Item"
                ? data.item.Item.message_ids.removeObject(msgId)
                : data.item.Offer.message_ids.removeObject(msgId);
            }
          }
        });
        type === "Item"
          ? (data.item.Item.message_ids = data.item.Item.message_ids.compact())
          : (data.item.Offer.message_ids = data.item.Offer.message_ids.compact());
      }
    }
    // use extend to make a copy of data.item[type] so object is not normalized for use by
    // messagesUtil in mark message read code below
    var item = Ember.$.extend({}, data.item[type]);
    this.store.normalize(type, item);

    if (type.toLowerCase() === "designation") {
      this.store.pushPayload(data.item);
      return false;
    }

    var existingItem = this.store.peekRecord(type, item.id);

    // update_store message is sent before response to APP save so ignore
    var fromCurrentUser =
      parseInt(data.sender?.user?.id, 10) ===
      parseInt(this.session.get("currentUser.id"), 10);
    var hasNewItemSaving = this.store.peekAll(type).any(function(o) {
      return o.id === null && o.get("isSaving");
    });
    var existingItemIsSaving = existingItem && existingItem.get("isSaving"); // isSaving is true during delete as well
    if (
      fromCurrentUser &&
      ((data.operation === "create" && hasNewItemSaving) ||
        existingItemIsSaving)
    ) {
      run(success);
      return;
    }

    if (data.operation === "update" && !existingItem) {
      this.store.findRecord(type, item.id).catch(this.onError.bind(this));
    } else if (["create", "update"].indexOf(data.operation) >= 0) {
      var payload = {};
      payload[type] = item;
      this.store.pushPayload(payload);
    } else if (existingItem) {
      //delete
      this.store.unloadRecord(existingItem);
    }

    this.trigger(`${data.operation}:${type}`, item);

    run(success);
  }
});
