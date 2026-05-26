const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/database");

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

const authMiddleware = async (req, res, next) => {
  try {
    const cookieToken = getCookie(req, "auth_token");

    if (!cookieToken) {
      return res.status(401).json({
        error: "Access denied. No token provided.",
      });
    }

    const token = decodeURIComponent(cookieToken);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      `
      SELECT id, email, first_name, last_name, phone, city, country, role, token_hash, token_expires
      FROM users
      WHERE id = $1
      `,
      [decoded.id]
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
