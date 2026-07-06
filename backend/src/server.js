const app = require("./app");
const env = require("./config/env");
const { testConnection } = require("./config/db");
const { scheduleJobs } = require("./services/scheduler.service");

async function startServer() {
  try {
    // Test database connection before starting server
    console.log("Testing database connection...");
    try {
      const dbConnected = await testConnection();
      if (dbConnected) {
        console.log("✓ Database connection successful");
      }
    } catch (dbError) {
      console.warn("⚠️  Database connection test failed (will retry on first query)");
      console.warn(`   Error: ${dbError.message}`);
    }

    const server = app.listen(env.port, () => {
      console.log("\n========================================");
      console.log(`✓ CablePro API Server Started`);
      console.log(`  Port: ${env.port}`);
      console.log(`  Environment: ${env.nodeEnv}`);
      console.log(`  Database: ${env.db.database}`);
      console.log(`  Database Host: ${env.db.host}:${env.db.port}`);
      console.log("========================================\n");

      if (env.enableCron) {
        scheduleJobs();
      }
    });

    // Handle graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received: Shutting down gracefully");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
