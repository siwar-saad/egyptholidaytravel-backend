const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const adminMiddleware = require("../middleware/adminMiddleware");

/* PUBLIC: subscribe */
router.post("/subscribers", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const result = await pool.query(
      `
      INSERT INTO subscribers (email)
      VALUES ($1)
      RETURNING *
      `,
      [email]
    );

    res.status(201).json({
      success: true,
      subscriber: result.rows[0],
    });
  } catch (error) {
    console.error("Subscribe error:", error.message);
    res.status(500).json({ error: "Subscribe error" });
  }
});

/* ADMIN ONLY: get all subscribers */
router.get("/subscribers", adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM subscribers
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get subscribers error:", error.message);
    res.status(500).json({ error: "Get subscribers error" });
  }
});

module.exports = router;