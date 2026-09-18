import Ember from "ember";
import config from "../config/environment";

export default Ember.Component.extend({
  cordova: Ember.inject.service(),

  foundation: null,

  currentClassName: Ember.computed("className", function() {
    return this.get("className") ? `.${this.get("className")}` : document;
  }),

  click() {
    Ember.run.later(function() {
      if ($(".off-canvas-wrap.move-right")[0]) {
        config.cordova.enabled
          ? $("body").css({ position: "fixed", width: "100%" })
          : $("body").css("overflow", "hidden");
      } else {
        config.cordova.enabled
          ? $("body").css({ position: "inherit", width: "inherit" })
          : $("body").css("overflow", "auto");
      }
    }, 100);
  },

  didInsertElement() {
    var className = this.get("currentClassName");
    var _this = this;

    this._super();

    // iOS has no native mechanism reserving space for the status bar/notch, so the
    // WebView must be told to pad for it via env(safe-area-inset-top). Android is
    // deliberately excluded: cordova-android's native margin already reserves this
    // space (AndroidEdgeToEdge is off), and applying it again in CSS would double it.
    if (this.get("cordova").isIOS()) {
      Ember.$("body").css("padding-top", "env(safe-area-inset-top, 0px)");
    }

    Ember.run.debounce(
      this,
      function() {
        var clientHeight = $(window).height();
        $(".inner-wrap").css("min-height", clientHeight);
      },
      1000
    );

    Ember.run.scheduleOnce("afterRender", this, function() {
      var initFoundation = Ember.$(className).foundation({
        offcanvas: { close_on_click: true }
      });
      _this.set("foundation", initFoundation);
    });
  }

  // TODO: Breaks sometime on menu-bar
  // willDestroyElement() {
  //   this.get("foundation").foundation("destroy");
  // }
});
