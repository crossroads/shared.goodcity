import { test, moduleForModel } from "ember-qunit";
import Ember from "ember";

moduleForModel("offer", "Offer Model", {
  needs: [
    "model:gogovanTransport",
    "model:crossroadsTransport",
    "model:cancellationReason",
    "model:item",
    "model:image",
    "model:message",
    "model:delivery",
    "model:company",
    "model:user",
    "model:district",
    "service:i18n",
    "service:cloudinaryUtils"
  ]
});

test("check attributes", function(assert) {
  assert.expect(22);
  var model = this.subject();

  var userPhone = Object.keys(model.toJSON()).indexOf("userPhone") > -1;
  var userName = Object.keys(model.toJSON()).indexOf("userName") > -1;
  var inactiveAt = Object.keys(model.toJSON()).indexOf("inactiveAt") > -1;
  var cancelReason = Object.keys(model.toJSON()).indexOf("cancelReason") > -1;
  var startReceivingAt =
    Object.keys(model.toJSON()).indexOf("startReceivingAt") > -1;
  var deliveredBy = Object.keys(model.toJSON()).indexOf("deliveredBy") > -1;
  var reviewCompletedAt =
    Object.keys(model.toJSON()).indexOf("reviewCompletedAt") > -1;
  var receivedAt = Object.keys(model.toJSON()).indexOf("receivedAt") > -1;
  var reviewedAt = Object.keys(model.toJSON()).indexOf("reviewedAt") > -1;
  var state_event = Object.keys(model.toJSON()).indexOf("state_event") > -1;
  var cancelledAt = Object.keys(model.toJSON()).indexOf("cancelledAt") > -1;
  var submittedAt = Object.keys(model.toJSON()).indexOf("submittedAt") > -1;
  var updatedAt = Object.keys(model.toJSON()).indexOf("updatedAt") > -1;
  var createdAt = Object.keys(model.toJSON()).indexOf("createdAt") > -1;
  var notes = Object.keys(model.toJSON()).indexOf("notes") > -1;
  var estimatedSize = Object.keys(model.toJSON()).indexOf("estimatedSize") > -1;
  var saleable = Object.keys(model.toJSON()).indexOf("saleable") > -1;
  var parking = Object.keys(model.toJSON()).indexOf("parking") > -1;
  var stairs = Object.keys(model.toJSON()).indexOf("stairs") > -1;
  var origin = Object.keys(model.toJSON()).indexOf("origin") > -1;
  var state = Object.keys(model.toJSON()).indexOf("state") > -1;
  var language = Object.keys(model.toJSON()).indexOf("language") > -1;

  assert.ok(language);
  assert.ok(state);
  assert.ok(origin);
  assert.ok(stairs);
  assert.ok(parking);
  assert.ok(saleable);
  assert.ok(estimatedSize);
  assert.ok(notes);
  assert.ok(createdAt);
  assert.ok(updatedAt);
  assert.ok(submittedAt);
  assert.ok(cancelledAt);
  assert.ok(state_event);
  assert.ok(reviewedAt);
  assert.ok(receivedAt);
  assert.ok(reviewCompletedAt);
  assert.ok(deliveredBy);
  assert.ok(startReceivingAt);
  assert.ok(cancelReason);
  assert.ok(inactiveAt);
  assert.ok(userName);
  assert.ok(userPhone);
});

test("Relationships with other models", function(assert) {
  assert.expect(14);

  var offer = this.store().modelFor("offer");
  var relationshipsWithGgvTransport = Ember.get(
    offer,
    "relationshipsByName"
  ).get("gogovanTransport");
  var relationshipsWithCrossroadsTransport = Ember.get(
    offer,
    "relationshipsByName"
  ).get("crossroadsTransport");
  var relationshipsWithCancellationReason = Ember.get(
    offer,
    "relationshipsByName"
  ).get("cancellationReason");
  var relationshipsWithDelivery = Ember.get(offer, "relationshipsByName").get(
    "delivery"
  );
  var relationshipsWithUser = Ember.get(offer, "relationshipsByName").get(
    "createdBy"
  );
  var relationshipsWithItem = Ember.get(offer, "relationshipsByName").get(
    "items"
  );
  var relationshipsWithMessage = Ember.get(offer, "relationshipsByName").get(
    "messages"
  );

  assert.equal(relationshipsWithMessage.key, "messages");
  assert.equal(relationshipsWithMessage.kind, "hasMany");

  assert.equal(relationshipsWithItem.key, "items");
  assert.equal(relationshipsWithItem.kind, "hasMany");

  assert.equal(relationshipsWithUser.key, "createdBy");
  assert.equal(relationshipsWithUser.kind, "belongsTo");

  assert.equal(relationshipsWithDelivery.key, "delivery");
  assert.equal(relationshipsWithDelivery.kind, "belongsTo");

  assert.equal(relationshipsWithCancellationReason.key, "cancellationReason");
  assert.equal(relationshipsWithCancellationReason.kind, "belongsTo");

  assert.equal(relationshipsWithCrossroadsTransport.key, "crossroadsTransport");
  assert.equal(relationshipsWithCrossroadsTransport.kind, "belongsTo");

  assert.equal(relationshipsWithGgvTransport.key, "gogovanTransport");
  assert.equal(relationshipsWithGgvTransport.kind, "belongsTo");
});
