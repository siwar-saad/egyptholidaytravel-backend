const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const adminMiddleware = require("../middleware/adminMiddleware");

/* ADMIN ONLY: get all bookings */
router.get("/", adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM bookings
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get bookings error:", error.message);
    res.status(500).json({ error: "Get bookings error" });
  }
});

/* PUBLIC: create booking */
router.post("/", async (req, res) => {
  try {
    const {
      booking_reference,
      search_params,
      selected_hotel,
      selected_activities,
      total_price,
      customer_info,
      booking_type,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO bookings
      (
        booking_reference,
        search_params,
        selected_hotel,
        selected_activities,
        total_price,
        customer_info,
        booking_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        booking_reference || `BOOK-${Date.now()}`,
        search_params || {},
        selected_hotel || null,
        selected_activities || null,
        total_price || 0,
        customer_info || {},
        booking_type || "package",
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create booking error:", error.message);
    res.status(500).json({ error: "Create booking error" });
  }
});

module.exports = router;