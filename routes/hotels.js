const express = require("express");
const router = express.Router();
const pool = require("../config/database");

/* ================= HOTEL HELPERS ================= */
const ensureHotelColumns = async () => {
  await pool.query(`
    ALTER TABLE hotels
      ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) DEFAULT 'Published',
      ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS periods JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS group_title VARCHAR(255),
      ADD COLUMN IF NOT EXISTS group_subtitle TEXT,
      ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0
  `);

  await pool.query(`
    UPDATE hotels
    SET
      visibility = COALESCE(NULLIF(visibility, ''), 'Published'),
      gallery = COALESCE(gallery, '[]'::jsonb),
      periods = COALESCE(periods, '[]'::jsonb),
      display_order = COALESCE(display_order, 0)
  `);
};

/* ================= PUBLIC HOTELS ================= */
router.get("/", async (req, res) => {
  try {
    await ensureHotelColumns();

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
