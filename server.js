const express = require("express");
const cors = require("cors");
require("dotenv").config({ quiet: true });

const packageRoutes = require("./routes/packages");
const subscriberRoutes = require("./routes/subscribers");
const bookingRoutes = require("./routes/bookings");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const messageRoutes = require("./routes/messages");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/images", express.static("public/images"));

app.use("/api", subscriberRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/search", async (req, res) => {
  const { from, to, checkIn, checkOut, adults, children } = req.query;

  if (!to) {
    return res.status(400).json({ error: "Destination is required" });
  }

  try {
    const pool = require("./config/database");

    const result = await pool.query(
      "SELECT * FROM destinations WHERE name ILIKE $1 OR id = $2",
      [`%${to}%`, to]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Destination not found" });
    }

    const destination = JSON.parse(result.rows[0].data);

    let nights = 1;
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      nights =
        Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) || 1;
    }

    res.json({
      destination,
      searchParams: {
        from: from || "Egypt",
        to: destination.name,
        checkIn,
        checkOut,
        nights,
        adults: parseInt(adults) || 1,
        children: parseInt(children) || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/destinations-list", async (req, res) => {
  try {
    const pool = require("./config/database");

    const result = await pool.query(
      "SELECT id, name, region, image FROM destinations ORDER BY name"
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

const server = app.listen(PORT, async () => {
  try {
    const initializeDatabase = require("./data/initDb");
    await initializeDatabase();
  } catch (error) {
    // silent
  }
});

server.on("error", () => {
  process.exit(1);
});