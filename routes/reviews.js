const express = require("express");
const pool = require("../config/database");

const router = express.Router();

const mapReview = (review) => ({
  id: review.id,
  name: review.name,
  rating: review.rating,
  text: review.text,
  createdAt: review.created_at,
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, rating, text, created_at
      FROM reviews
      ORDER BY created_at DESC, id DESC
      LIMIT 20
    `);

    res.json(result.rows.map(mapReview));
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ error: "Unable to load reviews" });
  }
});

router.post("/", async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const text = req.body.text?.trim();
    const rating = Number(req.body.rating || 5);

    if (!name || !text) {
      return res.status(400).json({
        error: "Name and review text are required",
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO reviews (name, rating, text)
      VALUES ($1, $2, $3)
      RETURNING id, name, rating, text, created_at
      `,
      [name, rating, text]
    );

    res.status(201).json(mapReview(result.rows[0]));
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ error: "Unable to submit review" });
  }
});

module.exports = router;
