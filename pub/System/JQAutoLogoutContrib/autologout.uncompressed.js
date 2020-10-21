/*
 * AutoLogout 1.10
 *
 * Copyright (c) 2018-2020 Michael Daum https://michaeldaumconsulting.com
 *
 * Licensed under the GPL license http://www.gnu.org/licenses/gpl.html
 *
 */

"use strict";
(function($) {

  // create the defaults once
  var defaults = {
    events: "click mousemove scroll keypress",
    enableIf: null,
    disableIf: null,
    idleTimeout: 900, // 15 minutes
    countdown: 10,
    logoutUrl: null,
    localStorageId: "jqAutoLogout.activityTime"
  };

  // the actual plugin constructor
  function AutoLogout(elem, opts) {
    var self = this;

    self.elem = $(elem);
    self.countdown = self.elem.find(".jqAutoLogoutCounter");
    self.opts = $.extend({}, defaults, self.elem.data(), opts);

    if (self.isEnabled()) {
      self.init();
      console && console.info("### starting auto logout ###"); // eslint-disable-line no-console
    } else {
      console && console.info("### NOT starting auto logout ###"); // eslint-disable-line no-console
    }
  }

  // init events and timers
  AutoLogout.prototype.init = function () {
    var self = this;

    $(document).on(self.opts.events, function() {
      if (self.elem.dialog("isOpen")) {
        self.elem.dialog("close");
      }
      self.setActivityTime();
    });

    self.elem.on("dialogopen", function() {
      self.tickCountdown(self.opts.countdown);
    });

    self.elem.on("dialogclose", function() {
      self.startTimer();
    });

    //console.log("opts=",self.opts);

    self.startTimer();
  };

  // test whether autologout is enabled
  AutoLogout.prototype.isEnabled = function() {
    var self = this;

    if (self.opts.idleTimeout === 0) {
      return false;
    }

    if (self.opts.enableIf && $(self.opts.enableIf).length === 0) {
      return false;
    }

    if (self.opts.disableIf && $(self.opts.disableIf).length > 0) {
      return false;
    }

    return true;
  };

  // start the timer after which the dialog will pop up
  AutoLogout.prototype.startTimer = function () {
    var self = this;

    //console.log("start timer");

    // make sure a previous one is cleared 
    self.stopTimer();

    if (self.isEnabled()) { 
      self.idleTimer = setTimeout(function() {
        if (self.isIdle()) {
          self.openDialog();
        } else {
          self.startTimer();
        }
      }, self.opts.idleTimeout * 1000);
    }
  };

  // stop idle timer started by startTimer()
  AutoLogout.prototype.stopTimer = function () {
    var self = this;

    if (self.idleTimer) {
      clearTimeout(self.idleTimer);
      self.idleTimer = null;
    }
  };


  // record activity in localStorage to be available in all tab of this domain
  AutoLogout.prototype.setActivityTime = function() {
    var self = this;

    localStorage.setItem(self.opts.localStorageId, Date.now());
  };

  // get time of last activity in epoch seconds
  AutoLogout.prototype.getActivityTime = function() {
    var self = this, activityTime;

    activityTime = localStorage.getItem(self.opts.localStorageId);

    if (typeof(activityTime) !== 'string') {
      //console.log("no idle activity time");
      return 0;
    }

    return parseInt(activityTime, 10);
  };

  // get time in seconds since the last activity was recorded
  AutoLogout.prototype.getIdleTime = function() {
    var self = this;

    return Math.floor((Date.now() - self.getActivityTime()) / 1000);
  };

  // return true when the last activity was later than the given idle time
  AutoLogout.prototype.isIdle = function() {
    var self = this;

    return self.getIdleTime() >= self.opts.idleTimeout;
  };


  // open the dialog and start the ticker
  AutoLogout.prototype.openDialog = function() {
    var self = this;

    self.stopTimer();

    self.elem.dialog("open");
  };

  // ticker when displaying the dialog
  AutoLogout.prototype.tickCountdown = function (val) {
    var self = this;

    if (self.idleTimer || !self.isIdle()) {
      //console.log("countdown aborted");
      self.elem.dialog("close");
      return; // abort
    }

    if (val <= 0) {
      self.logout();
    } else {
      self.countdown.text(val);
      setTimeout(function() {
        self.tickCountdown(val-1);
      }, 1000);  
    }
  };

  // log the session out when the ticker finished
  AutoLogout.prototype.logout = function() {
    var self = this;

    //console.log("redirecting to ",self.opts.logoutUrl);
    window.location.href = self.opts.logoutUrl;
    localStorage.removeItem(self.opts.localStorageId);
  };

  // add plugin to jquery
  $.fn.autoLogout = function (opts) {
    return this.each(function () {
      if (!$.data(this, "AutoLogout")) {
        $.data(this, "AutoLogout", new AutoLogout(this, opts));
      }
    });
  };

  // initializer of the autologout dialog
  $(function() {
    $(".jqAutoLogout").livequery(function() {
      $(this).autoLogout();
    });
  });

})(jQuery);
