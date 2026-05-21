const express = require("express");
const pool = require("../../config/database");

const router = express.Router();

const allowedStatuses = ["Pending", "Confirmed", "Cancelled"];

router.get("/reservations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
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

router.put("/reservations/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await pool.query(
      `
      UPDATE bookings
      SET status = $1
      WHERE id = $2
      RETURNING *
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

router.get("/hotels/reservations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM bookings
      WHERE booking_type = 'hotel'
      ORDER BY created_at DESC
    `);

    const reservations = result.rows.map((booking) => ({
      id: booking.id,
      type: "hotel",
      client:
        booking.customer_info?.name ||
        booking.customer_info?.fullName ||
        booking.customer_info?.email ||
        "Client",
      hotelName: booking.selected_hotel?.name || "Hotel",
      checkIn: booking.selected_hotel?.checkIn || "",
      checkOut: booking.selected_hotel?.checkOut || "",
      roomType: booking.selected_hotel?.roomType || "",
      status: booking.status || "Pending",
      date: booking.created_at?.toISOString().split("T")[0],
      totalPrice: booking.total_price || 0,
      reference: booking.booking_reference,
    }));

    res.json(reservations);
  } catch (error) {
    console.error("Hotel reservations error:", error);
    res.status(500).json({ error: "Unable to get hotel reservations" });
  }
});

router.put("/hotels/reservations/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
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
