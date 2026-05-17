const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// POST /api/subscribers
router.post("/subscribers", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: "Email is required",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: "Invalid email format",
    });
  }

  try {
    const ipAddress =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const userAgent = req.headers["user-agent"];

    const result = await pool.query(
      `
      INSERT INTO subscribers
      (email, ip_address, user_agent, status)
      VALUES ($1, $2, $3, 'active')
      ON CONFLICT (email)
      DO UPDATE SET
        status = 'active',
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email, subscribed_at, status
      `,
      [email.toLowerCase(), ipAddress, userAgent]
    );

    res.status(201).json({
      success: true,
      message: "Successfully subscribed to our newsletter!",
      subscriber: result.rows[0],
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/admin/subscribers
router.get("/admin/subscribers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, email, subscribed_at, status
      FROM subscribers
      ORDER BY subscribed_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get subscribers error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;