const express = require("express");
const router = express.Router();
const fs = require("fs/promises");
const path = require("path");
const pool = require("../config/database");

const adminMiddleware = require("../middleware/adminMiddleware");

/* ================= HOTEL HELPERS ================= */
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

const uploadDir = path.join(__dirname, "..", "public", "images", "hotels");

const slugifyFileName = (fileName) => {
  const ext = path.extname(fileName || "").toLowerCase();
  const baseName = path
    .basename(fileName || "hotel", ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${baseName || "hotel"}-${Date.now()}${ext}`;
};

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

/* ================= UPLOAD HOTEL IMAGE ================= */
router.post("/upload-image", adminMiddleware, async (req, res) => {
  try {
    const { fileName, dataUrl } = req.body;

    if (!fileName || !dataUrl) {
      return res.status(400).json({
        error: "Image file is required",
      });
    }

    const match = dataUrl.match(/^data:(image\/(png|jpe?g|webp));base64,(.+)$/i);

    if (!match) {
      return res.status(400).json({
        error: "Only PNG, JPG and WEBP images are allowed",
      });
    }

    const ext = path.extname(fileName).toLowerCase();
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp"];

    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({
        error: "Invalid image extension",
      });
    }

    const buffer = Buffer.from(match[3], "base64");
    const maxSize = 5 * 1024 * 1024;

    if (buffer.length > maxSize) {
      return res.status(400).json({
        error: "Image must be 5MB or smaller",
      });
    }

    await fs.mkdir(uploadDir, { recursive: true });

    const safeFileName = slugifyFileName(fileName);
    const filePath = path.join(uploadDir, safeFileName);

    await fs.writeFile(filePath, buffer);

    res.status(201).json({
      success: true,
      url: `/images/hotels/${safeFileName}`,
    });
  } catch (error) {
    console.error("Upload hotel image error:", error);
    res.status(500).json({ error: "Unable to upload hotel image" });
  }
});
/* ================= CREATE HOTEL ================= */
router.post("/add", adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      city,
      meal,
      image,
      gallery,
      description,
      groupTitle,
      group_title,
      groupSubtitle,
      group_subtitle,
      periods,
      displayOrder,
      display_order,
      singleRoom,
      single_room,
      doubleRoom,
      double_room,
      price,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Hotel name is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO hotels
      (
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
        single_room,
        double_room,
        price
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING
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
        single_room,
        double_room,
        price
      `,
      [
        name,
        city || "",
        meal || "",
        image || "",
        JSON.stringify(parseJsonArray(gallery)),
        description || "",
        groupTitle || group_title || "",
        groupSubtitle || group_subtitle || "",
        JSON.stringify(parseJsonArray(periods)),
        Number(displayOrder ?? display_order ?? 0),
        singleRoom || single_room || null,
        doubleRoom || double_room || null,
        price || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create hotel error:", error);
    res.status(500).json({ error: "Unable to create hotel" });
  }
});

/* ================= UPDATE HOTEL ================= */
router.put("/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      city,
      meal,
      image,
      gallery,
      description,
      groupTitle,
      group_title,
      groupSubtitle,
      group_subtitle,
      periods,
      displayOrder,
      display_order,
      singleRoom,
      single_room,
      doubleRoom,
      double_room,
      price,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE hotels
      SET
        name = $1,
        city = $2,
        meal = $3,
        image = $4,
        gallery = $5,
        description = $6,
        group_title = $7,
        group_subtitle = $8,
        periods = $9,
        display_order = $10,
        single_room = $11,
        double_room = $12,
        price = $13
      WHERE id = $14
      RETURNING
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
        single_room,
        double_room,
        price
      `,
      [
        name,
        city || "",
        meal || "",
        image || "",
        JSON.stringify(parseJsonArray(gallery)),
        description || "",
        groupTitle || group_title || "",
        groupSubtitle || group_subtitle || "",
        JSON.stringify(parseJsonArray(periods)),
        Number(displayOrder ?? display_order ?? 0),
        singleRoom || single_room || null,
        doubleRoom || double_room || null,
        price || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update hotel error:", error);
    res.status(500).json({ error: "Unable to update hotel" });
  }
});

/* ================= DELETE HOTEL ================= */
router.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM hotels
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    res.json({
      success: true,
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    console.error("Delete hotel error:", error);
    res.status(500).json({ error: "Unable to delete hotel" });
  }
});
module.exports = router;
