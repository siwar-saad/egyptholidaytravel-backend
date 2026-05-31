const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const adminMiddleware = require("../middleware/adminMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

/* ================= BOOKING HELPERS ================= */
// Always trust the authenticated user's email over client-submitted booking data.
const buildCustomerInfo = (customerInfo = {}, user = {}) => ({
  ...customerInfo,
  name:
    customerInfo.name ||
    customerInfo.fullName ||
    customerInfo.full_name ||
    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    "",
  email: user.email,
});

/* ================= ADMIN BOOKINGS ================= */
router.get("/", adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        booking_reference,
        search_params,
        selected_hotel,
        selected_activities,
        total_price,
        customer_info,
        booking_type,
        status,
        created_at
      FROM bookings
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get bookings error:", error.message);
    res.status(500).json({ error: "Get bookings error" });
  }
});

/* ================= CREATE BOOKING ================= */
router.post("/", authMiddleware, async (req, res) => {
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
    const normalizedCustomerInfo = buildCustomerInfo(customer_info, req.user);

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
      RETURNING
        id,
        booking_reference,
        search_params,
        selected_hotel,
        selected_activities,
        total_price,
        customer_info,
        booking_type,
        status,
        created_at
      `,
      [
        booking_reference || `BOOK-${Date.now()}`,
        search_params || {},
        selected_hotel || null,
        selected_activities || null,
        total_price || 0,
        normalizedCustomerInfo,
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
