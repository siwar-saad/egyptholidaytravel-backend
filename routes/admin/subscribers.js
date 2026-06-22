const express = require("express");
const pool = require("../../config/database");
const adminMiddleware = require("../../middleware/adminMiddleware");

const router = express.Router();

const getPagination = (req) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

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
};

/* ================= ADMIN SUBSCRIBERS ================= */
router.get("/subscribers", adminMiddleware, async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req);
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
