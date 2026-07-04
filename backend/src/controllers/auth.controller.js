const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

function sign(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      mobile: user.mobile,
      assigned_area_id: user.assigned_area_id
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

async function login(req, res) {
  const { mobile, password } = req.body;
  if (!mobile || !password) {
    throw new ApiError(422, "Mobile and password are required");
  }

  const user = await User.findByMobile(mobile);
  if (!user || user.status !== "active") {
    throw new ApiError(401, "Invalid login credentials");
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    throw new ApiError(401, "Invalid login credentials");
  }

  delete user.password_hash;
  res.json({ token: sign(user), user });
}

async function me(req, res) {
  const user = await User.findById(req.user.id);
  res.json({ user });
}

module.exports = {
  login,
  me
};
