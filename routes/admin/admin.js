const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");

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

const router = express.Router();

/* ================= ADMIN PROTECTION ================= */
router.use(adminMiddleware);

/* ================= ADMIN MODULES ================= */
router.use(dashboardRoutes);
router.use(packageRoutes);
router.use(reservationRoutes);
router.use(hotelRoutes);
router.use(clientRoutes);
router.use(messageRoutes);
router.use(reviewRoutes);
router.use(subscriberRoutes);
router.use(paymentRoutes);
router.use(settingRoutes);

module.exports = router;
