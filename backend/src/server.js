const app = require("./app");
const config = require("./config");
const { pool } = require("./config/database");

const start = async () => {
  try {
    const client = await pool.connect();
    client.release();
    console.log("✓ Database connection established");

    app.listen(config.port, () => {
      console.log(
        `✓ Server running on http://localhost:${config.port} [${config.nodeEnv}]`
      );
      console.log(`✓ API docs  → http://localhost:${config.port}/api-docs`);
      console.log(`✓ Health    → http://localhost:${config.port}/api/health`);
    });
  } catch (err) {
    console.error("✗ Failed to start server:", err.message);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received — shutting down gracefully");
  await pool.end();
  process.exit(0);
});

start();
