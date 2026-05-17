const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in environment variables");
}

/* ================= AUTH MIDDLEWARE ================= */

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};

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
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      email: user.email,
      phone: user.phone || "",
      city: user.city || "Mansoura",
      country: user.country || "Egypt",
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
    const { name, phone, city, country, avatar } = req.body;

    const fullName = name || "";
    const parts = fullName.trim().split(" ");

    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";

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
        firstName,
        lastName,
        phone || "",
        city || "Mansoura",
        country || "Egypt",
        avatar || "",
        req.user.id,
      ]
    );

    const user = result.rows[0];

    res.json({
      id: user.id,
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      email: user.email,
      phone: user.phone || "",
      city: user.city || "Mansoura",
      country: user.country || "Egypt",
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

/* ================= BOOKINGS ================= */

router.get("/bookings", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, booking_reference, status, search_params, total_price, created_at
      FROM bookings
      WHERE customer_info->>'email' = $1
      ORDER BY created_at DESC
      `,
      [req.user.email]
    );

    const bookings = result.rows.map((booking) => ({
      id: booking.id,
      title: booking.search_params?.to || "Booking",
      date: booking.created_at?.toISOString().split("T")[0],
      status: booking.status || "Pending",
      details: booking.booking_reference || "No reference",
      total_price: booking.total_price || 0,
    }));

    res.json(bookings);
  } catch (err) {
    res.status(500).json({
      error: "Bookings error",
      details: err.message,
    });
  }
});

/* ================= PAYMENTS ================= */

router.get("/payments", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, total_price, status, created_at
      FROM bookings
      WHERE customer_info->>'email' = $1
      ORDER BY created_at DESC
      `,
      [req.user.email]
    );

    const payments = result.rows.map((payment) => ({
      id: payment.id,
      invoice: `Invoice #${payment.id}`,
      status: payment.status === "Confirmed" ? "Paid" : "Not Paid",
      amount: payment.total_price || 0,
      date: payment.created_at?.toISOString().split("T")[0],
    }));

    res.json(payments);
  } catch (err) {
    res.status(500).json({
      error: "Payments error",
      details: err.message,
    });
  }
});

/* ================= GET MESSAGES ================= */

router.get("/messages", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, email, message, reply, created_at
      FROM messages
      WHERE email = $1
      ORDER BY created_at DESC
      `,
      [req.user.email]
    );

    const messages = result.rows.map((msg) => ({
      id: msg.id,
      name: msg.name,
      email: msg.email,
      message: msg.message,
      reply: msg.reply || "",
      date: msg.created_at?.toISOString().split("T")[0],
    }));

    res.json(messages);
  } catch (err) {
    res.status(500).json({
      error: "Messages error",
      details: err.message,
    });
  }
});

/* ================= SEND MESSAGE ================= */

router.post("/messages", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const userResult = await pool.query(
      `
      SELECT first_name, last_name, email
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    const user = userResult.rows[0];

    const name =
      `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Client";

    const result = await pool.query(
      `
      INSERT INTO messages (name, email, message)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, message, created_at
      `,
      [name, user.email, message]
    );

    const msg = result.rows[0];

    res.status(201).json({
      id: msg.id,
      name: msg.name,
      email: msg.email,
      message: msg.message,
      reply: "",
      date: msg.created_at?.toISOString().split("T")[0],
    });
  } catch (err) {
    res.status(500).json({
      error: "Message send error",
      details: err.message,
    });
  }
});

module.exports = router;