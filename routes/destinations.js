const express = require("express");
const router = express.Router();
const destinations = require("../data/destinations");

// GET all destinations
router.get("/", (req, res) => {
  res.status(200).json({
    count: Object.keys(destinations).length,
    destinations: destinations
  });
});

// GET destination by name
router.get("/:name", (req, res) => {
  const name = req.params.name.toLowerCase();
  const destination = destinations[name];
  
  if (!destination) {
    return res.status(404).json({ error: "Destination not found" });
  }
  
  res.status(200).json(destination);
});

// GET hotels for a destination
router.get("/:name/hotels", (req, res) => {
  const name = req.params.name.toLowerCase();
  const destination = destinations[name];
  
  if (!destination) {
    return res.status(404).json({ error: "Destination not found" });
  }
  
  res.status(200).json({
    destination: destination.name,
    hotels: destination.hotels
  });
});

// GET activities for a destination
router.get("/:name/activities", (req, res) => {
  const name = req.params.name.toLowerCase();
  const destination = destinations[name];
  
  if (!destination) {
    return res.status(404).json({ error: "Destination not found" });
  }
  
  res.status(200).json({
    destination: destination.name,
    activities: destination.activities
  });
});

// Calculate hotel price
router.post("/calculate-hotel", (req, res) => {
  const { hotel, nights, adults, children } = req.body;
  
  if (!hotel || !nights) {
    return res.status(400).json({ error: "Hotel and nights are required" });
  }
  
  // Determine room type based on adults
  let roomType = "double";
  if (adults <= 1) roomType = "single";
  else if (adults >= 3) roomType = "triple";
  
  const priceRange = hotel.priceRanges[roomType];
  const avgPrice = (priceRange.min + priceRange.max) / 2;
  const totalPrice = avgPrice * nights;
  
  res.status(200).json({
    hotelName: hotel.name,
    nights: nights,
    roomType: roomType,
    pricePerNight: avgPrice,
    totalPrice: totalPrice
  });
});

module.exports = router;