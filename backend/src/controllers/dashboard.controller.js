const Dashboard = require("../models/dashboard.model");

async function summary(req, res) {
  res.json({ data: await Dashboard.summary(req.user) });
}

module.exports = {
  summary
};
