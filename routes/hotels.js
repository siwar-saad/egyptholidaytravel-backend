const express = require("express");
const pool = require("../config/database");

const router = express.Router();

/* CREATE HOTEL BOOKING */
router.post("/bookings", async (req, res) => {
    try {
        const {
            hotelName,
            hotelCity,
            mealPlan,
            fullName,
            email,
            phone,
            travelers,
            checkIn,
            checkOut,
            roomType,
            notes,
        } = req.body;

        if (!hotelName || !fullName || !email || !travelers || !checkIn || !checkOut) {
            return res.status(400).json({
                error: "Required fields are missing",
            });
        }

        const result = await pool.query(
            `
      INSERT INTO hotel_bookings
      (
        hotel_name,
        hotel_city,
        meal_plan,
        full_name,
        email,
        phone,
        travelers,
        check_in,
        check_out,
        room_type,
        notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
      `,
            [
                hotelName,
                hotelCity,
                mealPlan,
                fullName,
                email,
                phone,
                travelers,
                checkIn,
                checkOut,
                roomType,
                notes,
            ]
        );

        res.status(201).json({
            message: "Hotel booking request sent successfully",
            booking: result.rows[0],
        });
    } catch (error) {
        console.error("Hotel booking error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

/* GET ALL HOTEL BOOKINGS - ADMIN */
router.get("/bookings", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM hotel_bookings ORDER BY created_at DESC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Get hotel bookings error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

/* UPDATE BOOKING STATUS */
router.put("/bookings/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await pool.query(
            `
      UPDATE hotel_bookings
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Booking not found" });
        }

        res.json({
            message: "Booking status updated",
            booking: result.rows[0],
        });
    } catch (error) {
        console.error("Update hotel booking error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

/* DELETE BOOKING */
router.delete("/bookings/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM hotel_bookings WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Booking not found" });
        }

        res.json({ message: "Booking deleted successfully" });
    } catch (error) {
        console.error("Delete hotel booking error:", error);
        res.status(500).json({ error: "Server error" });
    }
    router.post("/reserve", async (req, res) => {
        try {
            const {
                hotel,
                customerInfo,
                totalPrice,
                userRole
            } = req.body;

            if (userRole === "admin") {
                return res.status(403).json({
                    error: "Admin cannot make hotel reservations",
                });
            }

            if (!hotel || !customerInfo) {
                return res.status(400).json({
                    error: "Hotel and customer info are required",
                });
            }

            const result = await pool.query(
                `
      INSERT INTO bookings
      (
        booking_reference,
        booking_type,
        status,
        selected_hotel,
        total_price,
        customer_info
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
                [
                    `HOTEL-${Date.now()}`,
                    "hotel",
                    "Pending",
                    JSON.stringify(hotel),
                    totalPrice || 0,
                    JSON.stringify(customerInfo),
                ]
            );

            res.status(201).json({
                success: true,
                booking: result.rows[0],
            });
        } catch (err) {
            console.error("Hotel reservation error:", err);
            res.status(500).json({ error: err.message });
        }
    });
});

module.exports = router;