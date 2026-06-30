const express = require("express");
const pool = require("../../config/database");
const {
  getPagination,
  setPaginationHeaders,
} = require("../../utils/pagination");
const { getCustomerName } = require("../../utils/customer");
const { requireAdminPermission } = require("../../middleware/adminMiddleware");
const { sendEmail } = require("../../services/emailService");

const router = express.Router();

const getAdminName = (req) =>
  `${req.user?.first_name || ""} ${req.user?.last_name || ""}`.trim() ||
  req.user?.email ||
  "Admin";

const allowedBookingStatuses = ["Pending", "Confirmed", "Cancelled"];

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const sendReservationStatusEmail = async (booking) => {
  const customer = booking.customer_info || {};
  const email = String(customer.email || "").trim().toLowerCase();

  if (!email) {
    return { sent: false, reason: "Client email is missing" };
  }

  const clientName =
    customer.fullName || customer.full_name || customer.name || "Client";
  const bookingType = booking.booking_type === "hotel" ? "Hotel" : "Package";
  const reservationName =
    booking.booking_type === "hotel"
      ? booking.selected_hotel?.name || "Hotel reservation"
      : booking.search_params?.name ||
        booking.search_params?.packageName ||
        "Package reservation";
  const status = booking.status || "Pending";
  const statusColor =
    status === "Confirmed"
      ? "#16833a"
      : status === "Cancelled"
      ? "#b42318"
      : "#a86700";

  const info = await sendEmail(
    email,
    `Reservation ${status} - Egypt Holiday Travel`,
    `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#2d1b12">
        <h2>Reservation Status Updated</h2>
        <p>Hello ${escapeHtml(clientName)},</p>
        <p>The status of your reservation has been updated by Egypt Holiday Travel.</p>
        <div style="padding:18px;border:1px solid #ead9ca;border-radius:10px;background:#fffaf5">
          <p><strong>Reference:</strong> ${escapeHtml(booking.booking_reference || booking.id)}</p>
          <p><strong>Type:</strong> ${escapeHtml(bookingType)}</p>
          <p><strong>Reservation:</strong> ${escapeHtml(reservationName)}</p>
          <p><strong>New status:</strong> <span style="color:${statusColor};font-weight:bold">${escapeHtml(status)}</span></p>
        </div>
        <p>If you need more information, please contact our travel team.</p>
        <p>Egypt Holiday Travel</p>
      </div>
    `
  );

  return {
    sent: Array.isArray(info.accepted) && info.accepted.length > 0,
    messageId: info.messageId,
  };
};

/* ================= PACKAGE RESERVATIONS ================= */
router.get("/reservations", requireAdminPermission("reservations"), async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const countResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM bookings
      WHERE booking_type IN ('package', 'destination')
         OR booking_type IS NULL
    `);
    const result = await pool.query(
      `
      SELECT
        id,
        booking_reference,
        booking_type,
        search_params,
        selected_hotel,
        selected_activities,
        total_price,
        customer_info,
        status,
        created_at
      FROM bookings
      WHERE booking_type IN ('package', 'destination')
         OR booking_type IS NULL
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    setPaginationHeaders(res, Number(countResult.rows[0].total), page, limit);
    res.json(result.rows);
  } catch (error) {
    console.error("Reservations error:", error);
    res.status(500).json({ error: "Unable to get reservations" });
  }
});

/* ================= CREATE PACKAGE RESERVATION ================= */
router.post("/reservations", requireAdminPermission("create_reservation"), async (req, res) => {
  try {
    const {
      packageName,
      route,
      duration,
      travelDate,
      roomType,
      fullName,
      email,
      phone,
      travelers,
      notes,
      totalPrice,
    } = req.body;

    if (!packageName || !fullName || !email) {
      return res.status(400).json({
        error: "Package, client name and email are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO bookings
      (
        booking_reference,
        booking_type,
        search_params,
        customer_info,
        total_price,
        status
      )
      VALUES ($1, 'package', $2, $3, $4, 'Pending')
      RETURNING
        id,
        booking_reference,
        booking_type,
        search_params,
        selected_hotel,
        selected_activities,
        total_price,
        customer_info,
        status,
        created_at
      `,
      [
        `PKG-${Date.now()}`,
        {
          name: packageName,
          route: route || "",
          duration: duration || "",
          travelDate: travelDate || "",
          roomType: roomType || "",
        },
        {
          fullName,
          email,
          phone: phone || "",
          travelers: travelers || "",
          notes: notes || "",
          createdBy: "admin",
          adminName: getAdminName(req),
          adminEmail: req.user?.email || "",
        },
        totalPrice || 0,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create package reservation error:", error);
    res.status(500).json({ error: "Unable to create package reservation" });
  }
});

/* ================= UPDATE PACKAGE RESERVATION STATUS ================= */
router.put("/reservations/:id/status", requireAdminPermission("reservations"), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!allowedBookingStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const previousResult = await pool.query(
      "SELECT status FROM bookings WHERE id = $1",
      [id]
    );
    const previousStatus = previousResult.rows[0]?.status;

    const result = await pool.query(
      `
      UPDATE bookings
      SET status = $1
      WHERE id = $2
      RETURNING
        id,
        booking_reference,
        booking_type,
        search_params,
        selected_hotel,
        selected_activities,
        total_price,
        customer_info,
        status,
        created_at
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    const reservation = result.rows[0];
    let emailSent = false;
    let emailWarning = "";

    if (previousStatus !== status) {
      try {
        const delivery = await sendReservationStatusEmail(reservation);
        emailSent = delivery.sent;
        emailWarning = delivery.sent
          ? ""
          : delivery.reason || "Email was not accepted";
      } catch (emailError) {
        emailWarning = emailError.message || "Unable to send status email";
        console.error("Package status email error:", emailError.message);
      }
    }

    res.json({
      ...reservation,
      emailSent,
      emailWarning,
    });
  } catch (error) {
    console.error("Update reservation error:", error);
    res.status(500).json({ error: "Unable to update reservation" });
  }
});

/* ================= DESTINATION RESERVATIONS ================= */
router.get(
  "/destinations/reservations",
  requireAdminPermission("reservations"),
  async (req, res) => {
    try {
      const { page, limit, offset } = getPagination(req);
      const countResult = await pool.query(`
        SELECT COUNT(*) AS total
        FROM bookings
        WHERE booking_type = 'destination'
      `);
      const result = await pool.query(
        `
        SELECT
          id, booking_reference, booking_type, search_params,
          selected_hotel, selected_activities, total_price,
          customer_info, status, created_at
        FROM bookings
        WHERE booking_type = 'destination'
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
        `,
        [limit, offset]
      );

      setPaginationHeaders(res, Number(countResult.rows[0].total), page, limit);
      res.json(result.rows);
    } catch (error) {
      console.error("Destination reservations error:", error);
      res.status(500).json({ error: "Unable to get destination reservations" });
    }
  }
);

router.post(
  "/destinations/reservations",
  requireAdminPermission("create_reservation"),
  async (req, res) => {
    try {
      const {
        destinationName, destinationCountry, destinationLocation,
        destinationId, duration, travelDate, roomType, fullName,
        email, phone, travelers, notes, totalPrice,
      } = req.body;

      if (!destinationName || !fullName || !email) {
        return res.status(400).json({
          error: "Destination, client name and email are required",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO bookings
        (booking_reference, booking_type, search_params, customer_info,
         total_price, status)
        VALUES ($1, 'destination', $2, $3, $4, 'Pending')
        RETURNING
          id, booking_reference, booking_type, search_params,
          selected_hotel, selected_activities, total_price,
          customer_info, status, created_at
        `,
        [
          `DST-${Date.now()}`,
          {
            destinationId: destinationId || "",
            name: destinationName,
            country: destinationCountry || "Egypt",
            location: destinationLocation || "",
            route: destinationLocation || "",
            duration: duration || "",
            travelDate: travelDate || "",
            roomType: roomType || "",
          },
          {
            fullName,
            email,
            phone: phone || "",
            travelers: travelers || "",
            notes: notes || "",
            createdBy: "admin",
            reservationKind: "destination",
            adminName: getAdminName(req),
            adminEmail: req.user?.email || "",
          },
          totalPrice || 0,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Create destination reservation error:", error);
      res.status(500).json({ error: "Unable to create destination reservation" });
    }
  }
);

router.put(
  "/destinations/reservations/:id",
  requireAdminPermission("reservations"),
  async (req, res) => {
    try {
      const {
        destinationName, destinationCountry, destinationLocation,
        destinationId, duration, travelDate, roomType, fullName,
        email, phone, travelers, notes, totalPrice,
      } = req.body;

      if (!destinationName || !fullName || !email) {
        return res.status(400).json({
          error: "Destination, client name and email are required",
        });
      }

      const result = await pool.query(
        `
        UPDATE bookings
        SET search_params = $1,
            customer_info = COALESCE(customer_info, '{}'::jsonb) || $2::jsonb,
            total_price = $3
        WHERE id = $4 AND booking_type = 'destination'
        RETURNING
          id, booking_reference, booking_type, search_params,
          selected_hotel, selected_activities, total_price,
          customer_info, status, created_at
        `,
        [
          {
            destinationId: destinationId || "",
            name: destinationName,
            country: destinationCountry || "Egypt",
            location: destinationLocation || "",
            route: destinationLocation || "",
            duration: duration || "",
            travelDate: travelDate || "",
            roomType: roomType || "",
          },
          JSON.stringify({
            fullName,
            email,
            phone: phone || "",
            travelers: travelers || "",
            notes: notes || "",
            reservationKind: "destination",
          }),
          totalPrice || 0,
          req.params.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Destination reservation not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Update destination reservation error:", error);
      res.status(500).json({ error: "Unable to update destination reservation" });
    }
  }
);

/* ================= HOTEL RESERVATIONS ================= */
router.get("/hotels/reservations", requireAdminPermission("reservations"), async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req);
    const countResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM bookings
      WHERE booking_type = 'hotel'
    `);
    const result = await pool.query(
      `
      SELECT
        id,
        booking_reference,
        booking_type,
        selected_hotel,
        customer_info,
        total_price,
        status,
        created_at
      FROM bookings
      WHERE booking_type = 'hotel'
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    const reservations = result.rows.map((booking) => ({
      id: booking.id,
      type: "hotel",
      client: getCustomerName(booking.customer_info),
      email: booking.customer_info?.email || "",
      phone: booking.customer_info?.phone || "",
      travelers: booking.customer_info?.travelers || "",
      hotelName: booking.selected_hotel?.name || "Hotel",
      city: booking.selected_hotel?.city || "",
      mealPlan:
        booking.selected_hotel?.mealPlan ||
        booking.selected_hotel?.meal ||
        "",
      checkIn: booking.selected_hotel?.checkIn || "",
      checkOut: booking.selected_hotel?.checkOut || "",
      roomType: booking.selected_hotel?.roomType || "",
      status: booking.status || "Pending",
      created_at: booking.created_at,
      date: booking.created_at?.toISOString().split("T")[0],
      totalPrice: booking.total_price || 0,
      reference: booking.booking_reference,
      notes: booking.customer_info?.notes || "",
      createdBy: booking.customer_info?.createdBy || "client",
      adminName: booking.customer_info?.adminName || "",
      adminEmail: booking.customer_info?.adminEmail || "",
    }));

    setPaginationHeaders(res, Number(countResult.rows[0].total), page, limit);
    res.json(reservations);
  } catch (error) {
    console.error("Hotel reservations error:", error);
    res.status(500).json({ error: "Unable to get hotel reservations" });
  }
});

/* ================= CREATE HOTEL RESERVATION ================= */
router.post("/hotels/reservations", requireAdminPermission("create_reservation"), async (req, res) => {
  try {
    const {
      hotelName,
      city,
      mealPlan,
      checkIn,
      checkOut,
      roomType,
      fullName,
      email,
      phone,
      travelers,
      notes,
      totalPrice,
    } = req.body;

    if (!hotelName || !fullName || !email) {
      return res.status(400).json({
        error: "Hotel, client name and email are required",
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
        status
      )
      VALUES ($1, 'hotel', $2, $3, $4, 'Pending')
      RETURNING
        id,
        booking_reference,
        booking_type,
        selected_hotel,
        customer_info,
        total_price,
        status,
        created_at
      `,
      [
        `HOTEL-${Date.now()}`,
        {
          name: hotelName,
          city: city || "",
          mealPlan: mealPlan || "",
          checkIn: checkIn || "",
          checkOut: checkOut || "",
          roomType: roomType || "",
        },
        {
          fullName,
          email,
          phone: phone || "",
          travelers: travelers || "",
          notes: notes || "",
          createdBy: "admin",
          adminName: getAdminName(req),
          adminEmail: req.user?.email || "",
        },
        totalPrice || 0,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create hotel reservation error:", error);
    res.status(500).json({ error: "Unable to create hotel reservation" });
  }
});

/* ================= UPDATE HOTEL RESERVATION STATUS ================= */
router.put("/hotels/reservations/:id/status", requireAdminPermission("reservations"), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!allowedBookingStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const previousResult = await pool.query(
      "SELECT status FROM bookings WHERE id = $1 AND booking_type = 'hotel'",
      [id]
    );
    const previousStatus = previousResult.rows[0]?.status;

    const result = await pool.query(
      `
      UPDATE bookings
      SET status = $1
      WHERE id = $2
      AND booking_type = 'hotel'
      RETURNING
        id,
        booking_reference,
        booking_type,
        selected_hotel,
        customer_info,
        total_price,
        status,
        created_at
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hotel reservation not found" });
    }

    const reservation = result.rows[0];
    let emailSent = false;
    let emailWarning = "";

    if (previousStatus !== status) {
      try {
        const delivery = await sendReservationStatusEmail(reservation);
        emailSent = delivery.sent;
        emailWarning = delivery.sent
          ? ""
          : delivery.reason || "Email was not accepted";
      } catch (emailError) {
        emailWarning = emailError.message || "Unable to send status email";
        console.error("Hotel status email error:", emailError.message);
      }
    }

    res.json({
      success: true,
      reservation,
      emailSent,
      emailWarning,
    });
  } catch (error) {
    console.error("Update hotel reservation error:", error);
    res.status(500).json({ error: "Unable to update hotel reservation" });
  }
});
module.exports = router;






