const express = require("express");
const pool = require("../../config/database");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

/* ================= PAYMENTS ================= */
router.get("/payments", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, total_price, status, created_at
      FROM bookings
      WHERE customer_info->>'email' = $1
      ORDER BY created_at DESC
      `,
      [req.user.email]
    );

    const payments = result.rows.map((payment) => ({
      id: payment.id,
      invoice: `Invoice #${payment.id}`,
      status: payment.status === "Confirmed" ? "Paid" : "Not Paid",
      amount: payment.total_price || 0,
      date: payment.created_at?.toISOString().split("T")[0],
    }));

    res.json(payments);
  } catch (err) {
    res.status(500).json({
      error: "Payments error",
      details: err.message,
    });
  }
});

module.exports = router;
