const authMiddleware = require("./authMiddleware");

/* ================= ADMIN MIDDLEWARE ================= */
const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied. Admin only.",
      });
    }

    next();
  });
};

module.exports = adminMiddleware;
