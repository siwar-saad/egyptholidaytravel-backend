const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/database");
const { sendEmail } = require("../services/emailService");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "egyptholiday_secret_key_2026";

// SIGN UP
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
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
      (first_name, last_name, email, password, phone, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, first_name, last_name, email, phone, role
      `,
      [
        firstName || "",
        lastName || "",
        email,
        hashedPassword,
        phone || "",
        "user",
      ]
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error.message);
    res.status(500).json({ error: "Signup server error" });
  }
});

// LOGIN
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
      token,
      user: {
        id: user.id,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        email: user.email,
        phone: user.phone || "",
        city: user.city || "Mansoura",
        country: user.country || "Egypt",
        avatar: user.avatar || "",
        role,
      },
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error.message);
    res.status(500).json({ error: "Login server error" });
  }
});

// FORGOT PASSWORD - SEND CODE
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Email not found",
      });
    }

    // generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // expires in 15 min
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      `
      UPDATE users
      SET reset_token = $1,
          reset_token_expires = $2
      WHERE email = $3
      `,
      [resetCode, expires, email]
    );

    await sendEmail(
      email,
      "Password Reset Code",
      `
      <div style="font-family: Arial;">
        <h2>Password Reset</h2>
        <p>Your verification code is:</p>

        <div style="
          font-size:32px;
          font-weight:bold;
          letter-spacing:6px;
          color:#935426;
          margin:20px 0;
        ">
          ${resetCode}
        </div>

        <p>This code expires in 15 minutes.</p>
      </div>
      `
    );

    res.json({
      success: true,
      message: "Verification code sent",
    });
  } catch (error) {
    console.log("FORGOT PASSWORD ERROR:", error.message);

    res.status(500).json({
      error: "Server error",
    });
  }
});

// RESET PASSWORD WITH CODE
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, password } = req.body;

    const result = await pool.query(
      `
      SELECT * FROM users
      WHERE email = $1
      AND reset_token = $2
      AND reset_token_expires > NOW()
      `,
      [email, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: "Invalid or expired code",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `
      UPDATE users
      SET password = $1,
          reset_token = NULL,
          reset_token_expires = NULL
      WHERE email = $2
      `,
      [hashedPassword, email]
    );

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log("RESET PASSWORD ERROR:", error.message);

    res.status(500).json({
      error: "Server error",
    });
  }
});

module.exports = router;