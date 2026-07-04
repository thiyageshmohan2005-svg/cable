const bcrypt = require("bcryptjs");
const env = require("../config/env");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

async function list(req, res) {
  const users = await User.list(req.query);
  res.json({ data: users });
}

async function create(req, res) {
  const { name, mobile, password, role } = req.body;
  if (!name || !mobile || !password || !role) {
    throw new ApiError(422, "name, mobile, password and role are required");
  }

  const password_hash = await bcrypt.hash(password, env.bcryptRounds);
  const user = await User.create({ ...req.body, password_hash });
  res.status(201).json({ data: user });
}

async function update(req, res) {
  const payload = { ...req.body };
  if (payload.password) {
    payload.password_hash = await bcrypt.hash(payload.password, env.bcryptRounds);
    delete payload.password;
  }

  const user = await User.update(req.params.id, payload);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.json({ data: user });
}

async function remove(req, res) {
  await User.remove(req.params.id);
  res.status(204).send();
}

module.exports = {
  list,
  create,
  update,
  remove
};
