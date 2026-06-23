const express = require("express");
const pool = require("../../config/database");
const adminMiddleware = require("../../middleware/adminMiddleware");
const {
  getPagination,
  setPaginationHeaders,
} = require("../../utils/pagination");

const router = express.Router();

/* ================= ADMIN SUBSCRIBERS ================= */
router.get("/subscribers", adminMiddleware, async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req, { defaultLimit: 20 });
    const countResult = await pool.query("SELECT COUNT(*) AS total FROM subscribers");
    const result = await pool.query(
      `
      SELECT id, email, created_at
      FROM subscribers
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    setPaginationHeaders(res, Number(countResult.rows[0].total), page, limit);
    res.json(result.rows);
  } catch (error) {
    console.error("Get subscribers error:", error);
    res.status(500).json({ error: "Unable to get subscribers" });
  }
});

module.exports = router;
