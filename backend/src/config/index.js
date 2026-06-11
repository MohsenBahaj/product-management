require("dotenv").config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT) || 3001,

  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/product_management_db",

  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  corsOrigins: (
    process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:3001"
  ).split(","),

  uploadMaxSizeMb: parseInt(process.env.UPLOAD_MAX_SIZE_MB) || 5,

  authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
  authRateLimitWindow: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW) || 15,
  apiRateLimitMax: parseInt(process.env.API_RATE_LIMIT_MAX) || 100,
  apiRateLimitWindow: parseInt(process.env.API_RATE_LIMIT_WINDOW) || 15,

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY || "",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  },
};
