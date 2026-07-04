const jwt = require("jsonwebtoken");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");

function authenticate(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, "Authentication token is required"));
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (_error) {
    return next(new ApiError(401, "Invalid or expired authentication token"));
  }
}

function authorize(...roles) {
  return function roleMiddleware(req, _res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to access this resource"));
    }
    return next();
  };
}

function collectorAreaFilter(req, _res, next) {
  if (req.user?.role === "collector") {
    req.areaScope = {
      areaId: req.user.assigned_area_id,
      isRestricted: true
    };
  } else {
    req.areaScope = {
      areaId: req.query.area_id ? Number(req.query.area_id) : null,
      isRestricted: false
    };
  }
  return next();
}

module.exports = {
  authenticate,
  authorize,
  collectorAreaFilter
};
