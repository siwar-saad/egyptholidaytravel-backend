const express = require("express");
const router = express.Router();

const pool = require("../config/database");
const { sendEmail } = require("../services/emailService");

const adminMiddleware = require("../middleware/adminMiddleware");

/* Protect all admin routes */
router.use(adminMiddleware);

/* =======================================================
   DASHBOARD
======================================================= */

router.get("/dashboard", async (req, res) => {
  try {
    const packagesCount = await pool.query(
      "SELECT COUNT(*) FROM packages"
    );

    const reservationsCount = await pool.query(
      "SELECT COUNT(*) FROM bookings"
    );

    const clientsCount = await pool.query(
      "SELECT COUNT(*) FROM users"
    );

    const messagesCount = await pool.query(
      "SELECT COUNT(*) FROM messages"
    );

    res.json({
      packages: Number(packagesCount.rows[0].count),
      reservations: Number(reservationsCount.rows[0].count),
      clients: Number(clientsCount.rows[0].count),
      messages: Number(messagesCount.rows[0].count),
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      error: "Unable to load dashboard",
    });
  }
});

/* =======================================================
   PACKAGES
======================================================= */

router.get("/packages", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM packages
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get packages error:", error);

    res.status(500).json({
      error: "Unable to get packages",
    });
  }
});

router.post("/packages", async (req, res) => {
  try {
    const {
      name,
      programme,
      price,
      visibility,
      image,
    } = req.body;

    if (!name || !programme || !price) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO packages
      (
        name,
        programme,
        price,
        visibility,
        image
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        name,
        programme,
        price,
        visibility || "Private",
        image || "",
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create package error:", error);

    res.status(500).json({
      error: "Unable to create package",
    });
  }
});

router.put("/packages/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      programme,
      price,
      visibility,
      image,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE packages
      SET
        name = $1,
        programme = $2,
        price = $3,
        visibility = $4,
        image = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
      `,
      [
        name,
        programme,
        price,
        visibility,
        image,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Package not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update package error:", error);

    res.status(500).json({
      error: "Unable to update package",
    });
  }
});

router.delete("/packages/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM packages
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Package not found",
      });
    }

    res.json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    console.error("Delete package error:", error);

    res.status(500).json({
      error: "Unable to delete package",
    });
  }
});

/* =======================================================
   PACKAGE RESERVATIONS
======================================================= */

router.get("/reservations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM bookings
      WHERE booking_type = 'package'
         OR booking_type IS NULL
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Reservations error:", error);

    res.status(500).json({
      error: "Unable to get reservations",
    });
  }
});

router.put("/reservations/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
      });
    }

    const result = await pool.query(
      `
      UPDATE bookings
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Reservation not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update reservation error:", error);

    res.status(500).json({
      error: "Unable to update reservation",
    });
  }
});

/* =======================================================
   HOTEL RESERVATIONS
======================================================= */

router.get("/hotels/reservations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM bookings
      WHERE booking_type = 'hotel'
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Hotel reservations error:", error);

    res.status(500).json({
      error: "Unable to get hotel reservations",
    });
  }
});

/* =======================================================
   CLIENTS
======================================================= */

router.get("/clients", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        email,
        first_name,
        last_name,
        phone,
        city,
        country,
        role
      FROM users
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Clients error:", error);

    res.status(500).json({
      error: "Unable to get clients",
    });
  }
});

/* =======================================================
   PAYMENTS
======================================================= */

router.get("/payments", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM bookings
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Payments error:", error);

    res.status(500).json({
      error: "Unable to get payments",
    });
  }
});

/* =======================================================
   MESSAGES
======================================================= */

router.get("/messages", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM messages
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get messages error:", error);

    res.status(500).json({
      error: "Unable to get messages",
    });
  }
});

router.put("/messages/:id/reply", async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({
        error: "Reply is required",
      });
    }

    const result = await pool.query(
      `
      UPDATE messages
      SET reply = $1
      WHERE id = $2
      RETURNING *
      `,
      [reply, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Message not found",
      });
    }

    const message = result.rows[0];

    if (message.email) {
      await sendEmail(
        message.email,
        "Reply from Egypt Holiday",
        `
          <h2>Hello ${message.name || "Client"},</h2>

          <p>${reply}</p>

          <br />

          <p>
            Best regards,<br />
            Egypt Holiday Team
          </p>
        `
      );
    }

    res.json({
      success: true,
      message: "Reply sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Reply message error:", error);

    res.status(500).json({
      error: "Unable to send reply",
    });
  }
});
/* =======================================================
   SUBSCRIBERS
======================================================= */

router.get("/subscribers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, email, created_at
      FROM subscribers
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get subscribers error:", error);

    res.status(500).json({
      error: "Unable to get subscribers",
    });
  }
});
module.exports = router;