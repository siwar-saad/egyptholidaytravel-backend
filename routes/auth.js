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

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || "user",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const cleanUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role || "user",
  firstName: user.first_name || "",
  lastName: user.last_name || "",
  name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
});

/* SIGNUP */
router.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      first_name,
      last_name,
      email,
      password,
      confirmPassword,
      phone,
      city,
      country,
    } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        error: "Email, password and confirmation are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
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
      (first_name, last_name, email, password, phone, city, country, role)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id, first_name, last_name, email, phone, city, country, role
      `,
      [
        firstName || first_name || "",
        lastName || last_name || "",
        email,
        hashedPassword,
        phone || "",
        city || "Mansoura",
        country || "Egypt",
        "user",
      ]
    );

    const user = result.rows[0];
    const token = createToken(user);

    res.status(201).json({
      success: true,
      token,
      user: cleanUser(user),
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
      SELECT id, first_name, last_name, email, password, role
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = createToken(user);

    res.json({
      success: true,
      token,
      user: cleanUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
    });
  }
});

/* FORGOT PASSWORD */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const result = await pool.query(
      "SELECT id, email FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        message: "If this email exists, a reset code was sent",
      });
    }

    const user = result.rows[0];
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(resetCode, 10);

    await pool.query(
      `
      UPDATE users
      SET reset_token = $1,
          reset_token_expires = NOW() + INTERVAL '15 minutes'
      WHERE id = $2
      `,
      [hashedCode, user.id]
    );

    await sendEmail(
      user.email,
      "Egypt Holiday - Password Reset Code",
      `
      <h2>Password Reset</h2>
      <p>Your reset code is:</p>
      <h1>${resetCode}</h1>
      <p>This code expires in 15 minutes.</p>
      `
    );

    res.json({
      success: true,
      message: "If this email exists, a reset code was sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      error: "Unable to send reset code",
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

    const validCode = await bcrypt.compare(code, user.reset_token);

    if (!validCode) {
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

    const token = createToken(user);

    res.json({
      success: true,
      message: "Password reset successfully",
      token,
      user: cleanUser(user),
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      error: "Unable to reset password",
    });
  }
});

module.exports = router;