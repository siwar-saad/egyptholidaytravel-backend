const express = require("express");
const router = express.Router();
const pool = require("../config/database");

const adminMiddleware = require("../middleware/adminMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

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

/* ================= HOTEL BOOKING HELPERS ================= */
const allowedBookingStatuses = ["Pending", "Confirmed", "Cancelled"];

/* ================= CREATE HOTEL BOOKING ================= */
router.post("/reserve", authMiddleware, async (req, res) => {
  try {
    const {
      selected_hotel,
      hotel,
      customer_info,
      customerInfo,
      total_price,
      totalPrice,
      search_params,
    } = req.body;
    const hotelData = selected_hotel || hotel || {};
    const customerData = customer_info || customerInfo || {};

    const bookingReference = `HOTEL-${Date.now()}`;
    const normalizedCustomerInfo = buildCustomerInfo(customerData, req.user);

    const result = await pool.query(
      `
      INSERT INTO bookings
      (
        booking_reference,
        booking_type,
        selected_hotel,
        customer_info,
        total_price,
        search_params,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        booking_reference,
        booking_type,
        selected_hotel,
        customer_info,
        total_price,
        search_params,
        status,
        created_at
      `,
      [
        bookingReference,
        "hotel",
        hotelData,
        normalizedCustomerInfo,
        total_price || totalPrice || 0,
        search_params || {},
        "Pending",
      ]
    );

    res.status(201).json({
      success: true,
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Create hotel booking error:", error);

    res.status(500).json({
      error: "Unable to create hotel booking",
    });
  }
});

module.exports = router;
