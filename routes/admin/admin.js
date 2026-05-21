const express = require("express");
const adminMiddleware = require("../../middleware/adminMiddleware");

const dashboardRoutes = require("./dashboard");
const packageRoutes = require("./packages");
const reservationRoutes = require("./reservations");
const hotelRoutes = require("./hotels");
const clientRoutes = require("./clients");
const messageRoutes = require("./messages");
const subscriberRoutes = require("./subscribers");
const settingRoutes = require("./settings");

const router = express.Router();

router.use(adminMiddleware);

router.use(dashboardRoutes);
router.use(packageRoutes);
router.use(reservationRoutes);
router.use(hotelRoutes);
router.use(clientRoutes);
router.use(messageRoutes);
router.use(subscriberRoutes);
router.use(settingRoutes);

module.exports = router;
