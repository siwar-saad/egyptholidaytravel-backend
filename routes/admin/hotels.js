const express = require("express");
const pool = require("../../config/database");

const router = express.Router();

router.post("/", async (req, res) => {
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
    INSERT INTO hotels
    (name, city, meal, image, description, single_room, double_room, price)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
    `,
    [name, city, meal, image, description, singleRoom, doubleRoom, price]
  );

  res.status(201).json(result.rows[0]);
});

module.exports = router;
