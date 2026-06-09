const express = require("express");
const pool = require("../config/database");

const router = express.Router();

/* ================= PACKAGE HELPERS ================= */
const ensurePackageColumns = async () => {
  await pool.query(`
    ALTER TABLE packages
      ADD COLUMN IF NOT EXISTS title VARCHAR(255),
      ADD COLUMN IF NOT EXISTS name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS backend_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS route VARCHAR(255),
      ADD COLUMN IF NOT EXISTS duration VARCHAR(100),
      ADD COLUMN IF NOT EXISTS transfer TEXT,
      ADD COLUMN IF NOT EXISTS transfer_reduction VARCHAR(255),
      ADD COLUMN IF NOT EXISTS start_price VARCHAR(100),
      ADD COLUMN IF NOT EXISTS programme TEXT,
      ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) DEFAULT 'Private',
      ADD COLUMN IF NOT EXISTS image TEXT,
      ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0
  `);

  await pool.query(`
    UPDATE packages
    SET
      title = COALESCE(NULLIF(title, ''), NULLIF(name, ''), 'Package'),
      name = COALESCE(NULLIF(name, ''), NULLIF(title, ''), 'Package'),
      backend_name = COALESCE(NULLIF(backend_name, ''), NULLIF(title, ''), NULLIF(name, ''), 'Package'),
      visibility = COALESCE(NULLIF(visibility, ''), 'Private'),
      options = COALESCE(options, '[]'::jsonb),
      itinerary = COALESCE(itinerary, '[]'::jsonb),
      display_order = COALESCE(display_order, 0)
  `);
};

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

/* ================= PUBLIC PACKAGES ================= */
router.get("/", async (req, res) => {
  try {
    await ensurePackageColumns();

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
        visibility,
        image,
        options,
        itinerary,
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
