const crypto = require("crypto");
const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const pool = require("../../config/database");
const {
  destinationSelectFields,
  mapDestination,
  parseArray,
} = require("../../utils/destinations");

const router = express.Router();
const destinationImageDir = path.join(
  __dirname,
  "../../public/images/destinations"
);
const allowedVisibility = ["Published", "Private"];

const cleanText = (value) => String(value || "").trim();
const normalizeVisibility = (body) => {
  if (body.visibility) return body.visibility;
  if (body.isPublished === false) return "Private";
  return "Published";
};

const makeId = (body) => {
  const requestedId = cleanText(body.id)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  return requestedId || crypto.randomUUID();
};

const normalizePayload = (body, existingId) => {
  const title = cleanText(body.title || body.name);
  const visibility = normalizeVisibility(body);
  const images = parseArray(body.images).filter(
    (item) => typeof item === "string" && item.trim()
  );
  const image = cleanText(body.image || images[0]);
  const days = parseArray(body.days).length
    ? parseArray(body.days)
    : parseArray(body.dayByDay);

  return {
    id: existingId || makeId(body),
    name: title,
    title,
    description: cleanText(body.description || body.short),
    region: cleanText(body.region),
    country: cleanText(body.country || body.stamp) || "Egypt",
    badge: cleanText(body.badge || body.tag) || "Destination Program",
    duration: cleanText(body.duration),
    location: cleanText(body.location),
    image,
    images: images.length ? images : image ? [image] : [],
    highlights: parseArray(body.highlights),
    included: parseArray(body.included),
    days,
    visibility,
    displayOrder: Number(body.displayOrder ?? body.display_order ?? 0) || 0,
    data: {
      ...body,
      id: existingId || makeId(body),
      name: title,
      title,
      image,
      images: images.length ? images : image ? [image] : [],
      days,
      dayByDay: parseArray(body.dayByDay).length
        ? parseArray(body.dayByDay)
        : days,
      isPublished: visibility === "Published",
    },
  };
};

const validatePayload = (payload) => {
  if (!payload.title) return "Destination title is required";
  if (!payload.duration) return "Duration is required";
  if (!payload.location) return "Location is required";
  if (!allowedVisibility.includes(payload.visibility)) {
    return "Visibility must be Published or Private";
  }
  return null;
};

/* ================= ADMIN DESTINATIONS ================= */
router.get("/destinations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ${destinationSelectFields}
      FROM destinations
      ORDER BY display_order ASC, created_at DESC, id ASC
    `);

    res.json(
      result.rows.map((row) =>
        mapDestination(row, { includeAdminFields: true })
      )
    );
  } catch (error) {
    console.error("Get destinations error:", error);
    res.status(500).json({ error: "Unable to get destinations" });
  }
});

router.post("/destinations/upload-image", async (req, res) => {
  try {
    const { image } = req.body;
    const match = String(image || "").match(
      /^data:image\/(png|jpe?g|webp);base64,(.+)$/i
    );

    if (!match) {
      return res.status(400).json({ error: "Valid image is required" });
    }

    const imageBuffer = Buffer.from(match[2], "base64");
    if (imageBuffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "Image must be 5MB or smaller" });
    }

    await fs.mkdir(destinationImageDir, { recursive: true });
    const extension = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
    const filename = `destination-${Date.now()}-${crypto.randomUUID()}.${extension}`;
    await fs.writeFile(path.join(destinationImageDir, filename), imageBuffer);

    res.status(201).json({ image: `/images/destinations/${filename}` });
  } catch (error) {
    console.error("Upload destination image error:", error);
    res.status(500).json({ error: "Unable to upload destination image" });
  }
});

router.post("/destinations", async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const validationError = validatePayload(payload);
    if (validationError) return res.status(400).json({ error: validationError });

    const result = await pool.query(
      `
      INSERT INTO destinations
      (id, name, title, description, region, country, badge, duration, location,
       image, images, highlights, included, days, visibility, display_order, data)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb,$13::jsonb,
       $14::jsonb,$15,$16,$17::jsonb)
      RETURNING ${destinationSelectFields}
      `,
      [
        payload.id, payload.name, payload.title, payload.description,
        payload.region, payload.country, payload.badge, payload.duration,
        payload.location, payload.image, JSON.stringify(payload.images),
        JSON.stringify(payload.highlights), JSON.stringify(payload.included),
        JSON.stringify(payload.days), payload.visibility, payload.displayOrder,
        JSON.stringify({ ...payload.data, id: payload.id }),
      ]
    );

    res.status(201).json(
      mapDestination(result.rows[0], { includeAdminFields: true })
    );
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Destination id already exists" });
    }
    console.error("Create destination error:", error);
    res.status(500).json({ error: "Unable to create destination" });
  }
});

router.put("/destinations/:id", async (req, res) => {
  try {
    const payload = normalizePayload(req.body, req.params.id);
    const validationError = validatePayload(payload);
    if (validationError) return res.status(400).json({ error: validationError });

    const result = await pool.query(
      `
      UPDATE destinations
      SET name = $1, title = $2, description = $3, region = $4, country = $5,
          badge = $6, duration = $7, location = $8, image = $9,
          images = $10::jsonb, highlights = $11::jsonb, included = $12::jsonb,
          days = $13::jsonb, visibility = $14, display_order = $15,
          data = $16::jsonb, updated_at = CURRENT_TIMESTAMP
      WHERE id = $17
      RETURNING ${destinationSelectFields}
      `,
      [
        payload.name, payload.title, payload.description, payload.region,
        payload.country, payload.badge, payload.duration, payload.location,
        payload.image, JSON.stringify(payload.images),
        JSON.stringify(payload.highlights), JSON.stringify(payload.included),
        JSON.stringify(payload.days), payload.visibility, payload.displayOrder,
        JSON.stringify(payload.data), req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Destination not found" });
    }

    res.json(mapDestination(result.rows[0], { includeAdminFields: true }));
  } catch (error) {
    console.error("Update destination error:", error);
    res.status(500).json({ error: "Unable to update destination" });
  }
});

router.put("/destinations/:id/visibility", async (req, res) => {
  try {
    const visibility = normalizeVisibility(req.body);
    if (!allowedVisibility.includes(visibility)) {
      return res.status(400).json({ error: "Visibility must be Published or Private" });
    }

    const result = await pool.query(
      `
      UPDATE destinations
      SET visibility = $1,
          data = COALESCE(data, '{}'::jsonb) || jsonb_build_object(
            'isPublished', $1 = 'Published'
          ),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING ${destinationSelectFields}
      `,
      [visibility, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Destination not found" });
    }

    res.json(mapDestination(result.rows[0], { includeAdminFields: true }));
  } catch (error) {
    console.error("Update destination visibility error:", error);
    res.status(500).json({ error: "Unable to update destination visibility" });
  }
});

router.delete("/destinations/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM destinations WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Destination not found" });
    }

    res.json({ success: true, message: "Destination deleted successfully" });
  } catch (error) {
    console.error("Delete destination error:", error);
    res.status(500).json({ error: "Unable to delete destination" });
  }
});

module.exports = router;
