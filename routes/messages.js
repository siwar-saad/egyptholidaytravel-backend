const express = require("express");
const router = express.Router();
const pool = require("../config/database");

/* ================= CONTACT MESSAGES ================= */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const cleanMessage = message?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail || "");

    if (!cleanMessage) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    if (!isValidEmail) {
      return res.status(400).json({
        error: "Valid email is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO messages (name, email, phone, sender, is_read, message)
      VALUES ($1, $2, $3, 'client', false, $4)
      RETURNING
        id,
        name,
        email,
        phone,
        sender,
        is_read,
        message,
        reply,
        replied_at,
        created_at
      `,
      [name?.trim() || "Visitor", cleanEmail, phone || "", cleanMessage]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Send message error" });
  }
});

module.exports = router;
