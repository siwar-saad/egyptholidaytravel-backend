const express = require("express");
const router = express.Router();
const pool = require("../config/database");

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const result = await pool.query(
      `
      INSERT INTO messages (name, email, phone, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [name, email, phone, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Send message error" });
  }
});

module.exports = router;