const express = require("express");
const cors = require("cors");
require('dotenv').config();

const packageRoutes = require("./routes/packages");
const subscriberRoutes = require("./routes/subscribers");
const bookingRoutes = require("./routes/bookings");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files for images
app.use("/images", express.static("public/images"));

// Routes
app.use("/api", subscriberRoutes);  // For /api/subscribe
app.use("/api/packages", packageRoutes);  // For /api/packages
app.use("/api/bookings", bookingRoutes);  // For /api/bookings
app.use("/api/auth", authRoutes);  // For /api/auth/*

// Search endpoint for Home page
app.get("/api/search", async (req, res) => {
  const { from, to, checkIn, checkOut, adults, children } = req.query;
  
  if (!to) {
    return res.status(400).json({ error: "Destination is required" });
  }
  
  try {
    const pool = require('./config/database');
    const result = await pool.query('SELECT * FROM destinations WHERE name ILIKE $1 OR id = $1', [`%${to}%`]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: "Destination not found. Available: Sharm El Sheikh, Hurghada, Dahab, Marsa Alam, Ain Sokhna, Siwa, Luxor, Aswan, Cairo, Alexandria, Fayoum, Sahel" 
      });
    }
    
    const destination = JSON.parse(result.rows[0].data);
    
    // Calculate nights
    let nights = 1;
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) || 1;
    }
    
    res.json({
      destination: destination,
      searchParams: {
        from: from || "Egypt",
        to: destination.name,
        checkIn: checkIn,
        checkOut: checkOut,
        nights: nights,
        adults: parseInt(adults) || 1,
        children: parseInt(children) || 0
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all destinations list for dropdown
app.get("/api/destinations-list", async (req, res) => {
  try {
    const pool = require('./config/database');
    const result = await pool.query('SELECT id, name, region, image FROM destinations ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Destinations list error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  
  // Initialize database
  try {
    const initializeDatabase = require('./data/initDb');
    await initializeDatabase();
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
  
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   POST http://localhost:${PORT}/api/subscribe`);
  console.log(`   GET  http://localhost:${PORT}/api/packages`);
  console.log(`   GET  http://localhost:${PORT}/api/search?to=sharm`);
  console.log(`   GET  http://localhost:${PORT}/api/bookings`);
  console.log(`   POST http://localhost:${PORT}/api/bookings`);
  console.log(`   POST http://localhost:${PORT}/api/auth/signup`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   POST http://localhost:${PORT}/api/auth/forgot-password`);
  console.log(`   POST http://localhost:${PORT}/api/auth/reset-password`);
  console.log(`\n✨ Ready to accept requests!\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use. Please stop the running process on that port or set PORT to a different free port before restarting.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
