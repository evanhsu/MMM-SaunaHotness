Module.register("MMM-SaunaHotness", {
  defaults: {
    retryDelayMs: 20 * 1000, // milliseconds
    updateIntervalMs: 5 * 60 * 1000, // milliseconds
    debug: false,
  },

  requiresVersion: "2.1.0", // Required version of MagicMirror

  start: function () {
    var self = this;

    this.dataNotification = null; // This will contain the (formatted) data from the remote API after each request
    this.dataError = false; // Toggle to true if an API request results in an error
    this.loaded = false; // Toggle to true once this module has configured its API client and is ready to make API requests

    // Send the module config to the node_helper
    this.broadcastConfig({
      retryDelayMs: this.config.retryDelayMs,
      updateIntervalMs: this.config.updateIntervalMs,
      debug: this.config.debug,
    });

    // Schedule update timer
    setInterval(function () {
      self.getData();
      //   self.updateDom();
    }, self.config.updateIntervalMs);
  },

  getNamespacedNotificationName: function (notificationName) {
    return `SAUNAHOTNESS_${notificationName}`;
  },

  sendNamespacedSocketNotification: function (notificationName, config) {
    return this.sendSocketNotification(
      this.getNamespacedNotificationName(notificationName),
      config
    );
  },

  broadcastConfig: function (config) {
    // This is the first notification that establishes a new instance of the TitaSchoolMealMenu module, so the
    // namespaced notifications haven't been registered yet (the listeners don't know the name of this instance yet).
    this.sendSocketNotification(`SAUNAHOTNESS_SET_CONFIG`, config);
  },

  getData: function () {
    this.sendNamespacedSocketNotification(`FETCH_DATA_REQUEST`, {});
  },

  scheduleUpdate: function (delay) {
    var nextLoad = this.config.retryDelayMs;
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay;
    }

    var self = this;
    setTimeout(function () {
      self.getData();
    }, nextLoad);
  },

  getDom: function () {
    var self = this;

    var wrapper = document.createElement("div");

    if (!this.loaded) {
      wrapper.innerHTML =
        "<span class='small fa fa-refresh fa-spin fa-fw'></span>";
      wrapper.className = "small dimmed";
      return wrapper;
    }

    if (this.dataNotification && this.dataError) {
      // The remote API responded with an error which is now stored in this.dataNotification
      wrapper.innerHTML = `<div>${
        this.dataNotification
      }</div><div><span class='small fa fa-refresh fa-spin fa-fw'></span>Retry in ${
        this.config.retryDelayMs / 1000
      } seconds...</div>`;
      wrapper.className = "error";
      return wrapper;
    }

    // Data from helper
    if (this.dataNotification && !this.dataError) {
      console.log(this.dataNotification);
      const wrapperDataNotification = document.createElement("div");

      const saunaDiv = document.createElement("div");
      saunaDiv.innerHTML = `Temperature: ${this.dataNotification.temperatureInside}<br />Phase: ${this.dataNotification.phase}`;

      wrapperDataNotification.appendChild(saunaDiv);
      wrapper.appendChild(wrapperDataNotification);
    }

    return wrapper;
  },

  getScripts: function () {
    return [];
  },

  getStyles: function () {
    return ["MMM-SaunaHotness.css"];
  },

  getTranslations: function () {
    return {
      en: "translations/en.json",
      //   es: 'translations/es.json',
    };
  },

  // socketNotificationReceived from helper
  socketNotificationReceived: function (notificationName, payload) {
    console.log(
      `SaunaHotness module received notification: ${notificationName}`
    );

    if (
      notificationName ===
      this.getNamespacedNotificationName("FETCH_DATA_SUCCESS")
    ) {
      this.dataNotification = payload;
      this.dataError = false;
      this.loaded = true;
      this.updateDom();
    }

    if (
      notificationName ===
      this.getNamespacedNotificationName("FETCH_DATA_FAILED")
    ) {
      console.error(payload);
      console.error(
        `Retrying in ${this.config.retryDelayMs / 1000} seconds...`
      );
      this.scheduleUpdate();

      this.dataNotification = payload;
      this.dataError = true;
      this.loaded = true;
      this.updateDom();
    }

    if (
      notificationName === this.getNamespacedNotificationName("CLIENT_READY")
    ) {
      this.loaded = true;
      this.getData();
      this.updateDom();
    }
  },
});
