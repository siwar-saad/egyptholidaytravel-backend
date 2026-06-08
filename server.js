const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config({ quiet: true });

const pool = require("./config/database");
const initializeDatabase = require("./data/initDb");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin/admin");
const clientRoutes = require("./routes/client/client");
const packageRoutes = require("./routes/packages");
const subscriberRoutes = require("./routes/subscribers");
const hotelReservationRoutes = require("./routes/hotels_reservetion");
const hotelRoutes = require("./routes/hotels");
const reviewRoutes = require("./routes/reviews");

/* ================= ENVIRONMENT CHECKS ================= */
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing in .env");
  process.exit(1);
}

if (!process.env.FRONTEND_URL) {
  console.error("❌ FRONTEND_URL is missing in .env");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

/* ================= DATABASE INITIALIZATION ================= */
initializeDatabase();

/* ================= SECURITY MIDDLEWARE ================= */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://[::1]:5173",
  "https://egyptholidaytravel.com",
  "https://www.egyptholidaytravel.com",
].filter(Boolean);

/* ================= CORS ================= */
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("CORS blocked origin:", origin);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

/* ================= STATIC FILES ================= */
app.use("/images", express.static("public/images"));

/* ================= API ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api", subscriberRoutes);
app.use("/api/hotels_reservation", hotelReservationRoutes);
app.use("/api/hotels", hotelRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Egypt Holiday API is running" });
});

/* ================= HEALTH CHECK ================= */
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "Backend and database are working",
    });
  } catch (err) {
    console.error("Health check error:", err);

    res.status(500).json({
      success: false,
      error: "Health check failed",
    });
  }
});

/* ================= GLOBAL ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("Global error:", err);

  res.status(err.status || 500).json({
    error: "Internal server error",
  });
});

/* ================= SERVER LISTENER ================= */
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
