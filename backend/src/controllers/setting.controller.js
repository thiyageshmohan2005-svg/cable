const Setting = require("../models/setting.model");

async function all(_req, res) {
  res.json({ data: await Setting.all() });
}

async function update(req, res) {
  res.json({ data: await Setting.upsertMany(req.body) });
}

module.exports = {
  all,
  update
};
