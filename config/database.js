const { Pool } = require("pg");
require("dotenv").config();

const shouldUseSsl =
  process.env.DB_SSL === "true" || process.env.NODE_ENV === "production";

/* ================= DATABASE CONNECTION ================= */
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: Number(process.env.DB_PORT),
  ssl: shouldUseSsl
    ? {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === "true",
      }
    : false,
});

pool.connect((err) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
  } else {
    console.log("✅ Connected to PostgreSQL database");
  }
});

module.exports = pool;
