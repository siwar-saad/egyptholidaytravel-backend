const express = require("express");
const pool = require("../config/database");

const router = express.Router();

/* ================= REVIEW HELPERS ================= */
const mapReview = (review) => ({
  id: review.id,
  _id: review.id,
  name: review.name,
  rating: review.rating,
  text: review.text,
  comment: review.text,
  country: review.country || "",
  code: review.country_code || "",
  countryCode: review.country_code || "",
  verified: Boolean(review.verified),
  status: review.status || "private",
  createdAt: review.created_at,
});

/* ================= PUBLIC REVIEWS ================= */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, rating, text, country, country_code, verified, status, created_at
      FROM reviews
      WHERE status = 'public'
      ORDER BY
        CASE name
          WHEN 'Sarah M.' THEN 1
          WHEN 'Emre Y.' THEN 2
          WHEN 'Laura P.' THEN 3
          ELSE 4
        END ASC,
        created_at DESC,
        id DESC
      LIMIT 20
    `);

    res.json(result.rows.map(mapReview));
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ error: "Unable to load reviews" });
  }
});

/* ================= CREATE REVIEW ================= */
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
      INSERT INTO reviews (name, rating, text, verified, status)
      VALUES ($1, $2, $3, false, 'private')
      RETURNING id, name, rating, text, country, country_code, verified, status, created_at
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





