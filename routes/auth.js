const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "egyptholiday_secret_key_2026";

/* SIGNUP */
router.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone,
    } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users 
      (first_name, last_name, email, password, phone, role, city, country)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, first_name, last_name, email, phone, role, city, country, avatar
      `,
      [
        firstName,
        lastName || "",
        email,
        hashedPassword,
        phone || "",
        "user",
        "Mansoura",
        "Egypt",
      ]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        email: user.email,
        phone: user.phone || "",
        city: user.city || "Mansoura",
        country: user.country || "Egypt",
        avatar: user.avatar || "",
        role: user.role || "user",
      },
    });
  } catch (error) {
    console.log("SIGNUP ERROR:", error.message);
    res.status(500).json({ error: "Signup server error" });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const role = user.role || "user";

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name:
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          user.email.split("@")[0],
        email: user.email,
        phone: user.phone || "",
        city: user.city || "Mansoura",
        country: user.country || "Egypt",
        avatar: user.avatar || "",
        role,
      }
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error.message);
    res.status(500).json({ error: "Login server error" });
  }
});

module.exports = router;