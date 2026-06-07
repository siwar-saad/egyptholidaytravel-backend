const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/database");

/* ================= TOKEN HELPERS ================= */
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const getCookie = (req, name) => {
  const cookies = req.headers.cookie || "";

  return cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
};

const ensureUserAuthColumns = async () => {
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS token_hash TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS token_expires TIMESTAMP WITH TIME ZONE;
  `);
};

/* ================= AUTH MIDDLEWARE ================= */
const authMiddleware = async (req, res, next) => {
  try {
    await ensureUserAuthColumns();

    const cookieToken = getCookie(req, "auth_token");

    // 2. Fall back to Authorization: Bearer <token> header (mobile)
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];
    const headerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    const rawToken = cookieToken || headerToken;

    if (!rawToken) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    const token = decodeURIComponent(rawToken);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      `
      SELECT id, email, first_name, last_name, phone, city, country, role, token_hash, token_expires
      FROM users
      WHERE id = $1
      `,
      [decoded.id],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid token user.",
      });
    }

    const user = result.rows[0];

    if (
      !user.token_hash ||
      user.token_hash !== hashToken(token) ||
      !user.token_expires ||
      new Date(user.token_expires) <= new Date()
    ) {
      return res.status(401).json({
        error: "Invalid or expired token.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token.",
    });
  }
};
module.exports = authMiddleware;
