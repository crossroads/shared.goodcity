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

      // Fixed header in iOS
      if (_this.get("cordova").isIOS()) {
        // Keep top:0 so the header's own background still covers the status bar
        // rect (otherwise scrolled content peeks through above it); push the
        // header's content down with padding instead, and grow height to match
        // since box-sizing is border-box. Android is deliberately excluded here -
        // cordova-android's native margin + statusBarView already handle this.
        Ember.$(".sticky_title_bar").css({
          "padding-top": "env(safe-area-inset-top, 0px)",
          height: "calc(3.125rem + env(safe-area-inset-top, 0px))"
        });

        // Header content area grew from 2.8125rem to 3.125rem (+0.3125rem) for more
        // breathing room around the title/back button - bump the matching content
        // offset below by the same delta so it still starts right where the header
        // ends. iOS-only, same reasoning as the header height change above.
        Ember.$(".item-messages").css("padding-top", "3.1125rem");
        Ember.$(".offer_messages_section").css("padding-top", "4.3125rem");

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
