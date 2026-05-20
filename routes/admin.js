const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const pool = require("../config/database");
const { sendEmail } = require("../services/emailService");

const adminMiddleware = require("../middleware/adminMiddleware");

const bcrypt = require("bcryptjs");

const generatePassword = () => {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

  return Array.from(crypto.randomBytes(12), (byte) => {
    return alphabet[byte % alphabet.length];
  }).join("");
};

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

router.post("/", async (req, res) => {
  const { name, city, meal, image, description, singleRoom, doubleRoom, price } = req.body;

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
   CLIENTS CRUD
======================================================= */

/* GET ALL CLIENTS */
router.get("/clients", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        city,
        country,
        role,
        created_at
      FROM users
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get clients error:", error);
    res.status(500).json({ error: "Unable to get clients" });
  }
});

/* CREATE CLIENT */
router.post("/clients", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      phone,
      city,
      country,
      role,
    } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    const generatedPassword = generatePassword();

    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `
        INSERT INTO users
        (
          first_name,
          last_name,
          email,
          phone,
          city,
          country,
          role,
          password
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING
          id,
          first_name,
          last_name,
          email,
          phone,
          city,
          country,
          role,
          created_at
        `,
        [
          first_name || "",
          last_name || "",
          email,
          phone || "",
          city || "",
          country || "Egypt",
          role || "user",
          hashedPassword,
        ]
      );

      const user = result.rows[0];

      await sendEmail(
        email,
        "Welcome to Egypt Holiday Travel",
        `
        <div style="font-family: Arial; padding:20px;">
          <h2>Welcome ${first_name || "Client"}</h2>

          <p>Your account has been created successfully.</p>

          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${generatedPassword}</p>

          <p>Please login and change your password after first login.</p>

          <br/>
          <p>Egypt Holiday Travel</p>
        </div>
        `
      );

      await client.query("COMMIT");

      res.status(201).json({
        success: true,
        message: "Client created successfully and email sent",
        user,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Create client error:", error);

    res.status(500).json({
      error: "Unable to create client",
    });
  }
});
/* UPDATE CLIENT */
router.put("/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      first_name,
      last_name,
      phone,
      city,
      country,
      role,
      password,
    } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    const existing = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: "Client not found",
      });
    }

    let query;
    let values;

    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password, 10);

      query = `
        UPDATE users
        SET
          first_name = $1,
          last_name = $2,
          email = $3,
          phone = $4,
          city = $5,
          country = $6,
          role = $7,
          password = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING
          id,
          first_name,
          last_name,
          email,
          phone,
          city,
          country,
          role
      `;

      values = [
        first_name || "",
        last_name || "",
        email,
        phone || "",
        city || "",
        country || "Egypt",
        role || "user",
        hashedPassword,
        id,
      ];
    } else {
      query = `
        UPDATE users
        SET
          first_name = $1,
          last_name = $2,
          email = $3,
          phone = $4,
          city = $5,
          country = $6,
          role = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING
          id,
          first_name,
          last_name,
          email,
          phone,
          city,
          country,
          role
      `;

      values = [
        first_name || "",
        last_name || "",
        email,
        phone || "",
        city || "",
        country || "Egypt",
        role || "user",
        id,
      ];
    }

    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update client error:", error);
    res.status(500).json({ error: "Unable to update client" });
  }
});

/* DELETE CLIENT */
router.delete("/clients/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(req.user.id) === Number(id)) {
      return res.status(403).json({
        error: "You cannot delete your own admin account",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM users
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Client not found",
      });
    }

    res.json({
      success: true,
      message: "Client deleted successfully",
    });

  } catch (error) {
    console.error("Delete client error:", error);

    res.status(500).json({
      error: "Unable to delete client",
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

router.get("/settings", async (req, res) => {
  try {
    const result = await pool.query("SELECT key, value FROM settings");

    const settings = {
      agency: {
        name: "Egypt Holiday Travel",
        email: "egyptholidaytravel@gmail.com",
        address: "Mansoura, Egypt",
        facebook: "",
        instagram: "",
      },
      contacts: ["01099999234", "01050971444", "01050383173"],
    };

    result.rows.forEach((row) => {
      settings[row.key] = row.value;
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: "Unable to load settings" });
  }
});

router.put("/settings/agency", async (req, res) => {
  try {
    const agency = req.body;

    await pool.query(
      `
      INSERT INTO settings (key, value)
      VALUES ('agency', $1)
      ON CONFLICT (key)
      DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP
      `,
      [JSON.stringify(agency)]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Unable to update agency settings" });
  }
});

router.put("/settings/contacts", async (req, res) => {
  try {
    const { contacts } = req.body;

    await pool.query(
      `
      INSERT INTO settings (key, value)
      VALUES ('contacts', $1)
      ON CONFLICT (key)
      DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP
      `,
      [JSON.stringify(contacts)]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Unable to update contacts" });
  }
});

router.put("/settings/password", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const userResult = await pool.query(
      "SELECT id, password FROM users WHERE id = $1",
      [req.user.id]
    );

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Unable to update password" });
  }
});
module.exports = router;
