const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { sendEmail } = require("../services/emailService");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in environment variables");
}
/* SIGN UP */
router.post("/signup", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      city,
      country,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users
      (
        first_name,
        last_name,
        email,
        password,
        phone,
        city,
        country,
        role
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        first_name || "",
        last_name || "",
        email,
        hashedPassword,
        phone || "",
        city || "Mansoura",
        country || "Egypt",
        "user",
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
        name:
          `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        email: user.email,
        phone: user.phone || "",
        city: user.city || "Mansoura",
        country: user.country || "Egypt",
        avatar: user.avatar || "",
        role: user.role || "user",
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      error: "Unable to create account",
    });
  }
});
/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const user = result.rows[0];

    if (!user.password) {
      return res.status(500).json({
        error: "User password missing in database",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      error: "Login failed",
    });
  }
});

/* RESET PASSWORD */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        error: "Email, code and new password are required",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      AND reset_token IS NOT NULL
      AND reset_token_expires > NOW()
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: "Invalid or expired reset code",
      });
    }

    const user = result.rows[0];

    const isValidCode = await bcrypt.compare(code, user.reset_token);

    if (!isValidCode) {
      return res.status(400).json({
        error: "Invalid or expired reset code",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `
      UPDATE users
      SET password = $1,
          reset_token = NULL,
          reset_token_expires = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [hashedPassword, user.id]
    );

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
      message: "Password reset successfully",
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
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Unable to reset password" });
  }
});

module.exports = router;