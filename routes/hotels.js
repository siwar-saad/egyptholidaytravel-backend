const express = require("express");
const pool = require("../config/database");

const router = express.Router();

/* CREATE HOTEL BOOKING - CLIENT */
router.post("/reserve", async (req, res) => {
  try {
    const { hotel, customerInfo, totalPrice, userRole } = req.body;

    if (userRole === "admin") {
      return res.status(403).json({
        success: false,
        error: "Admin cannot make hotel reservations",
      });
    }

    if (!hotel || !customerInfo) {
      return res.status(400).json({
        success: false,
        error: "Hotel and customer info are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO bookings
      (
        booking_reference,
        booking_type,
        status,
        selected_hotel,
        total_price,
        customer_info
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        `HOTEL-${Date.now()}`,
        "hotel",
        "Pending",
        JSON.stringify(hotel),
        totalPrice || 0,
        JSON.stringify(customerInfo),
      ]
    );

    res.status(201).json({
      success: true,
      message: "Hotel booking request sent successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Hotel reservation error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* GET HOTEL RESERVATIONS - ADMIN */
router.get("/bookings", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM bookings
      WHERE booking_type = 'hotel'
      ORDER BY created_at DESC
    `);

    res.json(
      result.rows.map((b) => ({
        id: b.id,
        type: "hotel",
        client:
          b.customer_info?.name ||
          b.customer_info?.fullName ||
          b.customer_info?.email ||
          "Unknown",
        email: b.customer_info?.email || "",
        phone: b.customer_info?.phone || "",
        hotelName:
          b.selected_hotel?.name ||
          b.selected_hotel?.hotelName ||
          "Unknown Hotel",
        checkIn:
          b.selected_hotel?.checkIn ||
          b.customer_info?.checkIn ||
          b.selected_hotel?.fromDate ||
          "",
        checkOut:
          b.selected_hotel?.checkOut ||
          b.customer_info?.checkOut ||
          b.selected_hotel?.toDate ||
          "",
        status: b.status || "Pending",
        amount: b.total_price || 0,
        date: b.created_at?.toISOString().split("T")[0],
      }))
    );
  } catch (error) {
    console.error("Get hotel bookings error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* UPDATE HOTEL BOOKING STATUS */
router.put("/bookings/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `
      UPDATE bookings
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND booking_type = 'hotel'
      RETURNING *
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hotel booking not found" });
    }

    res.json({
      success: true,
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Update hotel booking error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* DELETE HOTEL BOOKING */
router.delete("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM bookings
      WHERE id = $1 AND booking_type = 'hotel'
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hotel booking not found" });
    }

    res.json({
      success: true,
      message: "Hotel booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete hotel booking error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;