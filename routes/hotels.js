const express = require("express");
const router = express.Router();
const pool = require("../config/database");

/* ================= PUBLIC HOTELS ================= */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        city,
        meal,
        image,
        gallery,
        description,
        group_title,
        group_subtitle,
        periods,
        display_order,
        visibility,
        single_room,
        double_room,
        price
      FROM hotels
      WHERE visibility = 'Published'
      ORDER BY COALESCE(display_order, 0), id DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("Get hotels error:", error);

    res.status(500).json({
      error: "Unable to load hotels",
    });
  }
});

module.exports = router;
