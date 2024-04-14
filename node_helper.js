const NodeHelper = require("node_helper");
const axios = require("axios").default;

module.exports = NodeHelper.create({
  // Subclass start method.
  start: function () {
    var self = this;
    console.log("Starting node helper for: " + self.name);
  },

  fetchData: async function () {
    var self = this;

    try {
      const saunaResponse = await axios.get(
        "https://us-west-2.aws.data.mongodb-api.com/app/data-vgwek/endpoint/latest"
      );

      const saunaData = {
        temperatureInside: saunaResponse.data.temperatureInside,
        temperatureOutside: saunaResponse.data.temperatureOutside,
        phase: saunaResponse.data.phase,
        timestampMs: saunaResponse.data.timestampMs,
      };

      this.sendSocketNotification(`SAUNAHOTNESS_FETCH_DATA_SUCCESS`, saunaData);
    } catch (error) {
      this.sendSocketNotification(
        `SAUNAHOTNESS_FETCH_DATA_FAILED`,
        error.message
      );
      console.error(`Error response while fetching Sauna data: ${error}`);
    }

    return;
  },

  // Subclass socketNotificationReceived received.
  socketNotificationReceived: function (notificationName, payload) {
    var self = this;

    console.log(
      `SaunaHotness node_helper received notification: ${notificationName}`
    );

    if (notificationName === "SAUNAHOTNESS_SET_CONFIG") {
      console.log(payload);

      this.sendSocketNotification(`SAUNAHOTNESS_CLIENT_READY`);
    } else if (notificationName.includes(`SAUNAHOTNESS_FETCH_DATA_REQUEST`)) {
      self.fetchData();
    }
  },
});
