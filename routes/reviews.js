const express = require("express");
const pool = require("../config/database");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();
const allowedStatuses = ["public", "private"];

const mapReview = (review) => ({
  id: review.id,
  _id: review.id,
  name: review.name,
  rating: review.rating,
  text: review.text,
  comment: review.text,
  status: review.status || "private",
  createdAt: review.created_at,
});

router.get("/admin/all", adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, rating, text, status, created_at
      FROM reviews
      ORDER BY created_at DESC, id DESC
    `);

    res.json(result.rows.map(mapReview));
  } catch (error) {
    console.error("Get admin reviews error:", error);
    res.status(500).json({ error: "Unable to load reviews" });
  }
});

router.put("/admin/:id/status", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid review status" });
    }

    const result = await pool.query(
      `
      UPDATE reviews
      SET status = $1
      WHERE id = $2
      RETURNING id, name, rating, text, status, created_at
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json(mapReview(result.rows[0]));
  } catch (error) {
    console.error("Update review status error:", error);
    res.status(500).json({ error: "Unable to update review status" });
  }
});

router.delete("/admin/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM reviews
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ error: "Unable to delete review" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, rating, text, status, created_at
      FROM reviews
      WHERE status = 'public'
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
      INSERT INTO reviews (name, rating, text, status)
      VALUES ($1, $2, $3, 'private')
      RETURNING id, name, rating, text, status, created_at
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
