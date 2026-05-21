const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config({ quiet: true });

const pool = require("./config/database");
const initializeDatabase = require("./data/initDb");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin/admin");
const clientRoutes = require("./routes/client");
const packageRoutes = require("./routes/packages");
const subscriberRoutes = require("./routes/subscribers");
const bookingRoutes = require("./routes/bookings");
const messageRoutes = require("./routes/messages");
const hotelReservationRoutes = require("./routes/hotels_reservetion");
const hotelRoutes = require("./routes/hotels");


if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing in .env");
  process.exit(1);
}

if (!process.env.FRONTEND_URL) {
  console.error("❌ FRONTEND_URL is missing in .env");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

initializeDatabase();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/images", express.static("public/images"));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api", subscriberRoutes);
app.use("/api/hotels_reservation", hotelReservationRoutes);
app.use("/api/hotels", hotelRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Egypt Holiday API is running" });
});

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

app.use((err, req, res, next) => {
  console.error("Global error:", err);

  res.status(err.status || 500).json({
    error: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});