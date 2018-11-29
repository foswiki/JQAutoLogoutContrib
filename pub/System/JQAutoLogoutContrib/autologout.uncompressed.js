/*
 * AutoLogout 
 *
 * Copyright (c) 2018 Michael Daum https://michaeldaumconsulting.com
 *
 * Licensed under GPL licenses:
 *   http://www.gnu.org/licenses/gpl.html
 *
 */

"use strict";
(function($) {

  // Create the defaults once
  var defaults = {
    events: "click mousemove scroll keypress",
    enableIf: null,
    disableIf: null,
    idleTimeout: 900, // 15 minutes
    countdown: 10,
    logoutUrl: null 
  };

  // The actual plugin constructor
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

  AutoLogout.prototype.init = function () {
    var self = this;

    $(document).on(self.opts.events, function() {
      if (self.elem.dialog("isOpen")) {
        self.elem.dialog("close");
      }
      if (self.idleTimer) {
        self.startTimer();
      }
    });

    self.elem.on("dialogclose", function() {
      self.startTimer();
    });

    self.elem.on("dialogopen", function() {
      self.tickCountdown(self.opts.countdown);
    });

    //console.log("opts=",self.opts);

    self.startTimer();
  };

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

  AutoLogout.prototype.tickCountdown = function (val) {
    var self = this;

    if (self.idleTimer) {
      //console.log("countdown aborted");
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

  AutoLogout.prototype.startTimer = function () {
    var self = this;

    //console.log("start timer");

    self.stopTimer();

    if (self.isEnabled()) { 
      self.idleTimer = setTimeout(function() {
        self.openDialog();
      }, self.opts.idleTimeout * 1000);
    }
  };

  AutoLogout.prototype.stopTimer = function () {
    var self = this;

    if (self.idleTimer) {
      clearTimeout(self.idleTimer);
      self.idleTimer = null;
    }
  };

  AutoLogout.prototype.logout = function() {
    var self = this;

    //console.log("redirecting to ",self.opts.logoutUrl);
    window.location.href = self.opts.logoutUrl;
  };

  AutoLogout.prototype.openDialog = function() {
    var self = this;

    self.stopTimer();


    self.elem.dialog("open");
  };

  $.fn.autoLogout = function (opts) {
    return this.each(function () {
      if (!$.data(this, "AutoLogout")) {
        $.data(this, "AutoLogout", new AutoLogout(this, opts));
      }
    });
  };

  $(function() {
    $(".jqAutoLogout:not(.jqAutoLogoutInited)").livequery(function() {
      $(this).addClass("jqAutoLogoutInited").autoLogout();
    });
  });

})(jQuery);

