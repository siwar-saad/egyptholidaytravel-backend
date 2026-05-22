const express = require("express");
const router = express.Router();
const pool = require("../config/database");

const adminMiddleware = require("../middleware/adminMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

/* =======================================================
   PUBLIC - CREATE HOTEL BOOKING
======================================================= */

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
    const normalizedCustomerInfo = {
      ...customerData,
      name:
        customerData.name ||
        customerData.fullName ||
        customerData.full_name ||
        `${req.user.first_name || ""} ${req.user.last_name || ""}`.trim() ||
        "",
      email: req.user.email,
    };

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
      RETURNING *
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

/* =======================================================
   ADMIN ONLY - GET HOTEL BOOKINGS
======================================================= */

router.get("/reservations", adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM bookings
      WHERE booking_type = 'hotel'
      ORDER BY created_at DESC
    `);

    const reservations = result.rows.map((b) => ({
      id: b.id,
      client:
        b.customer_info?.name ||
        b.customer_info?.email ||
        "Unknown",

      hotelName:
        b.selected_hotel?.name ||
        "Unknown Hotel",

      totalPrice: b.total_price || 0,

      status: b.status || "Pending",

      checkIn:
        b.selected_hotel?.checkIn || "",

      checkOut:
        b.selected_hotel?.checkOut || "",

      createdAt: b.created_at,
    }));

    res.json(reservations);
  } catch (error) {
    console.error("Get hotel reservations error:", error);

    res.status(500).json({
      error: "Unable to get hotel reservations",
    });
  }
});

/* =======================================================
   ADMIN ONLY - UPDATE STATUS
======================================================= */

router.put(
  "/reservations/:id/status",
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid status",
        });
      }

      const result = await pool.query(
        `
        UPDATE bookings
        SET status = $1
        WHERE id = $2
        AND booking_type = 'hotel'
        RETURNING *
        `,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Reservation not found",
        });
      }

      res.json({
        success: true,
        reservation: result.rows[0],
      });
    } catch (error) {
      console.error("Update reservation status error:", error);

      res.status(500).json({
        error: "Unable to update reservation status",
      });
    }
  }
);

module.exports = router;
