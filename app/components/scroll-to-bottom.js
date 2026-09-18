import Ember from "ember";
export default Ember.Component.extend({
  cordova: Ember.inject.service(),

  didInsertElement() {
    var _this = this;
    this._super();

    Ember.run.scheduleOnce("afterRender", this, function() {
      // Scroll back to page-top on back-click
      Ember.$(".sticky_title_bar").on("click", ".back", function() {
        window.scrollTo(0, 0);
      });

      // Stick Notification bell icon in header
      if (Ember.$(".sticky_title_bar").length > 0) {
        Ember.$(".all_unread_messages_count").addClass("fixed_to_header");
      }

      // The message bar is absolutely positioned so we need to ensure we add in some padding
      //   for phone notches in iOS. cordova-android takes care of this already.
      if (_this.get("cordova").isIOS()) {
        Ember.$(".tab-bar").css({
          height: "calc(env(safe-area-inset-top, 0px) + 2.8125rem)"
        });

        Ember.$(".sticky_title_bar").css({
          "padding-top": "env(safe-area-inset-top, 0px)"
        });

        Ember.$(
          ".sticky_title_bar .tab-bar-section, .sticky_title_bar .left-small, .sticky_title_bar .right-small"
        ).css({
          "padding-top": "env(safe-area-inset-top, 0px)"
        });

        Ember.$("textarea").on("touchstart", function() {
          Ember.$(".sticky_title_bar").css({ position: "absolute" });
        });

        Ember.$("textarea").on("blur", function() {
          Ember.$(".sticky_title_bar").css({ position: "fixed" });
        });
      }
    });

    Ember.run.scheduleOnce("afterRender", this, function() {
      var messageBox, id, scrollOffset;
      var hadUnread =
        Ember.$(".hidden.unread_id") &&
        Ember.$(".hidden.unread_id").attr("data-name");

      // Scroll to first unread message in thread
      if (Ember.$(".unread.received_message:first").length > 0) {
        id = Ember.$(".unread.received_message:first").attr("id");
        messageBox = Ember.$(`#${id}`);
        scrollOffset = messageBox.offset().top - 100;
      } else {
        // scroll to bottom
        if (Ember.$(".message-textbar").length > 0) {
          scrollOffset = Ember.$(document).height();
        }
      }

      var screenHeight = document.documentElement.clientHeight;
      var pageHeight = document.documentElement.scrollHeight;

      if (scrollOffset && !hadUnread && pageHeight > screenHeight) {
        window.scrollTo(0, scrollOffset);
      }

      Ember.$(".hidden.unread_id").attr("data-name", id || 0);
      return true;
    });
  },

  willDestroyElement() {
    Ember.$(".all_unread_messages_count").removeClass("fixed_to_header");
  }
});
