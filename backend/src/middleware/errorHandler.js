const ApiError = require("../utils/ApiError");

function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(error, _req, res, _next) {
  const status = error.statusCode || 500;
  const payload = {
    message: error.message || "Internal server error"
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (process.env.NODE_ENV !== "production" && status >= 500) {
    payload.stack = error.stack;
  }

  res.status(status).json(payload);
}

module.exports = {
  notFound,
  errorHandler
};
