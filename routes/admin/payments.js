const express = require("express");
const pool = require("../../config/database");

const router = express.Router();

const getCustomerName = (customerInfo = {}) =>
  customerInfo?.fullName ||
  customerInfo?.name ||
  customerInfo?.full_name ||
  customerInfo?.email ||
  "Client";

/* ================= PAGINATION ================= */
const getPagination = (req) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};

const setPaginationHeaders = (res, total, page, limit) => {
  res.set("X-Total-Count", String(total));
  res.set("X-Page", String(page));
  res.set("X-Limit", String(limit));
  res.set("X-Total-Pages", String(Math.ceil(total / limit)));
};

/* ================= ADMIN PAYMENTS ================= */
router.get("/payments", async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const countResult = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM payments) +
        (SELECT COUNT(*) FROM bookings) AS total
    `);

    const result = await pool.query(
      `
      SELECT
        'payment-' || id AS id,
        invoice,
        client,
        amount::text AS amount,
        status,
        NULL::text AS type,
        created_at
      FROM payments
      UNION ALL
      SELECT
        'booking-' || id AS id,
        COALESCE(booking_reference, 'Booking #' || id) AS invoice,
        COALESCE(customer_info->>'fullName', customer_info->>'name', customer_info->>'full_name', customer_info->>'email', 'Client') AS client,
        COALESCE(total_price::text, '0') AS amount,
        CASE WHEN status = 'Confirmed' THEN 'Paid' ELSE 'Not Paid' END AS status,
        COALESCE(booking_type, 'package') AS type,
        created_at
      FROM bookings
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    const payments = result.rows.map((payment) => ({
      id: payment.id,
      invoice: payment.invoice || "Invoice",
      client: payment.client || "Client",
      amount: payment.amount || "0",
      status: payment.status || "Not Paid",
      type: payment.type || undefined,
      created_at: payment.created_at,
    }));

    setPaginationHeaders(res, Number(countResult.rows[0].total), page, limit);
    res.json(payments);
  } catch (error) {
    console.error("Get admin payments error:", error);
    res.status(500).json({ error: "Unable to get payments" });
  }
});

module.exports = router;
