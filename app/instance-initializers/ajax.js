import AjaxPromise from "../utils/ajax-promise";

export default {
  name: "ajax",
  initialize: function(app) {
    const { container = app } = app;
    const adapter = container.lookup("adapter:application");

    AjaxPromise.setDefaultHeaders(() => adapter.get("headers"));
  }
};
