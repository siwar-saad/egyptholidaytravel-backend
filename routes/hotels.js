const express = require("express");
const router = express.Router();
const pool = require("../config/database");

const adminMiddleware = require("../middleware/adminMiddleware");

/* =======================================================
   PUBLIC - GET HOTELS
======================================================= */

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM hotels
      ORDER BY id DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("Get hotels error:", error);

    res.status(500).json({
      error: "Unable to load hotels",
    });
  }
});
/* =======================================================
   ADMIN ONLY - CREATE HOTEL
======================================================= */

router.post("/add", adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      city,
      meal,
      image,
      description,
      singleRoom,
      doubleRoom,
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
        description,
        single_room,
        double_room,
        price
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        name,
        city || "",
        meal || "",
        image || "",
        description || "",
        singleRoom || null,
        doubleRoom || null,
        price || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create hotel error:", error);
    res.status(500).json({ error: "Unable to create hotel" });
  }
});

/* =======================================================
   ADMIN ONLY - UPDATE HOTEL
======================================================= */

router.put("/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      city,
      meal,
      image,
      description,
      singleRoom,
      doubleRoom,
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
        description = $5,
        single_room = $6,
        double_room = $7,
        price = $8
      WHERE id = $9
      RETURNING *
      `,
      [
        name,
        city || "",
        meal || "",
        image || "",
        description || "",
        singleRoom || null,
        doubleRoom || null,
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

/* =======================================================
   ADMIN ONLY - DELETE HOTEL
======================================================= */

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