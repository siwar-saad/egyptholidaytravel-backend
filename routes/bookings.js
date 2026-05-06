const express = require("express");
const router = express.Router();
const pool = require('../config/database');
const { sendBookingConfirmation } = require('../config/email');

// GET all bookings
router.get("/", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
    res.status(200).json({
      count: result.rows.length,
      bookings: result.rows
    });
  } catch (error) {
    console.error('Bookings query error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET single booking by ID
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Booking query error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST create new booking
router.post("/", async (req, res) => {
  const {
    searchParams,
    selectedHotel,
    selectedActivities,
    totalPrice,
    customerInfo
  } = req.body;
  
  // Validate required fields
  if (!searchParams || !selectedHotel || !totalPrice) {
    return res.status(400).json({ 
      error: "Missing required booking information" 
    });
  }
  
  try {
    const bookingReference = `EHT${Date.now()}`;
    
    const result = await pool.query(`
      INSERT INTO bookings (booking_reference, search_params, selected_hotel, selected_activities, total_price, customer_info)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      bookingReference,
      JSON.stringify(searchParams),
      JSON.stringify(selectedHotel),
      JSON.stringify(selectedActivities || []),
      totalPrice,
      JSON.stringify(customerInfo || {})
    ]);
    
    // Send booking confirmation email
    const bookingData = {
      customerInfo,
      bookingReference,
      totalPrice,
      selectedHotel,
      selectedActivities
    };
    
    const emailResult = await sendBookingConfirmation(bookingData);
    if (!emailResult.success) {
      console.error('Failed to send booking confirmation email:', emailResult.error);
      // Note: We don't fail the booking if email fails, but we log it
    }
    
    res.status(201).json({
      success: true,
      booking: result.rows[0],
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;