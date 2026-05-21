const express = require("express");
const router = express.Router();
const pool = require("../config/database");

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
      INSERT INTO messages (name, email, phone, sender, message)
      VALUES ($1, $2, $3, 'client', $4)
      RETURNING *
      `,
      [name?.trim() || "Visitor", cleanEmail, phone || "", cleanMessage]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Send message error" });
  }
});

module.exports = router;
