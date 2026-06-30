const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");
const { requireAdminPermission } = require("../../middleware/adminMiddleware");

const dashboardRoutes = require("./dashboard");
const packageRoutes = require("./packages");
const reservationRoutes = require("./reservations");
const hotelRoutes = require("./hotels");
const clientRoutes = require("./clients");
const messageRoutes = require("./messages");
const reviewRoutes = require("./reviews");
const subscriberRoutes = require("./subscribers");
const paymentRoutes = require("./payments");
const settingRoutes = require("./settings");
const destinationRoutes = require("./destinations");

const router = express.Router();

/* ================= ADMIN PROTECTION ================= */
router.use(adminMiddleware);

/* ================= ADMIN MODULES ================= */
router.use(requireAdminPermission("dashboard"), dashboardRoutes);
router.use(requireAdminPermission("packages"), packageRoutes);
router.use(requireAdminPermission("packages"), destinationRoutes);
router.use(reservationRoutes);
router.use(requireAdminPermission("hotels"), hotelRoutes);
router.use(requireAdminPermission("users"), clientRoutes);
router.use(requireAdminPermission("messages"), messageRoutes);
router.use(requireAdminPermission("reviews"), reviewRoutes);
router.use(requireAdminPermission("settings"), subscriberRoutes);
router.use(requireAdminPermission("payments"), paymentRoutes);
router.use(requireAdminPermission("settings"), settingRoutes);

module.exports = router;


