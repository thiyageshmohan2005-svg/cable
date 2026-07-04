const cron = require("node-cron");
const dayjs = require("dayjs");
const Customer = require("../models/customer.model");

function scheduleJobs() {
  cron.schedule("5 0 1 * *", async () => {
    const month = dayjs().format("YYYY-MM");
    const affected = await Customer.addMonthlyDues(month);
    console.log(`Monthly dues generated for ${affected} customers (${month})`);
  });
}

module.exports = {
  scheduleJobs
};
