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
      WHERE LOWER(customer_info->>'email') = LOWER($1)
      ORDER BY created_at DESC
      `,
      [String(req.user.email || "").trim().toLowerCase()]
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
    console.error("Payments error:", err);
    res.status(500).json({
      error: "Payments error",
    });
  }
});

module.exports = router;
