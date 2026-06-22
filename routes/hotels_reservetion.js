const express = require("express");
const router = express.Router();
const pool = require("../config/database");

const adminMiddleware = require("../middleware/adminMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const buildCustomerInfo = (customerInfo = {}, user = {}) => ({
  ...customerInfo,
  name:
    customerInfo.name ||
    customerInfo.fullName ||
    customerInfo.full_name ||
    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    "",
  email: String(user.email || "").trim().toLowerCase(),
});

const extractAmount = (value) => {
  if (value === null || value === undefined) return 0;

  const match = String(value).replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const getPeriodPrice = (periods, roomType) => {
  const period = Array.isArray(periods) ? periods[0] : null;
  if (!period) return 0;

  const normalizedRoom = String(roomType || "").toLowerCase();

  if (normalizedRoom.includes("double")) return extractAmount(period.double);
  if (normalizedRoom.includes("triple")) return extractAmount(period.triple);

  return extractAmount(period.single);
};

const getHotelServerPrice = async (hotelData = {}) => {
  const hotelId = hotelData.id || hotelData.hotelId || hotelData.hotel_id;
  const hotelName = hotelData.name || hotelData.hotelName || "";
  const hotelCity = hotelData.city || "";

  let result;

  if (hotelId) {
    result = await pool.query(
      `
      SELECT single_room, double_room, price, periods
      FROM hotels
      WHERE id = $1
      LIMIT 1
      `,
      [hotelId]
    );
  } else if (hotelName) {
    result = await pool.query(
      `
      SELECT single_room, double_room, price, periods
      FROM hotels
      WHERE LOWER(name) = LOWER($1)
        AND ($2 = '' OR LOWER(city) = LOWER($2))
      LIMIT 1
      `,
      [hotelName, hotelCity]
    );
  }

  const hotel = result?.rows?.[0];
  if (!hotel) return null;

  const roomType = hotelData.roomType || hotelData.room_type || "";
  const normalizedRoom = String(roomType).toLowerCase();

  if (normalizedRoom.includes("double")) {
    return (
      extractAmount(hotel?.double_room) ||
      getPeriodPrice(hotel?.periods, roomType) ||
      extractAmount(hotel?.price)
    );
  }

  return (
    extractAmount(hotel?.single_room) ||
    getPeriodPrice(hotel?.periods, roomType) ||
    extractAmount(hotel?.price)
  );
};

/* ================= HOTEL BOOKING HELPERS ================= */
const allowedBookingStatuses = ["Pending", "Confirmed", "Cancelled"];

/* ================= CREATE HOTEL BOOKING ================= */
router.post("/reserve", authMiddleware, async (req, res) => {
  try {
    const {
      selected_hotel,
      hotel,
      customer_info,
      customerInfo,
      search_params,
    } = req.body;
    const hotelData = selected_hotel || hotel || {};
    const customerData = customer_info || customerInfo || {};

    const bookingReference = `HOTEL-${Date.now()}`;
    const normalizedCustomerInfo = buildCustomerInfo(customerData, req.user);
    const serverTotalPrice = await getHotelServerPrice(hotelData);

    if (serverTotalPrice === null) {
      return res.status(400).json({
        error: "Selected hotel was not found",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO bookings
      (
        booking_reference,
        booking_type,
        selected_hotel,
        customer_info,
        total_price,
        search_params,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        booking_reference,
        booking_type,
        selected_hotel,
        customer_info,
        total_price,
        search_params,
        status,
        created_at
      `,
      [
        bookingReference,
        "hotel",
        hotelData,
        normalizedCustomerInfo,
        serverTotalPrice,
        search_params || {},
        "Pending",
      ]
    );

    res.status(201).json({
      success: true,
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Create hotel booking error:", error);

    res.status(500).json({
      error: "Unable to create hotel booking",
    });
  }
});

module.exports = router;
