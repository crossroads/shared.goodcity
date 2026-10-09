import Ember from "ember";
import DS from "ember-data";
const { getOwner } = Ember;

var attr = DS.attr,
  belongsTo = DS.belongsTo;

export default DS.Model.extend({
  body: attr("string"),
  isPrivate: attr("boolean"),
  createdAt: attr("date"),
  updatedAt: attr("date"),
  offerId: attr("string"),
  itemId: attr("string"),
  state: attr("string", { defaultValue: "read" }),
  sender: belongsTo("user", { async: false }),
  item: belongsTo("item", { async: false }),
  offer: belongsTo("offer", { async: false }),

  messageableType: attr("string"),
  messageableId: attr("string"),
  unreadCount: attr("string"),

  myMessage: Ember.computed(function() {
    var session = getOwner(this).lookup("service:session");
    return this.get("sender.id") === session.get("currentUser.id");
  }),

  isMessage: Ember.computed("this", function() {
    return true;
  }),

  parsedBody: Ember.computed("body", function() {
    let body = this.get("body");
    body = body.replace(/(<br>)/gm, "\n");
    body = body.replace(/(<)/g, "&lt;");

    // Only match an href with no whitespace, so an attacker cannot smuggle
    // extra attributes (e.g. an onmouseover handler) into the rebuilt anchor.
    let hrefExpressionMatch = body.match(
      /\&lt;a href=([^\s>]*?)\>(.*?)\&lt;\/a\s*?\>/
    );
    if (hrefExpressionMatch) {
      body = this.sanitizingAnchorLinks(body, hrefExpressionMatch);
    }
    return body;
  }),

  // Re-enable ONLY the two links the app itself generates (see
  // message-link-convertor): a relative plan-delivery link and the donor
  // survey form. The href is matched against the exact generated shapes, so
  // a body stored through the API directly cannot inject a `javascript:` or
  // off-site link, and the visible text is HTML-escaped. See issue OA-54.
  sanitizingAnchorLinks(body, hrefExpressionMatch) {
    let originalLink = hrefExpressionMatch[0];
    let anchorLink = hrefExpressionMatch[1];
    let text = hrefExpressionMatch[2];
    let href = anchorLink.replace(/^['"]|['"]$/g, "");
    let isSafe =
      /^\/offers\/\d+\/plan_delivery$/.test(href) ||
      href.indexOf(
        "https://crossroads-foundation.formstack.com/forms/goods_donor_survey?field"
      ) === 0;
    if (isSafe) {
      let safeText = Ember.Handlebars.Utils.escapeExpression(text);
      body = body.replace(originalLink, `<a href='${href}'>${safeText}</a>`);
    }
    return body;
  },

  createdDate: Ember.computed(function() {
    return new Date(this.get("createdAt")).toDateString();
  }),

  itemImageUrl: Ember.computed.alias("item.displayImageUrl"),
  isRead: Ember.computed.equal("state", "read"),
  isUnread: Ember.computed.equal("state", "unread")
});
