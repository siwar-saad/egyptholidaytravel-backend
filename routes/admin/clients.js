const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../../config/database");
const { sendEmail } = require("../../services/emailService");
const {
  getPagination,
  setPaginationHeaders,
} = require("../../utils/pagination");
const {
  DEFAULT_ADMIN_PERMISSIONS,
  normalizePermissions,
  isGeneralAdmin,
} = require("../../middleware/adminMiddleware");

const router = express.Router();

const generatePassword = () => {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

  return Array.from(crypto.randomBytes(12), (byte) => {
    return alphabet[byte % alphabet.length];
  }).join("");
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const normalizeAdminType = (role, value) => {
  if (role !== "admin") return null;
  return value === "sub_admin" ? "sub_admin" : "general_admin";
};

const buildAdminFields = ({ role, adminType, permissions }) => {
  const nextRole = role === "admin" ? "admin" : "user";
  const nextAdminType = normalizeAdminType(nextRole, adminType);
  const nextPermissions =
    nextRole !== "admin"
      ? []
      : nextAdminType === "general_admin"
      ? DEFAULT_ADMIN_PERMISSIONS
      : normalizePermissions(permissions);

  return {
    role: nextRole,
    adminType: nextAdminType,
    permissions: nextPermissions,
  };
};

const assertCanSaveAdmin = (req, adminFields) => {
  if (adminFields.role === "admin" && !isGeneralAdmin(req.user)) {
    return "Only a general admin can create or edit admin accounts.";
  }

  if (
    adminFields.role === "admin" &&
    adminFields.adminType === "sub_admin" &&
    adminFields.permissions.length === 0
  ) {
    return "Please select at least one permission for this sub admin.";
  }

  return "";
};

const sendAccountPasswordEmail = async ({
  email,
  firstName,
  role,
  adminType,
  generatedPassword,
}) => {
  const isAdmin = role === "admin";
  const accountType = isAdmin
    ? adminType === "sub_admin"
      ? "sub admin"
      : "general admin"
    : "client";

  const info = await sendEmail(
    email,
    `Egypt Holiday Travel - ${isAdmin ? "Admin" : "Client"} Account`,
    `
    <div style="font-family: Arial; padding:20px;">
      <h2>Welcome ${firstName || (isAdmin ? "Admin" : "Client")}</h2>
      <p>Your ${accountType} account has been created successfully.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${generatedPassword}</p>
      <p>Please login and change your password after first login.</p>
      <br/>
      <p>Egypt Holiday Travel</p>
    </div>
    `
  );

  if (info.rejected?.length > 0 || info.accepted?.length === 0) {
    throw new Error(
      `SMTP did not accept the recipient. Accepted: ${
        info.accepted?.join(", ") || "none"
      }. Rejected: ${info.rejected?.join(", ") || "none"}`
    );
  }

  return info;
};

/* ================= ADMIN CLIENTS ================= */
router.get("/clients", async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const countResult = await pool.query("SELECT COUNT(*) AS total FROM users");
    const result = await pool.query(
      `
      SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        city,
        country,
        role,
        admin_type,
        permissions,
        email_verified,
        created_at
      FROM users
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    setPaginationHeaders(res, Number(countResult.rows[0].total), page, limit);
    res.json(result.rows);
  } catch (error) {
    console.error("Get clients error:", error);
    res.status(500).json({ error: "Unable to get clients" });
  }
});

/* ================= CREATE CLIENT / ADMIN ================= */
router.post("/clients", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      first_name,
      last_name,
      phone,
      city,
      country,
      role,
      admin_type,
      adminType,
      permissions,
      tasks,
    } = req.body;
    const email = req.body.email?.trim().toLowerCase();
    const nextFirstName = firstName ?? first_name ?? "";
    const nextLastName = lastName ?? last_name ?? "";
    const adminFields = buildAdminFields({
      role,
      adminType: admin_type || adminType,
      permissions: permissions || tasks,
    });

    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const adminError = assertCanSaveAdmin(req, adminFields);
    if (adminError) return res.status(403).json({ error: adminError });

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
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
          admin_type,
          permissions,
          email_verified,
          password
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,true,$10)
        RETURNING
          id,
          first_name,
          last_name,
          email,
          phone,
          city,
          country,
          role,
          admin_type,
          permissions,
          email_verified,
          created_at
        `,
        [
          nextFirstName,
          nextLastName,
          email,
          phone || "",
          city || "",
          country || "",
          adminFields.role,
          adminFields.adminType,
          JSON.stringify(adminFields.permissions),
          hashedPassword,
        ]
      );

      const user = result.rows[0];

      let emailInfo;

      try {
        emailInfo = await sendAccountPasswordEmail({
          email,
          firstName: nextFirstName,
          role: adminFields.role,
          adminType: adminFields.adminType,
          generatedPassword,
        });
      } catch (emailError) {
        const emailErrorMessage =
          emailError?.response || emailError?.message || "Email not sent";
        console.error("Account password email error:", emailErrorMessage);
        const error = new Error(
          `Account was not created because the password email could not be sent. ${emailErrorMessage}`
        );
        error.status = 502;
        throw error;
      }

      await client.query("COMMIT");

      res.status(201).json({
        success: true,
        emailSent: true,
        emailDelivery: {
          messageId: emailInfo?.messageId,
          accepted: emailInfo?.accepted || [],
          rejected: emailInfo?.rejected || [],
          response: emailInfo?.response,
        },
        message:
          adminFields.role === "admin"
            ? "Admin created successfully and password email sent"
            : "Client created successfully and password email sent",
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
    res.status(error.status || 500).json({
      error: error.status === 502 ? error.message : "Unable to create client",
    });
  }
});

/* ================= UPDATE CLIENT / ADMIN ================= */
router.put("/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      first_name,
      last_name,
      phone,
      city,
      country,
      role,
      admin_type,
      adminType,
      permissions,
      tasks,
      password,
    } = req.body;
    const email = req.body.email?.trim().toLowerCase();
    const nextFirstName = firstName ?? first_name ?? "";
    const nextLastName = lastName ?? last_name ?? "";
    const adminFields = buildAdminFields({
      role,
      adminType: admin_type || adminType,
      permissions: permissions || tasks,
    });

    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existing = await pool.query(
      "SELECT id, role FROM users WHERE id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    const targetRole = existing.rows[0].role;
    if ((targetRole === "admin" || adminFields.role === "admin") && !isGeneralAdmin(req.user)) {
      return res.status(403).json({
        error: "Only a general admin can edit admin accounts.",
      });
    }

    const adminError = assertCanSaveAdmin(req, adminFields);
    if (adminError) return res.status(403).json({ error: adminError });

    const baseValues = [
      nextFirstName,
      nextLastName,
      email,
      phone || "",
      city || "",
      country || "",
      adminFields.role,
      adminFields.adminType,
      JSON.stringify(adminFields.permissions),
    ];

    let query;
    let values;

    if (typeof password === "string" && password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);

      query = `
        UPDATE users
        SET first_name = $1,
            last_name = $2,
            email = $3,
            phone = $4,
            city = $5,
            country = $6,
            role = $7,
            admin_type = $8,
            permissions = $9::jsonb,
            password = $10,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING id, first_name, last_name, email, phone, city, country, role, admin_type, permissions, email_verified
      `;

      values = [...baseValues, hashedPassword, id];
    } else {
      query = `
        UPDATE users
        SET first_name = $1,
            last_name = $2,
            email = $3,
            phone = $4,
            city = $5,
            country = $6,
            role = $7,
            admin_type = $8,
            permissions = $9::jsonb,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING id, first_name, last_name, email, phone, city, country, role, admin_type, permissions, email_verified
      `;

      values = [...baseValues, id];
    }

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update client error:", error);
    res.status(500).json({ error: "Unable to update client" });
  }
});

/* ================= DELETE CLIENT / ADMIN ================= */
router.delete("/clients/:id", async (req, res) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const { id } = req.params;

    if (Number(req.user.id) === Number(id)) {
      return res.status(403).json({
        error: "You cannot delete your own admin account",
      });
    }

    await client.query("BEGIN");
    transactionStarted = true;

    const tableExists = async (tableName) => {
      const result = await client.query("SELECT to_regclass($1) AS table_name", [
        `public.${tableName}`,
      ]);
      return Boolean(result.rows[0].table_name);
    };

    const columnExists = async (tableName, columnName) => {
      const result = await client.query(
        `
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = $1
          AND column_name = $2
        ) AS exists
        `,
        [tableName, columnName]
      );
      return Boolean(result.rows[0].exists);
    };

    const userResult = await client.query(
      `
      SELECT id, email, role
      FROM users
      WHERE id = $1
      `,
      [id]
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Client not found" });
    }

    const userEmail = userResult.rows[0].email;
    const targetRole = userResult.rows[0].role;

    if (targetRole === "admin" && !isGeneralAdmin(req.user)) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        error: "Only a general admin can delete admin accounts.",
      });
    }

    if (await tableExists("messages") && await columnExists("messages", "email")) {
      await client.query("DELETE FROM messages WHERE LOWER(email) = LOWER($1)", [
        userEmail,
      ]);
    }

    if (await tableExists("bookings") && await columnExists("bookings", "customer_info")) {
      await client.query(
        "DELETE FROM bookings WHERE LOWER(customer_info->>'email') = LOWER($1)",
        [userEmail]
      );
    }

    if (await tableExists("payments") && await columnExists("payments", "client")) {
      await client.query("DELETE FROM payments WHERE LOWER(client) = LOWER($1)", [
        userEmail,
      ]);
    }

    if (await tableExists("subscribers") && await columnExists("subscribers", "email")) {
      await client.query(
        "DELETE FROM subscribers WHERE LOWER(email) = LOWER($1)",
        [userEmail]
      );
    }

    await client.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Client and related data deleted successfully",
    });
  } catch (error) {
    if (transactionStarted) await client.query("ROLLBACK");
    console.error("Delete client error:", error);
    res.status(500).json({ error: "Unable to delete client" });
  } finally {
    client.release();
  }
});

module.exports = router;


