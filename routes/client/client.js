const express = require("express");
const profileRoutes = require("./profile");
const bookingRoutes = require("./bookings");
const paymentsRoutes = require("./payments");
const messageRoutes = require("./messages");

const router = express.Router();

router.use(profileRoutes);
router.use(bookingRoutes);
router.use(paymentsRoutes);
router.use(messageRoutes);

module.exports = router;
