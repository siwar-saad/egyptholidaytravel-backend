const express = require("express");
const router = express.Router();
const pool = require('../config/database');

// GET /api/packages - Get all packages (for Packages page)
router.get("/", async (req, res) => {
  const search = req.query.search || "";
  
  try {
    let query = `SELECT id, title, image FROM packages`;
    let params = [];
    
    if (search) {
      query += ` WHERE title ILIKE $1`;
      params = [`%${search}%`];
    }
    
    query += ` ORDER BY id`;
    
    const result = await pool.query(query, params);
    
    const packages = result.rows.map(pkg => ({
      id: pkg.id,
      title: pkg.title,
      image: pkg.image
    }));
    
    res.json({
      success: true,
      count: packages.length,
      packages: packages
    });
  } catch (error) {
    console.error('Packages query error:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// GET /api/packages/:id - Get single package details
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  
  try {
    const result = await pool.query('SELECT * FROM destinations WHERE id = $1 OR name ILIKE $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Package not found" });
    }
    
    const destination = result.rows[0];
    
    res.json({
      success: true,
      package: JSON.parse(destination.data)
    });
  } catch (error) {
    console.error('Package query error:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

module.exports = router;