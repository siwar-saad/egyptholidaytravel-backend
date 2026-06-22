const express = require("express");
const pool = require("../../config/database");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

const getPagination = (req) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};

const setPaginationHeaders = (res, total, page, limit) => {
  res.set("X-Total-Count", String(total));
  res.set("X-Page", String(page));
  res.set("X-Limit", String(limit));
};

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

const getPackageServerPrice = async (searchParams = {}) => {
  const packageId = searchParams.packageId || searchParams.package_id || searchParams.id;
  const packageName =
    searchParams.name ||
    searchParams.title ||
    searchParams.backendName ||
    searchParams.backend_name ||
    searchParams.route ||
    "";

  let result;

  if (packageId) {
    result = await pool.query(
      `
      SELECT start_price, price
      FROM packages
      WHERE id = $1
      LIMIT 1
      `,
      [packageId]
    );
  } else if (packageName) {
    result = await pool.query(
      `
      SELECT start_price, price
      FROM packages
      WHERE LOWER(name) = LOWER($1)
         OR LOWER(title) = LOWER($1)
         OR LOWER(backend_name) = LOWER($1)
         OR LOWER(route) = LOWER($1)
      LIMIT 1
      `,
      [packageName]
    );
  }

  const packageData = result?.rows?.[0];
  if (!packageData) return null;

  return extractAmount(packageData.start_price || packageData.price);
};

router.post("/bookings", authMiddleware, async (req, res) => {
  try {
    const {
      booking_reference,
      search_params,
      selected_hotel,
      selected_activities,
      customer_info,
      booking_type,
    } = req.body;

    const normalizedCustomerInfo = buildCustomerInfo(customer_info, req.user);
    const serverTotalPrice =
      (booking_type || "package") === "package"
        ? await getPackageServerPrice(search_params || {})
        : 0;

    if ((booking_type || "package") === "package" && serverTotalPrice === null) {
      return res.status(400).json({
        error: "Selected package was not found",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO bookings
      (
        booking_reference,
        search_params,
        selected_hotel,
        selected_activities,
        total_price,
        customer_info,
        booking_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        booking_reference,
        search_params,
        selected_hotel,
        selected_activities,
        total_price,
        customer_info,
        booking_type,
        status,
        created_at
      `,
      [
        booking_reference || `BOOK-${Date.now()}`,
        search_params || {},
        selected_hotel || null,
        selected_activities || null,
        serverTotalPrice,
        normalizedCustomerInfo,
        booking_type || "package",
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create client booking error:", err);
    res.status(500).json({
      error: "Create client booking error",
    });
  }
});

const mapClientBooking = (booking) => ({
  id: booking.id,
  type: booking.booking_type || "package",
  booking_reference: booking.booking_reference,
  search_params: booking.search_params || {},
  selected_hotel: booking.selected_hotel || {},
  customer_info: booking.customer_info || {},
  title:
    booking.booking_type === "hotel"
      ? booking.selected_hotel?.name || "Hotel"
      : booking.search_params?.name ||
        booking.search_params?.backendName ||
        booking.search_params?.route ||
        "Package",
  packageName:
    booking.search_params?.name ||
    booking.search_params?.backendName ||
    booking.search_params?.route ||
    "",
  client:
    booking.customer_info?.fullName ||
    booking.customer_info?.name ||
    booking.customer_info?.full_name ||
    "",
  email: booking.customer_info?.email || "",
  phone: booking.customer_info?.phone || "",
  country: booking.customer_info?.country || "",
  travelers: booking.customer_info?.travelers || "",
  notes: booking.customer_info?.notes || "",
  travelDate:
    booking.search_params?.travelDate ||
    booking.search_params?.travel_date ||
    "",
  roomType:
    booking.search_params?.roomType ||
    booking.search_params?.room_type ||
    booking.selected_hotel?.roomType ||
    "",
  hotelName: booking.selected_hotel?.name || "",
  checkIn: booking.selected_hotel?.checkIn || "",
  checkOut: booking.selected_hotel?.checkOut || "",
  date: booking.created_at?.toISOString().split("T")[0],
  status: booking.status || "Pending",
  details: booking.booking_reference || "No reference",
  total_price: booking.total_price || 0,
});

/* ================= BOOKINGS ================= */
router.get(["/mybookings"], authMiddleware, async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const email = String(req.user.email || "").trim().toLowerCase();
    const countResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM bookings
      WHERE LOWER(customer_info->>'email') = LOWER($1)
      `,
      [email]
    );

    const result = await pool.query(
      `
      SELECT
        id,
        booking_reference,
        booking_type,
        status,
        search_params,
        selected_hotel,
        customer_info,
        total_price,
        created_at
      FROM bookings
      WHERE LOWER(customer_info->>'email') = LOWER($1)
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
      `,
      [email, limit, offset]
    );

    const bookings = result.rows.map(mapClientBooking);

    setPaginationHeaders(res, Number(countResult.rows[0].total), page, limit);
    res.json(bookings);
  } catch (err) {
    console.error("Bookings error:", err);
    res.status(500).json({
      error: "Bookings error",
    });
  }
});

module.exports = router;
