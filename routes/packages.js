const express = require("express");
const pool = require("../config/database");
const { mapPackage } = require("../utils/packages");

const router = express.Router();

/* ================= PUBLIC PACKAGES ================= */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        name,
        backend_name,
        route,
        duration,
        transfer,
        transfer_reduction,
        start_price,
        programme,
        price,
        country,
        destination,
        region,
        force_category,
        visibility,
        image,
        options,
        itinerary,
        included,
        display_order
      FROM packages
      WHERE visibility = 'Published'
      ORDER BY display_order ASC, id DESC
    `);

    res.json(result.rows.map(mapPackage));
  } catch (error) {
    console.error("Public packages error:", error);
    res.status(500).json({ error: "Unable to get packages" });
  }
});

module.exports = router;
