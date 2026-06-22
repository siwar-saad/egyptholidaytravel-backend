const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../../config/database");
const { validatePasswordStrength } = require("../../utils/passwordPolicy");

const router = express.Router();

/* ================= ADMIN SETTINGS ================= */
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

/* ================= UPDATE AGENCY SETTINGS ================= */
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

/* ================= UPDATE CONTACT SETTINGS ================= */
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

/* ================= UPDATE ADMIN PASSWORD ================= */
router.put("/settings/password", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    const passwordStrength = validatePasswordStrength(newPassword);

    if (!passwordStrength.valid) {
      return res.status(400).json({
        error: passwordStrength.error,
      });
    }

    const userResult = await pool.query(
      "SELECT id, password FROM users WHERE id = $1",
      [req.user.id]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ error: "Admin account not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      req.user.id,
    ]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Unable to update password" });
  }
});

module.exports = router;
