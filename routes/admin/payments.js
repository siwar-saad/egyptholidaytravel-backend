const express = require("express");
const pool = require("../../config/database");

const router = express.Router();

/* ================= ADMIN PAYMENTS ================= */
router.get("/payments", async (req, res) => {
  try {
    const paymentsResult = await pool.query(`
      SELECT
        id,
        invoice,
        client,
        amount,
        status,
        created_at
      FROM payments
      ORDER BY created_at DESC
    `);

    const payments = paymentsResult.rows.map((payment) => ({
      id: `payment-${payment.id}`,
      invoice: payment.invoice || `Invoice #${payment.id}`,
      client: payment.client || "Client",
      amount: payment.amount || "0",
      status: payment.status || "Not Paid",
      created_at: payment.created_at,
    }));

    const bookingsResult = await pool.query(`
      SELECT
        id,
        booking_reference,
        booking_type,
        customer_info,
        total_price,
        status,
        created_at
      FROM bookings
      ORDER BY created_at DESC
    `);

    const bookingPayments = bookingsResult.rows.map((booking) => ({
      id: `booking-${booking.id}`,
      invoice: booking.booking_reference || `Booking #${booking.id}`,
      client:
        booking.customer_info?.fullName ||
        booking.customer_info?.name ||
        booking.customer_info?.email ||
        "Client",
      amount: booking.total_price || 0,
      status: booking.status === "Confirmed" ? "Paid" : "Not Paid",
      type: booking.booking_type || "package",
      created_at: booking.created_at,
    }));

    res.json([...payments, ...bookingPayments]);
  } catch (error) {
    console.error("Get admin payments error:", error);
    res.status(500).json({ error: "Unable to get payments" });
  }
});

module.exports = router;
