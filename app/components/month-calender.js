import Ember from "ember";

// Handle time selection based on current time
// <select id="ember1325" required="">
//   <option value="">Time</option>
//   <option value="1">10:30am-12:30pm</option> => (630mins - 750mins)
//   <option value="2">2pm-4pm</option>  => (840mins - 960mins)
// </select>

export default Ember.TextField.extend({
  tagName: "input",
  classNames: "pickadate",
  attributeBindings: [
    "name",
    "type",
    "value",
    "id",
    "required",
    "pattern",
    "available",
    "placeholder"
  ],

  currentMinutes: function() {
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var total_mins = hours * 60 + minutes;
    return total_mins > 961 ? 961 : total_mins;
  },

  _currentDay: function() {
    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return currentDate;
  },

  _getValidDate: function(selectedDate) {
    var today = new Date();
    var currentDate = new Date();
    var selected = selectedDate;
    currentDate.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    return currentDate > selected ? today : selectedDate;
  },

  _setTimeSlots: function(date) {
    var selectedDate = date;
    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate.getTime() === currentDate.getTime()) {
      var total_mins = this.currentMinutes();
      var option;

      if (total_mins >= 750 && total_mins < 960) {
        option = Ember.$(".time_selector select option:eq(1)");
      } else if (total_mins >= 960) {
        option = Ember.$(".time_selector select option:eq(2)");
      }

      if (option && option.length > 0) {
        option.addClass("hidden");
        option[0].disabled = true;

        option.prevAll().each(function() {
          Ember.$(this).addClass("hidden");
          this.disabled = true;
        });
      }

      // Only drop the chosen time if it's no longer possible for this date.
      var select = Ember.$(".time_selector select");
      if (select.find("option:selected").prop("disabled")) {
        select.val("");
        var clearTime = this.get("on-clear-time");
        if (clearTime) {
          clearTime();
        }
      }
    } else {
      // Enable all select options
      Ember.$(".time_selector select option").each(function() {
        Ember.$(this).removeClass("hidden");
        this.disabled = false;
      });
    }
  },

  didInsertElement() {
    var _this = this;
    var list = this.get("available");
    var available_count = 0,
      available_array = [true];
    var setting = false;

    if (list) {
      available_count = list.length;
      for (var i = available_count - 1; i >= 0; i--) {
        var date = new Date(list[i]);
        var date_array = [];
        date_array.push(date.getFullYear());
        date_array.push(date.getMonth());
        date_array.push(date.getDate());
        available_array.push(date_array);
      }

      var firstDateArray = available_array.get("lastObject");
      var firstDate = new Date(
        firstDateArray[0],
        firstDateArray[1],
        firstDateArray[2]
      );
      var isTodayListed = _this._currentDay().getTime() === firstDate.getTime();
      if (_this.currentMinutes() === 961 && isTodayListed) {
        available_array.pop();
      }
    }

    Ember.run.scheduleOnce("afterRender", this, function() {
      Ember.$(".pickadate").pickadate({
        format: "ddd mmm d",
        monthsFull: moment.months(),
        monthsShort: moment.monthsShort(),
        weekdaysShort: moment.weekdaysShort(),
        disable: available_array,
        clear: false,
        today: false,
        close: false,
        min: available_array[available_array.length - 1],
        max: available_array[1],

        onClose: function() {
          Ember.$(document.activeElement).blur();
          if (setting) {
            return;
          }
          var date = this.get("select") && this.get("select").obj;

          if (date) {
            _this.set("selection", date);

            setting = true;
            Ember.run.next(() => {
              this.set("select", new Date(date), { format: "ddd mmm d" });
              setting = false;
            });
            _this._setTimeSlots(date);
          }
        },

        onStart: function() {
          var date = _this.get("selection");
          if (date) {
            date = _this._getValidDate(date);
            this.set("select", new Date(date), { format: "ddd mmm d" });
            _this._setTimeSlots(date);
          }
        }
      });

      validateForm();
      validateInputs();
      closeOnClick();
    });

    function closeOnClick() {
      Ember.$(".picker__holder").click(function(e) {
        if (e.target !== this) {
          return;
        }
        Ember.$("#selectedDate").trigger("blur");
      });
    }

    function validateForm() {
      Ember.$(".button.drop_off").click(function() {
        var date = checkInput(Ember.$("#selectedDate"));
        var time = checkInput(Ember.$(".time_selector select"));
        return date && time;
      });
    }

    function validateInputs() {
      Ember.$("#selectedDate").focus(function() {
        return removeHighlight(this);
      });
      Ember.$(".time_selector select").focus(function() {
        return removeHighlight(this);
      });
    }

    function checkInput(element) {
      var parent = Ember.$(element).parent();
      var value = Ember.$(element).val();

      if (value === undefined || value.length === 0) {
        parent.addClass("has-error");
        return false;
      } else {
        parent.removeClass("has-error");
        return true;
      }
    }

    function removeHighlight(element) {
      var parent = Ember.$(element).parent();
      parent.removeClass("has-error");
    }
  }
});
