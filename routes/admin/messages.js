const express = require("express");
const pool = require("../../config/database");
const { sendEmail } = require("../../services/emailService");

const router = express.Router();

router.get("/messages", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.id,
        m.name,
        m.email,
        m.phone,
        m.sender,
        m.is_read,
        m.message,
        m.reply,
        m.replied_at,
        m.created_at,
        u.id AS user_id,
        u.first_name,
        u.last_name
      FROM messages m
      LEFT JOIN users u
        ON LOWER(u.email) = LOWER(m.email)
      ORDER BY m.created_at DESC
    `);

    const messages = result.rows.map((msg) => ({
      id: msg.id,
      isRegisteredUser: Boolean(msg.user_id),
      name:
        `${msg.first_name || ""} ${msg.last_name || ""}`.trim() ||
        msg.name ||
        (msg.user_id ? "Client" : "Visitor"),
      email: msg.email || "",
      phone: msg.phone || "",
      sender: msg.sender || "client",
      isRead: Boolean(msg.is_read),
      message: msg.message || "",
      reply: msg.reply || "",
      createdAt: msg.created_at?.toISOString(),
      date: msg.created_at?.toISOString().split("T")[0],
      dateTime: msg.created_at?.toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      repliedAt: msg.replied_at?.toISOString().split("T")[0] || "",
      repliedAtTime: msg.replied_at
        ? msg.replied_at.toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "",
    }));

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Unable to get messages" });
  }
});

router.get("/messages/unread-count", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) AS count
      FROM messages
      WHERE COALESCE(sender, 'client') = 'client'
      AND COALESCE(is_read, false) = false
    `);

    res.json({ count: Number(result.rows[0].count) });
  } catch (error) {
    console.error("Unread messages count error:", error);
    res.status(500).json({ error: "Unable to get unread messages count" });
  }
});

router.put("/messages/read", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const result = await pool.query(
      `
      UPDATE messages
      SET is_read = true
      WHERE LOWER(email) = LOWER($1)
      AND COALESCE(sender, 'client') = 'client'
      AND COALESCE(is_read, false) = false
      RETURNING id
      `,
      [email]
    );

    res.json({
      success: true,
      readCount: result.rowCount,
    });
  } catch (error) {
    console.error("Mark messages read error:", error);
    res.status(500).json({ error: "Unable to mark messages as read" });
  }
});

router.put("/messages/:id/reply", async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({ error: "Reply is required" });
    }

    const originalResult = await pool.query(
      `
      SELECT
        m.name,
        m.email,
        m.phone,
        u.first_name,
        u.last_name
      FROM messages m
      LEFT JOIN users u
        ON LOWER(u.email) = LOWER(m.email)
      WHERE m.id = $1
      `,
      [id]
    );

    if (originalResult.rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    const originalMessage = originalResult.rows[0];
    const clientName =
      `${originalMessage.first_name || ""} ${originalMessage.last_name || ""}`.trim() ||
      originalMessage.name ||
      "Client";

    const result = await pool.query(
      `
      INSERT INTO messages (name, email, phone, sender, is_read, message)
      VALUES ($1, $2, $3, 'admin', false, $4)
      RETURNING
        id,
        name,
        email,
        phone,
        sender,
        is_read,
        message,
        reply,
        replied_at,
        created_at
      `,
      [
        clientName,
        originalMessage.email || "",
        originalMessage.phone || "",
        reply.trim(),
      ]
    );

    const message = result.rows[0];
    let emailSent = false;
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message.email || "");

    if (isValidEmail) {
      try {
        await sendEmail(
          message.email,
          "Reply from Egypt Holiday",
          `
            <h2>Hello ${clientName},</h2>
            <p>${reply.trim()}</p>
            <br />
            <p>
              Best regards,<br />
              Egypt Holiday Team
            </p>
          `
        );

        emailSent = true;
      } catch (emailError) {
        console.error("Reply email error:", emailError.message);
      }
    }

    res.json({
      success: true,
      emailSent,
      message: emailSent
        ? "Reply saved and email sent successfully"
        : "Reply saved, but email was not sent",
      data: message,
    });
  } catch (error) {
    console.error("Reply message error:", error);
    res.status(500).json({ error: "Unable to send reply" });
  }
});

module.exports = router;
