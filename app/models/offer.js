import Ember from "ember";
import DS from "ember-data";

var attr = DS.attr,
  hasMany = DS.hasMany,
  belongsTo = DS.belongsTo;

function createCounterOf(collection, opts = {}) {
  let { filter, fallbackProp } = opts;
  let computer = function() {
    let records = this.get(collection);
    let hasRecords = records && records.length;

    if (!hasRecords) {
      return fallbackProp ? this.getWithDefault(fallbackProp, 0) : 0;
    }
    if (filter) {
      let [key, value] = filter;
      records = records.filterBy(key, value);
    }
    return records.length;
  };

  if (fallbackProp) {
    return Ember.computed(fallbackProp, `${collection}.@each.state`, computer);
  }
  return Ember.computed(`${collection}.@each.state`, computer);
}

export default DS.Model.extend({
  cloudinaryUtils: Ember.inject.service(),

  language: attr("string"),
  state: attr("string", { defaultValue: "draft" }),
  origin: attr("string"),
  stairs: attr("boolean"),
  parking: attr("boolean"),
  saleable: attr("boolean"),
  isShared: attr("boolean"),
  estimatedSize: attr("string"),
  notes: attr("string"),
  createdById: attr("string"),
  createdAt: attr("date"),
  updatedAt: attr("date"),
  submittedAt: attr("date"),
  cancelledAt: attr("date"),
  state_event: attr("string"),
  reviewedAt: attr("date"),
  receivedAt: attr("date"),
  reviewCompletedAt: attr("date"),
  deliveredBy: attr("string"),
  startReceivingAt: attr("date"),
  cancelReason: attr("string"),
  inactiveAt: attr("date"),
  displayImageCloudinaryId: attr("string"),
  companyId: attr("string"),
  sharing_expires_at: attr("string"),
  districtId: attr("string"),
  district: belongsTo("district", { async: false }),

  gogovanTransport: belongsTo("gogovan_transport", { async: false }),
  crossroadsTransport: belongsTo("crossroads_transport", { async: false }),
  cancellationReason: belongsTo("cancellation_reason", { async: false }),
  company: belongsTo("company", { async: false }),

  items: hasMany("item", { async: false }),
  messages: hasMany("message", { async: true }),

  delivery: belongsTo("delivery", { async: false }),
  createdBy: belongsTo("user", { async: false }),
  reviewedBy: belongsTo("user", { async: false }),
  closedBy: belongsTo("user", { async: false }),
  receivedBy: belongsTo("user", { async: false }),

  // User details
  userName: attr("string"),
  userPhone: attr("string"),

  companyName: Ember.computed("company", function() {
    return this.get("company.name");
  }),

  crossroadsTruckCost: Ember.computed("crossroadsTransport", function() {
    return this.get("crossroadsTransport.cost");
  }),

  itemCount: Ember.computed("items.@each.state", function() {
    return this.get("items").rejectBy("state", "draft").length;
  }),

  packages: Ember.computed("items.@each.packages", function() {
    var res = [];
    this.get("items")
      .filterBy("state", "accepted")
      .forEach(i => (res = res.concat(i.get("packages").toArray())));
    return res;
  }),

  itemPackages: Ember.computed.alias("packages"),

  // Package types
  expectingPackagesCount: attr("number"),
  missingPackagesCount: attr("number"),
  receivedPackagesCount: attr("number"),
  computedExpectingPackageCount: createCounterOf("packages", {
    filter: ["state", "expecting"],
    fallbackProp: "expectingPackagesCount"
  }),
  computedMissingPackageCount: createCounterOf("packages", {
    filter: ["state", "missing"],
    fallbackProp: "missingPackagesCount"
  }),
  computedReceivedPackageCount: createCounterOf("packages", {
    filter: ["state", "received"],
    fallbackProp: "receivedPackagesCount"
  }),

  // Item types
  approvedItems: Ember.computed.filterBy("items", "state", "accepted"),
  rejectedItems: Ember.computed.filterBy("items", "state", "rejected"),
  submittedItems: Ember.computed.filterBy("items", "state", "submitted"),
  acceptedItemsCount: attr("number"),
  rejectedItemsCount: attr("number"),
  submittedItemsCount: attr("number"),
  computedSubmittedItemsCount: createCounterOf("submittedItems", {
    fallbackProp: "submittedItemsCount"
  }),
  computedApprovedItemsCount: createCounterOf("approvedItems", {
    fallbackProp: "acceptedItemsCount"
  }),
  computedRejectedItemsCount: createCounterOf("rejectedItems", {
    fallbackProp: "rejectedItemsCount"
  }),

  isDraft: Ember.computed.equal("state", "draft"),
  isInactive: Ember.computed.equal("state", "inactive"),
  isSubmitted: Ember.computed.equal("state", "submitted"),
  isScheduled: Ember.computed.equal("state", "scheduled"),
  isUnderReview: Ember.computed.equal("state", "under_review"),
  isReviewed: Ember.computed.equal("state", "reviewed"),
  isClosed: Ember.computed.equal("state", "closed"),
  isReceived: Ember.computed.equal("state", "received"),
  isReceiving: Ember.computed.equal("state", "receiving"),
  isCancelled: Ember.computed.equal("state", "cancelled"),
  preventNewItem: Ember.computed.alias("isFinished"),

  hasReceived: Ember.computed.or("isReceived", "isReceiving"),
  isReviewing: Ember.computed.or("isUnderReview", "isReviewed"),
  adminCurrentOffer: Ember.computed.or("isReviewing", "isScheduled"),
  nonSubmittedOffer: Ember.computed.or("isDraft", "isInactive"),
  closedOrCancelled: Ember.computed.or("isClosed", "isCancelled"),

  needReview: Ember.computed(
    "isUnderReview",
    "isSubmitted",
    "isClosed",
    function() {
      return (
        this.get("isUnderReview") ||
        this.get("isSubmitted") ||
        this.get("isClosed")
      );
    }
  ),

  isFinished: Ember.computed(
    "isClosed",
    "isReceived",
    "isCancelled",
    "isInactive",
    function() {
      return (
        this.get("isClosed") ||
        this.get("isReceived") ||
        this.get("isCancelled") ||
        this.get("isInactive")
      );
    }
  ),

  canMerged: Ember.computed(
    "isSubmitted",
    "isUnderReview",
    "isReviewed",
    function() {
      return (
        this.get("isSubmitted") ||
        this.get("isUnderReview") ||
        this.get("isReviewed")
      );
    }
  ),

  canReopen: Ember.computed("isClosed", "isCancelled", function() {
    return this.get("isClosed") || this.get("isCancelled");
  }),

  canResumeReceiving: Ember.computed("isReceived", function() {
    return this.get("isReceived");
  }),

  baseForMerge: Ember.computed(
    "isSubmitted",
    "isUnderReview",
    "isReviewed",
    "isScheduled",
    function() {
      return (
        this.get("isSubmitted") ||
        this.get("isUnderReview") ||
        this.get("isReviewed") ||
        this.get("isScheduled")
      );
    }
  ),

  activeItems: Ember.computed("items.@each.state", function() {
    return this.get("items").rejectBy("state", "draft");
  }),

  nonEmptyOffer: Ember.computed("items.[]", function() {
    return this.get("itemCount") > 0;
  }),

  allItemsReviewed: Ember.computed("items.@each.state", function() {
    var reviewedItems = this.get("activeItems").filterBy("state", "submitted");
    return reviewedItems.get("length") === 0;
  }),

  readyForSchedule: Ember.computed("state", "allItemsReviewed", function() {
    return (
      (this.get("isUnderReview") || this.get("isSubmitted")) &&
      this.get("allItemsReviewed")
    );
  }),

  allItemsRejected: Ember.computed(
    "items.@each.state",
    "needReview",
    function() {
      return (
        this.get("needReview") &&
        this.get("computedRejectedItemsCount") === this.get("itemCount")
      );
    }
  ),

  displayImageUrl: Ember.computed(
    "displayImageCloudinaryId",
    "items.@each.displayImageUrl",
    function() {
      let dImageId = this.get("displayImageCloudinaryId");
      if (dImageId) {
        return this.get("cloudinaryUtils").generateThumbnailUrl(dImageId);
      }
      return (
        this.get("activeItems.firstObject.displayImageUrl") ||
        "assets/images/default_item.jpg"
      );
    }
  ),

  isCharitableSale: Ember.computed("saleable", function() {
    return this.get("saleable") ? this.locale("yes") : this.locale("no");
  }),

  isAccepted: Ember.computed(
    "isReviewed",
    "computedApprovedItemsCount",
    function() {
      return (
        this.get("computedApprovedItemsCount") > 0 && this.get("isReviewed")
      );
    }
  ),

  donor: Ember.computed("createdById", function() {
    return this.get("createdById") && this.get("createdBy");
  }),

  getOfferStatus(state) {
    switch (state) {
      case "draft":
        return this.locale("offers.index.complete_offer");
      case "under_review":
        return this.locale("offers.index.in_review");
      case "submitted":
        return this.locale("offers.index.awaiting_review");
      case "reviewed":
        return this.locale("offers.index.arrange_transport");
      case "scheduled":
        return this.scheduledStatus();
      case "closed":
        return this.locale("offers.index.closed");
      case "received":
        return this.locale("offers.index.received");
      case "receiving":
        return this.locale("offers.index.receiving");
      case "inactive":
        return this.locale("offers.index.inactive");
    }
  },

  status: Ember.computed("state", function() {
    var state = this.get("state");
    var status = this.getOfferStatus(state);
    return status;
  }),

  i18n: Ember.inject.service(),

  locale: function(text) {
    return this.get("i18n").t(text);
  },

  statusText: Ember.computed("status", "itemCount", function() {
    return this.get("nonSubmittedOffer")
      ? this.get("status")
      : this.get("status") +
          " (" +
          this.get("itemCount") +
          " " +
          this.locale("items_text") +
          ")";
  }),

  scheduledStatus: function() {
    var deliveryType = this.get("delivery.deliveryType");
    switch (deliveryType) {
      case "Gogovan":
        return this.get("gogovan_status");
      case "Drop Off":
        return this.locale("offers.index.drop_off");
      case "Alternate":
        return this.locale("offers.index.alternate");
      case "Self Arranged Van":
        return this.locale("offers.index.self_arranged_van");
    }
  },

  gogovan_status: Ember.computed("delivery.gogovanOrder.status", function() {
    var ggvStatus = this.get("delivery.gogovanOrder.status");
    switch (ggvStatus) {
      case "pending":
        return this.locale("offers.index.van_booked");
      case "active":
        return this.locale("offers.index.van_confirmed");
      case "completed":
        return this.locale("offers.index.picked_up");
    }
  }),

  isOffer: Ember.computed("this", function() {
    return this.get("constructor.modelName") === "offer";
  }),

  // unread offer-items messages
  unreadMessagesCount: Ember.computed("messages.@each.state", function() {
    return this.get("messages").filterBy("state", "unread").length;
  }),

  hasUnreadMessages: Ember.computed("unreadMessagesCount", function() {
    return this.get("unreadMessagesCount") > 0;
  }),

  // unread offer-messages
  unreadOfferMessages: Ember.computed("messages.@each.state", function() {
    return this.get("messages")
      .filterBy("state", "unread")
      .filterBy("item", null)
      .sortBy("createdAt");
  }),

  unreadOfferMessagesCount: Ember.computed("unreadOfferMessages", function() {
    var count = this.get("unreadOfferMessages.length");
    return count > 0 ? count : "";
  }),

  // unread offer-messages by donor
  hasUnreadDonorMessages: Ember.computed("unreadOfferMessages", function() {
    return (
      this.get("unreadOfferMessages").filterBy("isPrivate", false).length > 0
    );
  }),

  // unread offer-messages by supervisor-reviewer
  hasUnreadPrivateMessages: Ember.computed("unreadOfferMessages", function() {
    return (
      this.get("unreadOfferMessages").filterBy("isPrivate", true).length > 0
    );
  }),

  // recent offer message
  lastMessage: Ember.computed("messages.[]", function() {
    var messages = this.get("messages")
      .filterBy("item", null)
      .sortBy("createdAt");
    return messages.get("length") > 0 ? messages.get("lastObject") : null;
  }),

  hasCrossroadsTransport: Ember.computed("crossroadsTransport", function() {
    return (
      this.get("crossroadsTransport") &&
      this.get("crossroadsTransport.isVanAllowed")
    );
  }),

  hasGogovanTransport: Ember.computed("gogovanTransport", function() {
    return (
      this.get("gogovanTransport") && !this.get("gogovanTransport.disabled")
    );
  }),

  // display "General Messages Thread"
  displayGeneralMessages: Ember.computed("isDraft", "lastMessage", function() {
    return !(this.get("isDraft") && this.get("lastMessage") === null);
  }),

  // to sort on offer-details page for updated-offer and latest-message
  latestUpdatedTime: Ember.computed("lastMessage", function() {
    var value;
    switch (
      Ember.compare(this.get("lastMessage.createdAt"), this.get("updatedAt"))
    ) {
      case 0:
      case 1:
        value = this.get("lastMessage.createdAt");
        break;
      case -1:
        value = this.get("updatedAt");
        break;
    }
    return value;
  }),

  hasCompleteGGVOrder: Ember.computed(
    "delivery.gogovanOrder.status",
    function() {
      return (this.get("delivery.gogovanOrder.status") || "") === "completed";
    }
  ),

  showOfferIcons: Ember.computed(
    "hasCompleteGGVOrder",
    "itemCount",
    "isClosed",
    "hasReceived",
    function() {
      return (
        this.get("itemCount") > 0 &&
        !(this.get("isClosed") || this.get("hasReceived")) &&
        !this.get("hasCompleteGGVOrder")
      );
    }
  ),

  statusBarClass: Ember.computed("state", function() {
    var retState = "";
    if (this.get("isSubmitted")) {
      retState = "is-submitted";
    } else if (this.get("isUnderReview")) {
      retState = "is-under-review";
    } else if (this.get("isReviewed")) {
      retState = "is-reviewed";
    } else if (this.get("isScheduled")) {
      retState = "is-scheduled";
    } else if (this.get("isClosed")) {
      retState = "is-closed";
    } else if (this.get("hasReceived")) {
      retState = "is-received";
    }
    return retState;
  }),

  showDeliveryDetails: Ember.computed("state", function() {
    return (
      this.get("isScheduled") ||
      this.get("isReceived") ||
      this.get("isReceiving")
    );
  }),

  hideBookingModification: Ember.computed.alias(
    "delivery.gogovanOrder.isCompleted"
  ),

  allPackagesMissing: Ember.computed(
    "state",
    "items.@each.state",
    "packages.@each.state",
    function() {
      return (
        !this.get("allItemsRejected") &&
        this.get("allItemsReviewed") &&
        this.get("state") !== "received" &&
        this.get("packages.length") > 0 &&
        this.get("packages")
          .filter(
            p => !p.get("item.isRejected") && p.get("state") === "missing"
          )
          .get("length") === this.get("packages.length")
      );
    }
  ),

  readyForClosure: Ember.computed("state", "packages.@each.state", function() {
    return (
      !this.get("allItemsRejected") &&
      this.get("allItemsReviewed") &&
      this.get("state") !== "received" &&
      this.get("packages.length") > 0 &&
      this.get("packages")
        .filter(
          p => !p.get("item.isRejected") && p.get("state") === "expecting"
        )
        .get("length") === 0
    );
  }),

  timeDetail: Ember.computed("state", "delivery", function() {
    var prefix = "",
      suffix = "",
      date;

    if (this.get("isSubmitted")) {
      prefix = this.locale("submitted");
      date = this.get("submittedAt");
    } else if (this.get("isUnderReview")) {
      prefix = this.get("i18n").t("review_offer.review_started_by", {
        firstName: this.get("reviewedBy.firstName"),
        lastName: this.get("reviewedBy.lastName")
      });
      date = this.get("reviewedAt");
    } else if (this.get("isReviewed")) {
      prefix = this.locale("review_offer.reviewed");
      date = this.get("reviewCompletedAt");
      suffix = this.locale("review_offer.plan_transport");
    } else if (this.get("isClosed")) {
      prefix = this.get("i18n").t("offer.closed_by", {
        firstName: this.get("closedBy.firstName"),
        lastName: this.get("closedBy.lastName")
      });
      date = this.get("reviewCompletedAt");
    } else if (this.get("isCancelled")) {
      prefix = this.get("i18n").t("offer.cancelled_by", {
        firstName: this.get("closedBy.firstName"),
        lastName: this.get("closedBy.lastName")
      });
      date = this.get("cancelledAt");
    } else if (this.get("isReceived")) {
      prefix = this.get("i18n").t("offer.received_by", {
        firstName: this.get("closedBy.firstName"),
        lastName: this.get("closedBy.lastName")
      });
      date = this.get("receivedAt");
    } else if (this.get("isReceiving")) {
      prefix = this.get("i18n").t("offer.offer_details.start_receiving_by", {
        firstName: this.get("receivedBy.firstName"),
        lastName: this.get("receivedBy.lastName")
      });
      date = this.get("startReceivingAt");
    } else if (this.get("isInactive")) {
      prefix = this.get("i18n").t("offer.offer_details.inactive");
      date = this.get("inactiveAt");
    } else if (this.get("isScheduled")) {
      if (this.get("delivery.isAlternate")) {
        prefix = this.locale("offer.offer_details.is_collection");
      } else if (this.get("delivery.isDropOff")) {
        prefix = this.locale("offer.offer_details.is_drop_off");
      } else if (this.get("delivery.isSelfArrangedVan")) {
        prefix = this.locale("offer.offer_details.is_self_arranged_van");
      } else if (this.get("delivery.isGogovan")) {
        prefix = this.get("delivery.gogovanOrder.ggvOrderStatus");
      }

      if (this.get("delivery.isGogovan")) {
        if (this.get("delivery.completedWithGogovan")) {
          date = this.get("delivery.gogovanOrder.completedAt");
        } else {
          prefix = prefix + " " + this.get("delivery.schedule.slotName");
          date = this.get("delivery.schedule.scheduledAt");
        }
      } else {
        date = this.get("delivery.schedule.scheduledAt");
        suffix = this.get("delivery.schedule.dayTime");
      }
    }
    return { prefix: prefix, date: date, suffix: suffix };
  }),

  hideCancelOfferOption: Ember.computed(
    "state",
    "hasCompleteGGVOrder",
    function() {
      return (
        this.get("closedOrCancelled") ||
        this.get("isReceived") ||
        this.get("hasCompleteGGVOrder") ||
        this.get("isReceiving")
      );
    }
  ),

  hideInactiveOfferOption: Ember.computed(
    "state",
    "hasCompleteGGVOrder",
    function() {
      return (
        this.get("isFinished") ||
        this.get("hasCompleteGGVOrder") ||
        this.get("isReceiving")
      );
    }
  ),

  allowResubmit: Ember.computed("isCancelled", "allItemsReviewed", function() {
    return (
      (this.get("isCancelled") && !this.get("allItemsReviewed")) ||
      this.get("isInactive")
    );
  })
});
