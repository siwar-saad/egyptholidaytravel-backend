const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../../config/database");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

/* ================= GET PROFILE ================= */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, first_name, last_name, email, phone, city, country, avatar, role
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      email: user.email,
      phone: user.phone || "",
      city: user.city || "",
      country: user.country || "",
      avatar: user.avatar || "",
      role: user.role || "user",
    });
  } catch (err) {
    res.status(500).json({
      error: "Profile error",
      details: err.message,
    });
  }
});

/* ================= UPDATE PROFILE ================= */
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      first_name,
      last_name,
      phone,
      city,
      country,
      avatar,
    } = req.body;

    const nextFirstName = firstName ?? first_name ?? req.user.first_name ?? "";
    const nextLastName = lastName ?? last_name ?? req.user.last_name ?? "";

    const result = await pool.query(
      `
      UPDATE users
      SET first_name = $1,
          last_name = $2,
          phone = $3,
          city = $4,
          country = $5,
          avatar = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id, first_name, last_name, email, phone, city, country, avatar, role
      `,
      [
        nextFirstName,
        nextLastName,
        phone || "",
        city || "",
        country || "",
        avatar || "",
        req.user.id,
      ]
    );

    const user = result.rows[0];

    res.json({
      id: user.id,
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      email: user.email,
      phone: user.phone || "",
      city: user.city || "",
      country: user.country || "",
      avatar: user.avatar || "",
      role: user.role || "user",
    });
  } catch (err) {
    res.status(500).json({
      error: "Profile update error",
      details: err.message,
    });
  }
});

/* ================= CHANGE PASSWORD ================= */
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "All password fields are required",
      });
    }

    const result = await pool.query(
      `
      SELECT password
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      result.rows[0].password
    );

    if (!isMatch) {
      return res.status(401).json({
        error: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `
      UPDATE users
      SET password = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [hashedPassword, req.user.id]
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: "Password change error",
      details: err.message,
    });
  }
});

module.exports = router;
