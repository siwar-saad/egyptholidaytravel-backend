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

// ==================== PACKAGES ====================

// GET all packages
router.get("/packages", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        COALESCE(name, title) AS name,
        title,
        programme,
        price,
        COALESCE(visibility, 'Private') AS visibility,
        image,
        created_at
      FROM packages
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("GET packages error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ADD package
router.post("/packages", async (req, res) => {
  try {
    const { name, title, programme, price, visibility, image } = req.body;

    const packageName = name || title;

    if (!packageName || !programme || !price) {
      return res.status(400).json({
        error: "name/title, programme and price are required",
      });
    }
    const cleanPrice = String(price).replace(/[^\d.]/g, "");
    const numericPrice = Number(cleanPrice);

    if (Number.isNaN(numericPrice)) {
      return res.status(400).json({
        error: "Invalid price",
      });
    }
    const result = await pool.query(
      `
      INSERT INTO packages 
      (name, title, programme, price, visibility, image)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        packageName,
        packageName,
        programme,
        numericPrice,
        visibility || "Private",
        image || "",
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("ADD package error:", err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE package
router.put("/packages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, programme, price, visibility, image } = req.body;

    const packageName = name || title;

    const result = await pool.query(
      `
      UPDATE packages
      SET 
        name = COALESCE($1, name),
        title = COALESCE($1, title),
        programme = COALESCE($2, programme),
        price = COALESCE($3, price),
        visibility = COALESCE($4, visibility),
        image = COALESCE($5, image),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
      `,
      [packageName, programme, price, visibility, image, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Package not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE package error:", err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE package visibility
router.put("/packages/:id/visibility", async (req, res) => {
  try {
    const { id } = req.params;
    const { visibility } = req.body;

    if (!["Public", "Private"].includes(visibility)) {
      return res.status(400).json({ error: "Invalid visibility" });
    }

    const result = await pool.query(
      `
      UPDATE packages
      SET visibility = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [visibility, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Package not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE visibility error:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE package
router.delete("/packages/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM packages WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Package not found" });
    }

    res.json({ success: true, message: "Package deleted successfully" });
  } catch (err) {
    console.error("DELETE package error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== RESERVATIONS ====================

router.get("/reservations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, status, search_params, customer_info, created_at
      FROM bookings
      ORDER BY created_at DESC
    `);

    const reservations = result.rows.map((b) => ({
      id: b.id,
      name: b.customer_info?.name || b.customer_info?.firstName || b.customer_info?.email || "Unknown",
      packageName: b.search_params?.to || b.search_params?.destination || "N/A",
      date: b.created_at?.toISOString().split("T")[0],
      status: b.status || "Pending",
      type: "package"
    }));

    res.json(reservations);
  } catch (err) {
    console.error("Reservations error:", err);
    res.status(500).json({ error: "Reservations error" });
  }
});

router.put("/reservations/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE bookings
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update reservation error:", err);
    res.status(500).json({ error: "Update reservation error" });
  }
});

// ==================== CLIENTS ====================

router.get("/clients", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, phone
      FROM users
      ORDER BY id DESC
    `);

    res.json(
      result.rows.map((user) => ({
        id: user.id,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Client",
        email: user.email || "No email",
        phone: user.phone || "No phone",
      }))
    );
  } catch (err) {
    console.error("CLIENTS ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==================== PAYMENTS ====================

router.get("/payments", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, total_price, status, customer_info, created_at
      FROM bookings
      ORDER BY id DESC
    `);

    const payments = result.rows.map((p) => ({
      id: p.id,
      invoice: `Invoice #${p.id}`,
      client: p.customer_info?.name || p.customer_info?.email || "Unknown",
      amount: p.total_price ? `$${p.total_price}` : "$0",
      status: p.status === "Confirmed" ? "Paid" : "Not Paid",
      date: p.created_at?.toISOString().split("T")[0]
    }));

    res.json(payments);
  } catch (err) {
    console.error("Payments error:", err);
    res.status(500).json({ error: "Payments error" });
  }
});

// ==================== MESSAGES ====================

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
    console.error("Messages error:", err);
    res.status(500).json({ error: "Messages error" });
  }
});

router.put("/messages/:id/reply", async (req, res) => {
  try {
    const { reply } = req.body;
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE messages
      SET reply = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [reply, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Reply error:", err);
    res.status(500).json({ error: "Reply error" });
  }
  // ==================== HOTEL RESERVATIONS ====================

  router.get("/hotels/reservations", async (req, res) => {
    try {
      const result = await pool.query(`
      SELECT id, status, selected_hotel, customer_info, total_price, created_at
      FROM bookings
      WHERE booking_type = 'hotel'
      ORDER BY created_at DESC
    `);

      const hotelReservations = result.rows.map((b) => ({
        id: b.id,
        hotelName:
          b.selected_hotel?.name ||
          b.selected_hotel?.hotelName ||
          "Unknown hotel",
        city:
          b.selected_hotel?.city ||
          b.selected_hotel?.destination ||
          "N/A",
        client:
          b.customer_info?.name ||
          b.customer_info?.firstName ||
          b.customer_info?.email ||
          "Unknown",
        email: b.customer_info?.email || "",
        phone: b.customer_info?.phone || "",
        amount: b.total_price || 0,
        status: b.status || "Pending",
        date: b.created_at?.toISOString().split("T")[0],
        type: "hotel",
      }));

      res.json(hotelReservations);
    } catch (err) {
      console.error("Hotel reservations admin error:", err);
      res.status(500).json({ error: err.message });
    }
  });
});

module.exports = router;