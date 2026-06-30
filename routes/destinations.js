const express = require("express");
const pool = require("../config/database");
const {
  destinationSelectFields,
  mapDestination,
} = require("../utils/destinations");

const router = express.Router();

/* ================= PUBLIC DESTINATIONS ================= */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ${destinationSelectFields}
      FROM destinations
      WHERE visibility = 'Published'
      ORDER BY display_order ASC, created_at DESC, id ASC
    `);

    res.json(result.rows.map((row) => mapDestination(row)));
  } catch (error) {
    console.error("Public destinations error:", error);
    res.status(500).json({ error: "Unable to get destinations" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT ${destinationSelectFields}
      FROM destinations
      WHERE id = $1 AND visibility = 'Published'
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Destination not found" });
    }

    res.json(mapDestination(result.rows[0]));
  } catch (error) {
    console.error("Public destination error:", error);
    res.status(500).json({ error: "Unable to get destination" });
  }
});

module.exports = router;
