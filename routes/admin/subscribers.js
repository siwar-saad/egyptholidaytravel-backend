const express = require("express");
const pool = require("../../config/database");
const adminMiddleware = require("../../middleware/adminMiddleware");

const router = express.Router();

/* ================= ADMIN SUBSCRIBERS ================= */
router.get("/subscribers", adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, email, created_at
      FROM subscribers
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get subscribers error:", error);
    res.status(500).json({ error: "Unable to get subscribers" });
  }
});

module.exports = router;
