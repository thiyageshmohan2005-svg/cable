const ApiError = require("../utils/ApiError");

function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(error, req, res, _next) {
  const status = error.statusCode || 500;
  const payload = {
    message: error.message || "Internal server error"
  };

  // Log errors for debugging
  if (process.env.NODE_ENV !== "production" || status >= 500) {
    console.error("\n❌ ERROR OCCURRED:");
    console.error(`Status: ${status}`);
    console.error(`Path: ${req.method} ${req.path}`);
    console.error(`Message: ${error.message}`);
    
    // Log specific database errors
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("💾 Database Access Denied - Check credentials in .env");
    } else if (error.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("💾 Database Connection Lost");
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error("💾 Database does not exist");
    } else if (error.code === "ER_NO_SUCH_TABLE") {
      console.error("💾 Table does not exist");
    }
    
    if (process.env.NODE_ENV !== "production") {
      console.error("\nStack:", error.stack);
    }
    console.error("=".repeat(50) + "\n");
  }

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
