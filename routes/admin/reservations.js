const express = require("express");
const pool = require("../../config/database");

const router = express.Router();

const getCustomerName = (customerInfo = {}) =>
  customerInfo?.fullName ||
  customerInfo?.name ||
  customerInfo?.full_name ||
  customerInfo?.email ||
  "Client";

const getAdminName = (req) =>
  `${req.user?.first_name || ""} ${req.user?.last_name || ""}`.trim() ||
  req.user?.email ||
  "Admin";

const allowedBookingStatuses = ["Pending", "Confirmed", "Cancelled"];

/* ================= PACKAGE RESERVATIONS ================= */
router.get("/reservations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        booking_reference,
        booking_type,
        search_params,
        selected_hotel,
        selected_activities,
        total_price,
        customer_info,
        status,
        created_at
      FROM bookings
      WHERE booking_type = 'package'
         OR booking_type IS NULL
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Reservations error:", error);
    res.status(500).json({ error: "Unable to get reservations" });
  }
});

/* ================= CREATE PACKAGE RESERVATION ================= */
router.post("/reservations", async (req, res) => {
  try {
    const {
      packageName,
      route,
      duration,
      travelDate,
      roomType,
      fullName,
      email,
      phone,
      travelers,
      notes,
      totalPrice,
    } = req.body;

    if (!packageName || !fullName || !email) {
      return res.status(400).json({
        error: "Package, client name and email are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO bookings
      (
        booking_reference,
        booking_type,
        search_params,
        customer_info,
        total_price,
        status
      )
      VALUES ($1, 'package', $2, $3, $4, 'Pending')
      RETURNING
        id,
        booking_reference,
        booking_type,
        search_params,
        selected_hotel,
        selected_activities,
        total_price,
        customer_info,
        status,
        created_at
      `,
      [
        `PKG-${Date.now()}`,
        {
          name: packageName,
          route: route || "",
          duration: duration || "",
          travelDate: travelDate || "",
          roomType: roomType || "",
        },
        {
          fullName,
          email,
          phone: phone || "",
          travelers: travelers || "",
          notes: notes || "",
          createdBy: "admin",
          adminName: getAdminName(req),
          adminEmail: req.user?.email || "",
        },
        totalPrice || 0,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create package reservation error:", error);
    res.status(500).json({ error: "Unable to create package reservation" });
  }
});

/* ================= UPDATE PACKAGE RESERVATION STATUS ================= */
router.put("/reservations/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!allowedBookingStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await pool.query(
      `
      UPDATE bookings
      SET status = $1
      WHERE id = $2
      RETURNING
        id,
        booking_reference,
        booking_type,
        search_params,
        selected_hotel,
        selected_activities,
        total_price,
        customer_info,
        status,
        created_at
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update reservation error:", error);
    res.status(500).json({ error: "Unable to update reservation" });
  }
});

/* ================= HOTEL RESERVATIONS ================= */
router.get("/hotels/reservations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        booking_reference,
        booking_type,
        selected_hotel,
        customer_info,
        total_price,
        status,
        created_at
      FROM bookings
      WHERE booking_type = 'hotel'
      ORDER BY created_at DESC
    `);

    const reservations = result.rows.map((booking) => ({
      id: booking.id,
      type: "hotel",
      client: getCustomerName(booking.customer_info),
      email: booking.customer_info?.email || "",
      phone: booking.customer_info?.phone || "",
      travelers: booking.customer_info?.travelers || "",
      hotelName: booking.selected_hotel?.name || "Hotel",
      city: booking.selected_hotel?.city || "",
      mealPlan:
        booking.selected_hotel?.mealPlan ||
        booking.selected_hotel?.meal ||
        "",
      checkIn: booking.selected_hotel?.checkIn || "",
      checkOut: booking.selected_hotel?.checkOut || "",
      roomType: booking.selected_hotel?.roomType || "",
      status: booking.status || "Pending",
      created_at: booking.created_at,
      date: booking.created_at?.toISOString().split("T")[0],
      totalPrice: booking.total_price || 0,
      reference: booking.booking_reference,
      notes: booking.customer_info?.notes || "",
      createdBy: booking.customer_info?.createdBy || "client",
      adminName: booking.customer_info?.adminName || "",
      adminEmail: booking.customer_info?.adminEmail || "",
    }));

    res.json(reservations);
  } catch (error) {
    console.error("Hotel reservations error:", error);
    res.status(500).json({ error: "Unable to get hotel reservations" });
  }
});

/* ================= CREATE HOTEL RESERVATION ================= */
router.post("/hotels/reservations", async (req, res) => {
  try {
    const {
      hotelName,
      city,
      mealPlan,
      checkIn,
      checkOut,
      roomType,
      fullName,
      email,
      phone,
      travelers,
      notes,
      totalPrice,
    } = req.body;

    if (!hotelName || !fullName || !email) {
      return res.status(400).json({
        error: "Hotel, client name and email are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO bookings
      (
        booking_reference,
        booking_type,
        selected_hotel,
        customer_info,
        total_price,
        status
      )
      VALUES ($1, 'hotel', $2, $3, $4, 'Pending')
      RETURNING
        id,
        booking_reference,
        booking_type,
        selected_hotel,
        customer_info,
        total_price,
        status,
        created_at
      `,
      [
        `HOTEL-${Date.now()}`,
        {
          name: hotelName,
          city: city || "",
          mealPlan: mealPlan || "",
          checkIn: checkIn || "",
          checkOut: checkOut || "",
          roomType: roomType || "",
        },
        {
          fullName,
          email,
          phone: phone || "",
          travelers: travelers || "",
          notes: notes || "",
          createdBy: "admin",
          adminName: getAdminName(req),
          adminEmail: req.user?.email || "",
        },
        totalPrice || 0,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create hotel reservation error:", error);
    res.status(500).json({ error: "Unable to create hotel reservation" });
  }
});

/* ================= UPDATE HOTEL RESERVATION STATUS ================= */
router.put("/hotels/reservations/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!allowedBookingStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await pool.query(
      `
      UPDATE bookings
      SET status = $1
      WHERE id = $2
      AND booking_type = 'hotel'
      RETURNING
        id,
        booking_reference,
        booking_type,
        selected_hotel,
        customer_info,
        total_price,
        status,
        created_at
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hotel reservation not found" });
    }

    res.json({
      success: true,
      reservation: result.rows[0],
    });
  } catch (error) {
    console.error("Update hotel reservation error:", error);
    res.status(500).json({ error: "Unable to update hotel reservation" });
  }
});

module.exports = router;
