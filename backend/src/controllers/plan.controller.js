const Plan = require("../models/plan.model");
const ApiError = require("../utils/ApiError");

async function list(req, res) {
  res.json({ data: await Plan.list(req.query) });
}

async function create(req, res) {
  if (!req.body.name || req.body.monthly_price === undefined) {
    throw new ApiError(422, "Plan name and monthly_price are required");
  }
  res.status(201).json({ data: await Plan.create(req.body) });
}

async function update(req, res) {
  res.json({ data: await Plan.update(req.params.id, req.body) });
}

async function remove(req, res) {
  await Plan.remove(req.params.id);
  res.status(204).send();
}

module.exports = {
  list,
  create,
  update,
  remove
};
