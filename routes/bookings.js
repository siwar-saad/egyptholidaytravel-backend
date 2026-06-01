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

router.get("/mybookings", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        booking_reference,
        booking_type,
        status,
        search_params,
        selected_hotel,
        customer_info,
        total_price,
        created_at
      FROM bookings
      WHERE customer_info->>'email' = $1
      ORDER BY created_at DESC
      `,
      [req.user.email]
    );
// hello
    const bookings = result.rows.map((booking) => ({
      id: booking.id,
      type: booking.booking_type || "package",
      booking_reference: booking.booking_reference,
      search_params: booking.search_params || {},
      selected_hotel: booking.selected_hotel || {},
      customer_info: booking.customer_info || {},
      title:
        booking.booking_type === "hotel"
          ? booking.selected_hotel?.name || "Hotel"
          : booking.search_params?.name ||
            booking.search_params?.backendName ||
            booking.search_params?.route ||
            "Package",
      packageName:
        booking.search_params?.name ||
        booking.search_params?.backendName ||
        booking.search_params?.route ||
        "",
      client:
        booking.customer_info?.fullName ||
        booking.customer_info?.name ||
        booking.customer_info?.full_name ||
        "",
      email: booking.customer_info?.email || "",
      phone: booking.customer_info?.phone || "",
      country: booking.customer_info?.country || "",
      travelers: booking.customer_info?.travelers || "",
      notes: booking.customer_info?.notes || "",
      travelDate:
        booking.search_params?.travelDate ||
        booking.search_params?.travel_date ||
        "",
      roomType:
        booking.search_params?.roomType ||
        booking.search_params?.room_type ||
        booking.selected_hotel?.roomType ||
        "",
      hotelName: booking.selected_hotel?.name || "",
      checkIn: booking.selected_hotel?.checkIn || "",
      checkOut: booking.selected_hotel?.checkOut || "",
      date: booking.created_at?.toISOString().split("T")[0],
      status: booking.status || "Pending",
      details: booking.booking_reference || "No reference",
      total_price: booking.total_price || 0,
    }));

    res.json(bookings);
  } catch (err) {
    res.status(500).json({
      error: "Bookings error",
      details: err.message,
    });
  }
});

module.exports = router;
