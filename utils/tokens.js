const crypto = require("crypto");

/* ================= TOKEN HELPERS ================= */
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

module.exports = {
  hashToken,
};
