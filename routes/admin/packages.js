const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const pool = require("../../config/database");
const { mapPackage, parseJsonArray } = require("../../utils/packages");

const router = express.Router();

const packageImageDir = path.join(__dirname, "../../public/images/packages");

/* ================= PACKAGE HELPERS ================= */
const ensurePackageImageDir = async () => {
  await fs.mkdir(packageImageDir, { recursive: true });
};

const allowedVisibility = ["Published", "Private"];

const normalizeVisibility = (visibility) => {
  return visibility || "Private";
};

const isValidVisibility = (visibility) => {
  return allowedVisibility.includes(normalizeVisibility(visibility));
};

const packageSelectFields = `
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
  hide_price,
  card_title,
  card_subtitle,
  badge_text,
  hotel_name,
  hotel_meal,
  hotel_nights,
  sgl_price,
  dbl_price,
  tpl_price,
  package_group_id,
  package_group_title,
  package_group_subtitle,
  package_group_short_title,
  visibility,
  image,
  options,
  itinerary,
  included,
  excluded,
  flight_details,
  display_order,
  created_at
`;

/* ================= ADMIN PACKAGES ================= */
router.get("/packages", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ${packageSelectFields}
      FROM packages
      ORDER BY display_order ASC, id DESC
    `);

    res.json(
      result.rows.map((row) => mapPackage(row, { includeAdminFields: true }))
    );
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

    await ensurePackageImageDir();

    const match = image.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/i);

    if (!match) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const imageBuffer = Buffer.from(match[2], "base64");
    const maxSize = 5 * 1024 * 1024;

    if (imageBuffer.length > maxSize) {
      return res.status(400).json({
        error: "Image must be 5MB or smaller",
      });
    }

    const extension = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
    const filename = `package-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}.${extension}`;
    const filePath = path.join(packageImageDir, filename);

    await fs.writeFile(filePath, imageBuffer);

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

    if (!isValidVisibility(visibility)) {
      return res.status(400).json({
        error: "Visibility must be Published or Private",
      });
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
      RETURNING ${packageSelectFields}
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
        normalizeVisibility(visibility),
        image || "",
        JSON.stringify(parseJsonArray(options)),
        JSON.stringify(parseJsonArray(itinerary)),
        Number(displayOrder || display_order || 0),
      ]
    );

    res
      .status(201)
      .json(mapPackage(result.rows[0], { includeAdminFields: true }));
  } catch (error) {
    console.error("Create package error:", error);
    res.status(500).json({ error: "Unable to create package" });
  }
});

/* ================= UPDATE PACKAGE ================= */
router.put("/packages/:id", async (req, res) => {
  try {
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

    if (!isValidVisibility(visibility)) {
      return res.status(400).json({
        error: "Visibility must be Published or Private",
      });
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
      RETURNING ${packageSelectFields}
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
        normalizeVisibility(visibility),
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

    res.json(mapPackage(result.rows[0], { includeAdminFields: true }));
  } catch (error) {
    console.error("Update package error:", error);
    res.status(500).json({ error: "Unable to update package" });
  }
});

/* ================= UPDATE PACKAGE VISIBILITY ================= */
router.put("/packages/:id/visibility", async (req, res) => {
  try {
    const { id } = req.params;
    const { visibility } = req.body;

    if (!isValidVisibility(visibility)) {
      return res.status(400).json({
        error: "Visibility must be Published or Private",
      });
    }

    const result = await pool.query(
      `
      UPDATE packages
      SET visibility = $1
      WHERE id = $2
      RETURNING ${packageSelectFields}
      `,
      [normalizeVisibility(visibility), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Package not found" });
    }

    res.json(mapPackage(result.rows[0], { includeAdminFields: true }));
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
