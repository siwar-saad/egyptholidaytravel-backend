const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { getCookie } = require("../utils/cookies");
const { hashToken } = require("../utils/tokens");

/* ================= AUTH MIDDLEWARE ================= */
const authMiddleware = async (req, res, next) => {
  try {
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
      SELECT id, email, first_name, last_name, phone, city, country, role, admin_type, permissions, token_hash, token_expires
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
