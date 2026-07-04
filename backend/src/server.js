const app = require("./app");
const env = require("./config/env");
const { scheduleJobs } = require("./services/scheduler.service");

app.listen(env.port, () => {
  console.log(`CablePro API running on port ${env.port}`);
  if (env.enableCron) {
    scheduleJobs();
  }
});
