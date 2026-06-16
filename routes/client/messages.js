const express = require("express");
const pool = require("../../config/database");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

/* ================= GET MESSAGES ================= */
router.get("/messages", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, email, phone, sender, is_read, message, reply, replied_at, created_at
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
      phone: msg.phone || "",
      sender: msg.sender || "client",
      isRead: Boolean(msg.is_read),
      message: msg.message,
      createdAt: msg.created_at?.toISOString(),
      reply: msg.reply || "",
      repliedAt: msg.replied_at?.toISOString().split("T")[0] || "",
      repliedAtTime: msg.replied_at
        ? msg.replied_at.toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "",
      date: msg.created_at?.toISOString().split("T")[0],
      dateTime: msg.created_at?.toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    }));

    res.json(messages);
  } catch (err) {
    console.error("Messages error:", err);
    res.status(500).json({
      error: "Messages error",
    });
  }
});

/* ================= GET UNREAD MESSAGES COUNT ================= */
router.get("/messages/unread-count", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT COUNT(*) AS count
      FROM messages
      WHERE LOWER(email) = LOWER($1)
      AND sender = 'admin'
      AND COALESCE(is_read, false) = false
      `,
      [req.user.email]
    );

    res.json({
      count: Number(result.rows[0].count),
    });
  } catch (err) {
    console.error("Unread messages count error:", err);
    res.status(500).json({
      error: "Unread messages count error",
    });
  }
});

/* ================= MARK ADMIN MESSAGES AS READ ================= */
router.put("/messages/read", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      UPDATE messages
      SET is_read = true
      WHERE LOWER(email) = LOWER($1)
      AND sender = 'admin'
      AND COALESCE(is_read, false) = false
      RETURNING id
      `,
      [req.user.email]
    );

    res.json({
      success: true,
      readCount: result.rowCount,
    });
  } catch (err) {
    console.error("Mark messages read error:", err);
    res.status(500).json({
      error: "Mark messages read error",
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
      SELECT first_name, last_name, email, phone
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
      INSERT INTO messages (name, email, phone, sender, is_read, message)
      VALUES ($1, $2, $3, 'client', false, $4)
      RETURNING id, name, email, phone, sender, is_read, message, reply, replied_at, created_at
      `,
      [name, user.email, user.phone || "", message]
    );

    const msg = result.rows[0];

    res.status(201).json({
      id: msg.id,
      name: msg.name,
      email: msg.email,
      phone: msg.phone || "",
      sender: msg.sender || "client",
      isRead: Boolean(msg.is_read),
      message: msg.message,
      createdAt: msg.created_at?.toISOString(),
      reply: msg.reply || "",
      repliedAt: msg.replied_at?.toISOString().split("T")[0] || "",
      repliedAtTime: msg.replied_at
        ? msg.replied_at.toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "",
      date: msg.created_at?.toISOString().split("T")[0],
      dateTime: msg.created_at?.toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    });
  } catch (err) {
    console.error("Message send error:", err);
    res.status(500).json({
      error: "Message send error",
    });
  }
});

module.exports = router;
