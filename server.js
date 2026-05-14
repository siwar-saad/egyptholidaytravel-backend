const express = require("express");
const cors = require("cors");
require("dotenv").config({ quiet: true });

const pool = require("./config/database");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const clientRoutes = require("./routes/client");
const packageRoutes = require("./routes/packages");
const subscriberRoutes = require("./routes/subscribers");
const bookingRoutes = require("./routes/bookings");
const messageRoutes = require("./routes/messages");
const hotelRoutes = require("./routes/hotels");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});