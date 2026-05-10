const express = require("express");
const router = express.Router();
const pool = require("../config/database");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM bookings
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Bookings error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      booking_reference,
      search_params,
      selected_hotel,
      selected_activities,
      total_price,
      customer_info,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO bookings (
        booking_reference,
        search_params,
        selected_hotel,
        selected_activities,
        total_price,
        customer_info
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        booking_reference || `BK-${Date.now()}`,
        search_params || {},
        selected_hotel || {},
        selected_activities || [],
        total_price || 0,
        customer_info || {},
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Create booking error" });
  }
});

module.exports = router;