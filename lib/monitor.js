const dbConnect = require("./db").default;
const Url = require("../models/Url").default;

async function monitorUrls() {
  await dbConnect();
  const urls = await Url.find({});

  for (const url of urls) {
    try {
      const response = await fetch(url.url);
      const status = response.ok ? "up" : "down";

      // Update the URL status in the database
      await Url.findByIdAndUpdate(url._id, {
        status,
        uptime: status === "up" ? url.uptime : Math.max(0, url.uptime - 0.01),
      });
    } catch (error) {
      // If there's an error (e.g., network error), mark the URL as down
      await Url.findByIdAndUpdate(url._id, {
        status: "down",
        uptime: Math.max(0, url.uptime - 0.01),
      });
    }
  }
}

module.exports = { monitorUrls }; 