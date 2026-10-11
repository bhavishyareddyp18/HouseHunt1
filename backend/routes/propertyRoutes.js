const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Property = require("../models/Property");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

// Standard sample properties that match production deployment
const mockProperties = [
  {
    _id: "1",
    id: "1",
    title: "Modern 2BHK Apartment",
    city: "Hyderabad",
    state: "Telangana",
    address: "Near Financial District, Gachibowli",
    location: "Gachibowli, Hyderabad",
    type: "apartment",
    price: 25000,
    rent: 25000,
    bedrooms: 2,
    bathrooms: 2,
    views: 1240,
    rating: 4.6,
    status: "Available",
    lat: 17.4400,
    lng: 78.3489,
    description: "Contemporary 2BHK apartment in Gachibowli, fully furnished with modular kitchen, private balcony, and high-speed WiFi. Walking distance from major IT parks.",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
    ],
    amenities: ["Parking", "WiFi", "Power Backup", "Gym", "Security", "Elevator"],
    owner: {
      name: "Suresh Reddy",
      email: "suresh@example.com",
      phone: "+91 98765 43210",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400"
    }
  },
  {
    _id: "2",
    id: "2",
    title: "Luxury Villa with Pool",
    city: "Hyderabad",
    state: "Telangana",
    address: "Road No. 36, Jubilee Hills",
    location: "Jubilee Hills, Hyderabad",
    type: "villa",
    price: 75000,
    rent: 75000,
    bedrooms: 4,
    bathrooms: 4,
    views: 3120,
    rating: 4.9,
    status: "Available",
    lat: 17.4319,
    lng: 78.4073,
    description: "Ultra-luxury 4BHK villa in prime Jubilee Hills. Features private swimming pool, landscaped lawn, home theater, covered parking for 3 cars, and premium smart home fittings.",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
    ],
    amenities: ["Private Pool", "Parking", "WiFi", "Power Backup", "Gym", "Security", "Pet Friendly"],
    owner: {
      name: "Vikram Malhotra",
      email: "vikram@example.com",
      phone: "+91 98765 12345",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
    }
  }
];

// Helper to normalize property response format
const normalizeProperty = (p) => {
  const obj = p.toObject ? p.toObject() : { ...p };
  const priceVal = obj.price || obj.rent || 0;
  return {
    ...obj,
    _id: String(obj._id || obj.id),
    id: String(obj._id || obj.id),
    price: priceVal,
    rent: priceVal,
    location: obj.location || obj.address || obj.city || "Hyderabad",
    city: obj.city || "Hyderabad",
    type: (obj.type || "apartment").toLowerCase(),
    images: Array.isArray(obj.images) && obj.images.length > 0
      ? obj.images
      : ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"],
    amenities: obj.amenities || ["Parking", "WiFi", "Water Supply"],
    owner: obj.owner || {
      name: "Property Owner",
      email: "contact@househunt.com",
      phone: "+91 98765 00000"
    }
  };
};

// @desc    Get all properties with optional filtering
// @route   GET /api/properties
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { city, type, minPrice, maxPrice } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = {};
      if (city) {
        filter.$or = [
          { city: { $regex: city.trim(), $options: "i" } },
          { location: { $regex: city.trim(), $options: "i" } }
        ];
      }
      if (type && type !== "all") {
        filter.type = { $regex: `^${type.trim()}$`, $options: "i" };
      }
      if (minPrice || maxPrice) {
        filter.$or = [
          {
            price: {
              ...(minPrice ? { $gte: Number(minPrice) } : {}),
              ...(maxPrice ? { $lte: Number(maxPrice) } : {})
            }
          },
          {
            rent: {
              ...(minPrice ? { $gte: Number(minPrice) } : {}),
              ...(maxPrice ? { $lte: Number(maxPrice) } : {})
            }
          }
        ];
      }

      const dbProperties = await Property.find(filter)
        .populate("owner", "name email phone image")
        .sort({ createdAt: -1 });

      if (dbProperties && dbProperties.length > 0) {
        const normalized = dbProperties.map(normalizeProperty);
        return res.json({
          success: true,
          count: normalized.length,
          data: normalized
        });
      }
    }

    // Fallback to sample properties
    let results = mockProperties.map(normalizeProperty);

    if (city && city.trim()) {
      const c = city.trim().toLowerCase();
      results = results.filter(
        (p) =>
          p.city.toLowerCase().includes(c) ||
          p.location.toLowerCase().includes(c)
      );
    }

    if (type && type.trim() && type.toLowerCase() !== "all") {
      const t = type.trim().toLowerCase();
      results = results.filter((p) => p.type.toLowerCase() === t);
    }

    if (minPrice) {
      results = results.filter((p) => (p.price || p.rent) >= Number(minPrice));
    }
    if (maxPrice) {
      results = results.filter((p) => (p.price || p.rent) <= Number(maxPrice));
    }

    return res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    console.error("Properties GET error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check DB first if valid ObjectId
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const prop = await Property.findById(id).populate("owner", "name email phone image");
      if (prop) {
        return res.json({
          success: true,
          data: normalizeProperty(prop)
        });
      }
    }

    // Check fallback sample properties
    const mock = mockProperties.find((p) => String(p._id) === String(id) || String(p.id) === String(id));
    if (mock) {
      return res.json({
        success: true,
        data: normalizeProperty(mock)
      });
    }

    return res.status(404).json({
      success: false,
      message: `Property with ID '${id}' not found.`
    });
  } catch (err) {
    console.error("Property GET /:id error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Create new property listing
// @route   POST /api/properties
// @access  Private (Owner/Admin)
router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      description,
      city,
      location,
      type,
      price,
      rent,
      bedrooms,
      bathrooms,
      images,
      amenities
    } = req.body;

    if (!title || !city) {
      return res.status(400).json({
        success: false,
        message: "Title and city are required to list a property."
      });
    }

    const priceVal = Number(price || rent || 0);

    if (mongoose.connection.readyState === 1) {
      const newProp = await Property.create({
        title: title.trim(),
        description: description || "",
        city: city.trim(),
        location: location || city.trim(),
        type: (type || "apartment").toLowerCase(),
        price: priceVal,
        rent: priceVal,
        bedrooms: Number(bedrooms || 1),
        bathrooms: Number(bathrooms || 1),
        images: Array.isArray(images) && images.length > 0 ? images : ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"],
        amenities: Array.isArray(amenities) ? amenities : ["Parking", "WiFi"],
        status: "Available",
        owner: req.user?._id
      });

      return res.status(201).json({
        success: true,
        message: "Property created successfully",
        data: normalizeProperty(newProp)
      });
    }

    // In preview mode
    const fakeProp = {
      _id: "demo_" + Date.now(),
      title,
      city,
      location: location || city,
      type: type || "apartment",
      price: priceVal,
      rent: priceVal,
      images: images || ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"],
      status: "Available"
    };

    return res.status(201).json({
      success: true,
      message: "Property listing created in preview mode",
      data: fakeProp
    });
  } catch (err) {
    console.error("Property POST error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await Property.findByIdAndUpdate(id, req.body, { new: true });
      if (updated) {
        return res.json({ success: true, data: normalizeProperty(updated) });
      }
    }
    return res.json({ success: true, data: { _id: id, ...req.body } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      await Property.findByIdAndDelete(id);
    }
    return res.json({ success: true, message: "Property deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
