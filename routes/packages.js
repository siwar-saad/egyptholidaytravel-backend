const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// GET ALL PACKAGES
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM packages
      ORDER BY id ASC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ADD PACKAGE
router.post("/", async (req, res) => {
  try {
    const { title, image } = req.body;

    const result = await pool.query(
      `
      INSERT INTO packages (title, image)
      VALUES ($1, $2)
      RETURNING *
      `,
      [title, image]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Add package error" });
  }
});

// DELETE PACKAGE
router.delete("/:id", async (req, res) => {
  try {
    await pool.query(
      `
      DELETE FROM packages
      WHERE id = $1
      `,
      [req.params.id]
    );

    res.json({ message: "Package deleted" });
  } catch (error) {
    res.status(500).json({ error: "Delete package error" });
  }
});

module.exports = router;