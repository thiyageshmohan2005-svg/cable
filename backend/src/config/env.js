require("dotenv").config();

const nodeEnv = process.env.NODE_ENV || "development";
const required = nodeEnv === "production" ? ["JWT_SECRET", "DB_HOST", "DB_USER", "DB_NAME"] : [];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// Database configuration
const dbHost = process.env.DB_HOST || "127.0.0.1";
const dbPort = Number(process.env.DB_PORT || 3306);
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME || "cablepro";

module.exports = {
  nodeEnv,
  port: Number(process.env.PORT || 5000),
  appUrl: process.env.APP_URL || "http://localhost:5000",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "cablepro_local_dev_secret_change_in_production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 10),
  receiptPrefix: process.env.RECEIPT_PREFIX || "RCP",
  customerPrefix: process.env.CUSTOMER_PREFIX || "CBL",
  enableCron: process.env.ENABLE_CRON === "true",
  backupDir: process.env.BACKUP_DIR || "./backups",
  mysqldumpPath: process.env.MYSQLDUMP_PATH || "mysqldump",
  db: {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 20),
    queueLimit: 0,
    namedPlaceholders: true,
    decimalNumbers: true,
    timezone: "Z",
    supportBigNumbers: true,
    bigNumberStrings: true
  }
};
