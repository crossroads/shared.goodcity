import Ember from 'ember';
import DS from 'ember-data';

var attr = DS.attr,
    belongsTo = DS.belongsTo;

export default DS.Model.extend({
  flat:        attr('string'),
  building:    attr('string'),
  street:      attr('string'),
  addressType: attr('string'),

  district:    belongsTo('district', { async: false }),

  addressableType: attr('string'),
  addressable: belongsTo('addressable', { polymorphic: true, async: false }),

  fullAddress: Ember.computed('flat','building','street', function() {
    var addressDetails = [this.get('flat'), this.get('building'), this.get('street')];
    addressDetails = Ember.isBlank(addressDetails.compact()) ? [this.get('district.name'), this.get('district.territory.name')] : addressDetails;
    // Donor-entered address lines are joined with <br> and rendered as a
    // SafeString, so escape each part to keep the layout break while treating
    // the content as text. See issue OA-54.
    var formattedAddress = addressDetails.compact().map(function(part) {
      return Ember.Handlebars.Utils.escapeExpression(part);
    }).join('<br>');
    return new Ember.Handlebars.SafeString(formattedAddress);
  }),

  regionDetails: Ember.computed('flat','building','street', function() {
    return [this.get('flat'), this.get('building'), this.get('street')].compact().join(" ");
  })
});
