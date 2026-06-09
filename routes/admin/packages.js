const express = require("express");
const fs = require("fs");
const path = require("path");
const pool = require("../../config/database");

const router = express.Router();

const packageImageDir = path.join(__dirname, "../../public/images/packages");

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
      ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
      display_order = COALESCE(display_order, 0),
      created_at = COALESCE(created_at, CURRENT_TIMESTAMP)
  `);
};

const ensurePackageImageDir = () => {
  if (!fs.existsSync(packageImageDir)) {
    fs.mkdirSync(packageImageDir, { recursive: true });
  }
};

const parseJsonArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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
  display_order: row.display_order || 0,
  created_at: row.created_at,
});

/* ================= ADMIN PACKAGES ================= */
router.get("/packages", async (req, res) => {
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
        display_order,
        created_at
      FROM packages
      ORDER BY display_order ASC, id DESC
    `);

    res.json(result.rows.map(mapPackage));
  } catch (error) {
    console.error("Get packages error:", error);
    res.status(500).json({ error: "Unable to get packages" });
  }
});

/* ================= UPLOAD PACKAGE IMAGE ================= */
router.post("/packages/upload-image", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image || !image.startsWith("data:image/")) {
      return res.status(400).json({ error: "Valid image is required" });
    }

    ensurePackageImageDir();

    const match = image.match(/^data:image\/(\w+);base64,(.+)$/);

    if (!match) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const extension = match[1] === "jpeg" ? "jpg" : match[1];
    const filename = `package-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}.${extension}`;
    const filePath = path.join(packageImageDir, filename);

    fs.writeFileSync(filePath, Buffer.from(match[2], "base64"));

    res.status(201).json({
      image: `/images/packages/${filename}`,
    });
  } catch (error) {
    console.error("Upload package image error:", error);
    res.status(500).json({ error: "Unable to upload package image" });
  }
});

/* ================= CREATE PACKAGE ================= */
router.post("/packages", async (req, res) => {
  try {
    await ensurePackageColumns();

    const {
      name,
      title,
      backendName,
      backend_name,
      route,
      duration,
      transfer,
      transferReduction,
      transfer_reduction,
      startPrice,
      start_price,
      programme,
      price,
      visibility,
      image,
      options,
      itinerary,
      displayOrder,
      display_order,
    } = req.body;

    const packageName = (name || title || "").trim();

    if (!packageName) {
      return res.status(400).json({ error: "Package name is required" });
    }

    const result = await pool.query(
      `
      INSERT INTO packages
      (
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
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14::jsonb,$15)
      RETURNING
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
        display_order,
        created_at
      `,
      [
        packageName,
        packageName,
        backendName || backend_name || packageName,
        route || "",
        duration || "",
        transfer || "",
        transferReduction || transfer_reduction || "",
        startPrice || start_price || price || "",
        programme || "",
        price || startPrice || start_price || "",
        visibility || "Private",
        image || "",
        JSON.stringify(parseJsonArray(options)),
        JSON.stringify(parseJsonArray(itinerary)),
        Number(displayOrder || display_order || 0),
      ]
    );

    res.status(201).json(mapPackage(result.rows[0]));
  } catch (error) {
    console.error("Create package error:", error);
    res.status(500).json({ error: "Unable to create package" });
  }
});

/* ================= UPDATE PACKAGE ================= */
router.put("/packages/:id", async (req, res) => {
  try {
    await ensurePackageColumns();

    const { id } = req.params;
    const {
      name,
      title,
      backendName,
      backend_name,
      route,
      duration,
      transfer,
      transferReduction,
      transfer_reduction,
      startPrice,
      start_price,
      programme,
      price,
      visibility,
      image,
      options,
      itinerary,
      displayOrder,
      display_order,
    } = req.body;

    const packageName = (name || title || "").trim();

    if (!packageName) {
      return res.status(400).json({ error: "Package name is required" });
    }

    const result = await pool.query(
      `
      UPDATE packages
      SET title = $1,
          name = $2,
          backend_name = $3,
          route = $4,
          duration = $5,
          transfer = $6,
          transfer_reduction = $7,
          start_price = $8,
          programme = $9,
          price = $10,
          visibility = $11,
          image = $12,
          options = $13::jsonb,
          itinerary = $14::jsonb,
          display_order = $15
      WHERE id = $16
      RETURNING
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
        display_order,
        created_at
      `,
      [
        packageName,
        packageName,
        backendName || backend_name || packageName,
        route || "",
        duration || "",
        transfer || "",
        transferReduction || transfer_reduction || "",
        startPrice || start_price || price || "",
        programme || "",
        price || startPrice || start_price || "",
        visibility || "Private",
        image || "",
        JSON.stringify(parseJsonArray(options)),
        JSON.stringify(parseJsonArray(itinerary)),
        Number(displayOrder || display_order || 0),
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Package not found" });
    }

    res.json(mapPackage(result.rows[0]));
  } catch (error) {
    console.error("Update package error:", error);
    res.status(500).json({ error: "Unable to update package" });
  }
});

/* ================= UPDATE PACKAGE VISIBILITY ================= */
router.put("/packages/:id/visibility", async (req, res) => {
  try {
    await ensurePackageColumns();

    const { id } = req.params;
    const { visibility } = req.body;

    const result = await pool.query(
      `
      UPDATE packages
      SET visibility = $1
      WHERE id = $2
      RETURNING
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
        display_order,
        created_at
      `,
      [visibility || "Private", id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Package not found" });
    }

    res.json(mapPackage(result.rows[0]));
  } catch (error) {
    console.error("Update package visibility error:", error);
    res.status(500).json({ error: "Unable to update package visibility" });
  }
});

/* ================= DELETE PACKAGE ================= */
router.delete("/packages/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM packages
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Package not found" });
    }

    res.json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    console.error("Delete package error:", error);
    res.status(500).json({ error: "Unable to delete package" });
  }
});

module.exports = router;
