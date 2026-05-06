// All 12 destinations
const destinations = {
  "sharm el sheikh": {
    id: "sharm",
    name: "Sharm El Sheikh",
    description: "World-class diving, crystal clear waters, and luxury resorts",
    region: "Sinai",
    image: "/images/sharm.jpeg",
    hotels: [
      {
        id: "amarina_sun",
        name: "Amarina Sun Rise Aqua Park",
        category: "4-Star Aqua Park",
        priceRanges: { single: { min: 4700, max: 8500 }, double: { min: 5850, max: 8500 }, triple: { min: 8500, max: 11600 } },
        childPolicy: "Children FREE up to 12 years",
        features: ["Aqua Park", "Family-friendly"]
      },
      {
        id: "barcelo_tiran",
        name: "Barcelo Tiran Resort",
        category: "5-Star Beachfront",
        priceRanges: { single: { min: 5950, max: 6850 }, double: { min: 6950, max: 8000 }, triple: { min: 9750, max: 11300 } },
        childPolicy: "Children 6-12: 50% discount",
        features: ["Naama Bay location", "Couples & Divers"]
      }
    ],
    activities: [
      { id: "diving", name: "Diving at Ras Mohammed", price: 450, perPerson: true },
      { id: "quad_biking", name: "Quad Biking Desert Safari", price: 650, perPerson: true }
    ]
  },
  "hurghada": {
    id: "hurghada",
    name: "Hurghada",
    description: "Vibrant coastal city with amazing water sports",
    region: "Red Sea",
    image: "/images/hurghada.jpg",
    hotels: [
      {
        id: "mirage_bay",
        name: "Mirage Bay Aqua Park",
        category: "4-Star Family Resort",
        priceRanges: { single: { min: 3550, max: 3550 }, double: { min: 4550, max: 4550 }, triple: { min: 6850, max: 6850 } },
        childPolicy: "Children 0-12 years FREE",
        features: ["Budget families", "Aqua park fun"]
      }
    ],
    activities: [
      { id: "giftun_island", name: "Giftun Island Boat Trip", price: 450, perPerson: true }
    ]
  },
  "dahab": {
    id: "dahab",
    name: "Dahab",
    description: "Bohemian paradise with world-class diving",
    region: "Sinai",
    image: "/images/dahab.jpg",
    hotels: [
      {
        id: "green_valley",
        name: "Green Valley Resort",
        category: "Budget",
        priceRanges: { single: { min: 800, max: 1200 }, double: { min: 950, max: 1450 }, triple: { min: 1350, max: 2150 } },
        childPolicy: "First child FREE up to 11.99 years",
        features: ["Budget-friendly", "Basic comfort"]
      }
    ],
    activities: [
      { id: "blue_hole", name: "Blue Hole Diving", price: 250, perPerson: true }
    ]
  },
  "luxor": {
    id: "luxor",
    name: "Luxor",
    description: "Ancient Thebes - world's greatest open-air museum",
    region: "Upper Egypt",
    image: "/images/luxor.jpg",
    hotels: [
      {
        id: "winter_palace",
        name: "Winter Palace Luxor",
        category: "5-Star Historic Luxury",
        priceRanges: { single: { min: 5000, max: 10000 }, double: { min: 7000, max: 14000 }, triple: { min: 10000, max: 20000 } },
        childPolicy: "Contact hotel for child rates",
        features: ["Historic", "Luxury", "Nile views"]
      }
    ],
    activities: [
      { id: "valley_kings", name: "Valley of the Kings Tour", price: 360, perPerson: true }
    ]
  },
  "aswan": {
    id: "aswan",
    name: "Aswan",
    description: "Tranquil Nile city with Nubian culture",
    region: "Upper Egypt",
    image: "/images/aswan.jpg",
    hotels: [
      {
        id: "old_cataract",
        name: "Old Cataract Hotel",
        category: "5-Star Historic Luxury",
        priceRanges: { single: { min: 6000, max: 12000 }, double: { min: 8000, max: 16000 }, triple: { min: 12000, max: 24000 } },
        childPolicy: "Contact hotel",
        features: ["Historic", "Where Agatha Christie stayed"]
      }
    ],
    activities: [
      { id: "abu_simbel", name: "Abu Simbel Day Trip", price: 450, perPerson: true }
    ]
  },
  "cairo": {
    id: "cairo",
    name: "Cairo",
    description: "Egypt's vibrant capital with pyramids and history",
    region: "Cairo",
    image: "/images/cairo.jpg",
    hotels: [
      {
        id: "mena_house",
        name: "Marriott Mena House",
        category: "5-Star Historic",
        priceRanges: { single: { min: 8000, max: 18000 }, double: { min: 8000, max: 18000 }, triple: { min: 12000, max: 25000 } },
        childPolicy: "Contact hotel",
        features: ["Pyramid views", "Historic luxury"]
      }
    ],
    activities: [
      { id: "pyramids_tour", name: "Pyramids & Sphinx Tour", price: 540, perPerson: true }
    ]
  },
  "alexandria": {
    id: "alexandria",
    name: "Alexandria",
    description: "Mediterranean pearl with Greco-Roman history",
    region: "North Coast",
    image: "/images/alexandria.jpg",
    hotels: [
      {
        id: "steigenberger_alex",
        name: "Steigenberger Cecil Hotel",
        category: "4-Star Historic",
        priceRanges: { single: { min: 3000, max: 6000 }, double: { min: 4000, max: 8000 }, triple: { min: 5500, max: 11000 } },
        childPolicy: "Family-friendly",
        features: ["Historic", "Sea views"]
      }
    ],
    activities: [
      { id: "bibliotheca", name: "Bibliotheca Alexandrina", price: 170, perPerson: true }
    ]
  },
  "fayoum": {
    id: "fayoum",
    name: "Fayoum Oasis",
    description: "Natural waterfalls, Magic Lake, and whale fossils",
    region: "Oasis",
    image: "/images/fayoum.jpg",
    hotels: [
      {
        id: "lazib_inn",
        name: "Lazib Inn Eco-lodge",
        category: "Eco-Lodge",
        priceRanges: { single: { min: 2000, max: 3000 }, double: { min: 2800, max: 4000 }, triple: { min: 4000, max: 6000 } },
        childPolicy: "Family-friendly",
        features: ["Eco-lodge", "Organic farm"]
      }
    ],
    activities: [
      { id: "waterfalls", name: "Wadi El-Rayan Waterfalls", price: 100, perPerson: true }
    ]
  },
  "marsa alam": {
    id: "marsa_alam",
    name: "Marsa Alam",
    description: "Hidden paradise with dugongs and dolphins",
    region: "Red Sea",
    image: "/images/marsa-alam.jpg",
    hotels: [],
    activities: []
  },
  "ain sokhna": {
    id: "ain_sokhna",
    name: "Ain Sokhna",
    description: "Weekend getaway near Cairo",
    region: "Red Sea",
    image: "/images/ain-sokhna.jpg",
    hotels: [],
    activities: []
  },
  "siwa": {
    id: "siwa",
    name: "Siwa Oasis",
    description: "Remote desert oasis with ancient culture",
    region: "Western Desert",
    image: "/images/siwa.jpg",
    hotels: [],
    activities: []
  },
  "sahel": {
    id: "sahel",
    name: "Sahel (North Coast)",
    description: "Summer beach destination",
    region: "North Coast",
    image: "/images/sahel.jpg",
    hotels: [],
    activities: []
  }
};

module.exports = destinations;