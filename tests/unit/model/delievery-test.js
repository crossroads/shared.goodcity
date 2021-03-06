import { test, moduleForModel } from 'ember-qunit';
import Ember from 'ember';

moduleForModel('delivery', 'Delivery Model', {
  needs: ['model:offer', 'model:contact', 'model:schedule', 'model:gogovan_order']
});

test('check attributes', function(assert){
  assert.expect(3);
  var model = this.subject();
  var start = Object.keys(model.toJSON()).indexOf('start') > -1;
  var finish = Object.keys(model.toJSON()).indexOf('finish') > -1;
  var deliveryType = Object.keys(model.toJSON()).indexOf('deliveryType') > -1;

  assert.ok(start);
  assert.ok(finish);
  assert.ok(deliveryType);
});

test('Relationships with other models', function(assert){
  assert.expect(8);

  var delivery = this.store().modelFor('delivery');
  var relationshipWithOffer = Ember.get(delivery, 'relationshipsByName').get('offer');
  var relationshipWithContact = Ember.get(delivery, 'relationshipsByName').get('contact');
  var relationshipWithSchedule = Ember.get(delivery, 'relationshipsByName').get('schedule');
  var relationshipWithGogovanOrder = Ember.get(delivery, 'relationshipsByName').get('gogovanOrder');


  assert.equal(relationshipWithOffer.key, 'offer');
  assert.equal(relationshipWithOffer.kind, 'belongsTo');

  assert.equal(relationshipWithContact.key, 'contact');
  assert.equal(relationshipWithContact.kind, 'belongsTo');

  assert.equal(relationshipWithSchedule.key, 'schedule');
  assert.equal(relationshipWithSchedule.kind, 'belongsTo');

  assert.equal(relationshipWithGogovanOrder.key, 'gogovanOrder');
  assert.equal(relationshipWithGogovanOrder.kind, 'belongsTo');
});

test('computed property: isGogovan', function(assert){
  assert.expect(1);
  var delivery = this.subject({deliveryType: "Gogovan"});
  assert.equal(delivery.get('isGogovan'), true);
});

test('computed property: isDropOff', function(assert){
  assert.expect(1);
  var delivery = this.subject({deliveryType: "Drop Off"});
  assert.equal(delivery.get('isDropOff'), true);
});

test('computed property: isAlternate', function(assert){
  assert.expect(1);
  var delivery = this.subject({deliveryType: "Alternate"});
  assert.equal(delivery.get('isAlternate'), true);
});

test('computed property: noDropOff', function(assert){
  assert.expect(1);
  var delivery = this.subject({deliveryType: "Alternate"});
  assert.equal(delivery.get('noDropOff'), true);
});

test('computed property: noGogovan', function(assert){
  assert.expect(1);
  var delivery = this.subject({deliveryType: "Alternate"});
  assert.equal(delivery.get('noGogovan'), true);
});

test('Delivery is a valid ember-data Model', function(assert){
  assert.expect(3);

  var store = this.store();
  var record = null;
  var date = new Date("2015/03/25");

  Ember.run(function(){
    store.createRecord('delivery', { id: 1, start: date, finish: date, deliveryType: 'Gogovan' });
    record = store.peekRecord('delivery', 1);
  });

  assert.equal(record.get('deliveryType'), 'Gogovan');
  assert.equal(record.get('start'), date);
  assert.equal(record.get('finish'), date);
});

