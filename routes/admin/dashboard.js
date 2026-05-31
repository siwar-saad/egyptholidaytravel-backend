const express = require("express");
const pool = require("../../config/database");

const router = express.Router();

/* ================= DASHBOARD STATS ================= */
router.get("/dashboard", async (req, res) => {
  try {
    const packagesCount = await pool.query("SELECT COUNT(*) FROM packages");
    const reservationsCount = await pool.query("SELECT COUNT(*) FROM bookings");
    const clientsCount = await pool.query("SELECT COUNT(*) FROM users");
    const messagesCount = await pool.query("SELECT COUNT(*) FROM messages");

    res.json({
      packages: Number(packagesCount.rows[0].count),
      reservations: Number(reservationsCount.rows[0].count),
      clients: Number(clientsCount.rows[0].count),
      messages: Number(messagesCount.rows[0].count),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Unable to load dashboard" });
  }
});

module.exports = router;
