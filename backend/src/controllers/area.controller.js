const Area = require("../models/area.model");
const ApiError = require("../utils/ApiError");

async function list(req, res) {
  res.json({ data: await Area.list(req.query) });
}

async function create(req, res) {
  if (!req.body.name) {
    throw new ApiError(422, "Area name is required");
  }
  res.status(201).json({ data: await Area.create(req.body) });
}

async function update(req, res) {
  const area = await Area.update(req.params.id, req.body);
  res.json({ data: area });
}

async function remove(req, res) {
  await Area.remove(req.params.id);
  res.status(204).send();
}

module.exports = {
  list,
  create,
  update,
  remove
};
