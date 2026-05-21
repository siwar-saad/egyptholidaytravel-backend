const express = require("express");
const pool = require("../config/database");

const router = express.Router();

const mapPackage = (row) => ({
  id: row.id,
  title: row.title || row.name || "",
  name: row.name || row.title || "",
  backendName: row.backend_name || row.title || row.name || "",
  backend_name: row.backend_name || row.title || row.name || "",
  route: row.route || "",
  duration: row.duration || "",
  transfer: row.transfer || "",
  transferReduction: row.transfer_reduction || "",
  transfer_reduction: row.transfer_reduction || "",
  startPrice: row.start_price || row.price || "",
  start_price: row.start_price || row.price || "",
  programme: row.programme || "",
  price: row.price || row.start_price || "",
  visibility: row.visibility || "Private",
  image: row.image || "",
  options: row.options || [],
  itinerary: row.itinerary || [],
  displayOrder: row.display_order || 0,
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
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
