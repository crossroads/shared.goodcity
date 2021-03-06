import Ember from 'ember';

export default Ember.Component.extend({

  lightGallery: null,

  didInsertElement(){
    var _this = this;

    this._super();

    Ember.run.scheduleOnce('afterRender', this, function(){
      var lightGallery = Ember.$("#imageGallery").lightGallery({
        thumbnail: false,
        hideControlOnEnd: true,
        closable: false,
        counter: true,
        swipeThreshold : 50,
        enableTouch : true,
        selector: '.preview_image'
      });

      _this.set("lightGallery", lightGallery);

    });
  },

  willDestroyElement() {
    this.get("lightGallery").destroy();
  }

});
