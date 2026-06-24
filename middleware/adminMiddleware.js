const authMiddleware = require("./authMiddleware");

const DEFAULT_ADMIN_PERMISSIONS = [
  "dashboard",
  "packages",
  "hotels",
  "reservations",
  "create_reservation",
  "users",
  "payments",
  "messages",
  "reviews",
  "settings",
];

const normalizePermissions = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const isGeneralAdmin = (user = {}) => {
  if (user.role !== "admin") return false;

  const adminType = String(user.admin_type || user.adminType || "").toLowerCase();
  const permissions = normalizePermissions(user.permissions);

  return (
    adminType === "general_admin" ||
    user.email === "admin@gmail.com" ||
    (!adminType && permissions.length === 0) ||
    DEFAULT_ADMIN_PERMISSIONS.every((permission) => permissions.includes(permission))
  );
};

const hasAdminPermission = (user = {}, permission) => {
  if (user.role !== "admin") return false;
  if (!permission || isGeneralAdmin(user)) return true;

  return normalizePermissions(user.permissions).includes(permission);
};

/* ================= ADMIN MIDDLEWARE ================= */
const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied. Admin only.",
      });
    }

    req.user.permissions = normalizePermissions(req.user.permissions);
    req.user.isGeneralAdmin = isGeneralAdmin(req.user);

    next();
  });
};

const requireAdminPermission = (permission) => (req, res, next) => {
  if (!hasAdminPermission(req.user, permission)) {
    return res.status(403).json({
      error: "Access denied. Missing admin permission.",
      permission,
    });
  }

  next();
};

module.exports = adminMiddleware;
module.exports.DEFAULT_ADMIN_PERMISSIONS = DEFAULT_ADMIN_PERMISSIONS;
module.exports.normalizePermissions = normalizePermissions;
module.exports.isGeneralAdmin = isGeneralAdmin;
module.exports.hasAdminPermission = hasAdminPermission;
module.exports.requireAdminPermission = requireAdminPermission;