const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// DASHBOARD
router.get("/dashboard", async (req, res) => {
  try {
    const packagesCount = await pool.query("SELECT COUNT(*) FROM packages");
    const reservationsCount = await pool.query("SELECT COUNT(*) FROM bookings");
    const clientsCount = await pool.query("SELECT COUNT(*) FROM users");
    const messagesCount = await pool.query("SELECT COUNT(*) FROM messages");

    res.json({
      packages: Number(packagesCount.rows[0].count),
      reservations: Number(reservationsCount.rows[0].count),
      clients: Number(clientsCount.rows[0].count),
      messages: Number(messagesCount.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: "Dashboard error" });
  }
});

// PACKAGES ADMIN
router.get("/packages", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, programme, price, visibility, image
      FROM packages
      ORDER BY id DESC
    `);

    const data = result.rows.map((item) => ({
      id: item.id,
      name: item.title,
      programme: item.programme,
      price: item.price,
      visibility: item.visibility || "Private",
      image: item.image,
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Packages error" });
  }
});

router.post("/packages", async (req, res) => {
  try {
    const { name, programme, price, visibility, image } = req.body;

    const result = await pool.query(
      `
      INSERT INTO packages (title, programme, price, visibility, image)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [name, programme, price, visibility || "Private", image]
    );

    const item = result.rows[0];

    res.status(201).json({
      id: item.id,
      name: item.title,
      programme: item.programme,
      price: item.price,
      visibility: item.visibility,
      image: item.image,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Add package error" });
  }
});

router.put("/packages/:id/visibility", async (req, res) => {
  try {
    const { visibility } = req.body;

    const result = await pool.query(
      `
      UPDATE packages
      SET visibility = $1
      WHERE id = $2
      RETURNING *
      `,
      [visibility, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Update visibility error" });
  }
});

router.delete("/packages/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM packages WHERE id = $1", [req.params.id]);
    res.json({ message: "Package deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete package error" });
  }
});

// RESERVATIONS
router.get("/reservations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, status, search_params, customer_info, created_at
      FROM bookings
      ORDER BY created_at DESC
    `);

    const reservations = result.rows.map((b) => ({
      id: b.id,
      name:
        b.customer_info?.name ||
        b.customer_info?.firstName ||
        b.customer_info?.email ||
        "Unknown",
      trip: b.search_params?.to || b.search_params?.destination || "N/A",
      date: b.created_at?.toISOString().split("T")[0],
      status: b.status || "Pending",
    }));

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: "Reservations error" });
  }
});

router.put("/reservations/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const result = await pool.query(
      `
      UPDATE bookings
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Update reservation error" });
  }
});

// CLIENTS
router.get("/clients", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, phone
      FROM users
      ORDER BY id DESC
    `);

    const clients = result.rows.map((user) => ({
      id: user.id,
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Client",
      email: user.email,
      phone: user.phone || "No phone",
    }));

    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Clients error" });
  }
});

// PAYMENTS
router.get("/payments", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, total_price, status, customer_info
      FROM bookings
      ORDER BY id DESC
    `);

    const payments = result.rows.map((p) => ({
      id: p.id,
      invoice: `Invoice #${p.id}`,
      client: p.customer_info?.name || p.customer_info?.email || "Unknown",
      amount: p.total_price ? `$${p.total_price}` : "$0",
      status: p.status === "Confirmed" ? "Paid" : "Not Paid",
    }));

    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Payments error" });
  }
});

// MESSAGES
router.get("/messages", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, message, reply, created_at
      FROM messages
      ORDER BY created_at DESC
    `);

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
    res.status(500).json({ error: "Messages error" });
  }
});

router.put("/messages/:id/reply", async (req, res) => {
  try {
    const { reply } = req.body;

    const result = await pool.query(
      `
      UPDATE messages
      SET reply = $1
      WHERE id = $2
      RETURNING *
      `,
      [reply, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Reply error" });
  }
});

module.exports = router;