const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: ""
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    city: {
      type: String,
      trim: true,
      index: true
    },
    state: {
      type: String,
      trim: true,
      default: "Telangana"
    },
    address: {
      type: String,
      trim: true,
      default: ""
    },
    location: {
      type: String,
      trim: true,
      default: ""
    },
    type: {
      type: String,
      trim: true,
      index: true
    },
    price: {
      type: Number,
      default: 0,
      index: true
    },
    rent: {
      type: Number,
      default: 0,
      index: true
    },
    bedrooms: {
      type: Number,
      default: 0
    },
    bathrooms: {
      type: Number,
      default: 0
    },
    images: {
      type: [String],
      default: []
    },
    amenities: {
      type: [String],
      default: ["Parking", "WiFi", "Water Supply", "Power Backup"]
    },
    status: {
      type: String,
      enum: ["available", "Available", "pending", "approved", "rented"],
      default: "Available"
    },
    rating: {
      type: Number,
      default: 4.5
    },
    views: {
      type: Number,
      default: 0
    },
    virtualTour: {
      type: String,
      default: ""
    },
    lat: {
      type: Number,
      default: 17.3850
    },
    lng: {
      type: Number,
      default: 78.4867
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Synchronize price and rent before saving
PropertySchema.pre("save", function (next) {
  if (this.price && !this.rent) {
    this.rent = this.price;
  } else if (this.rent && !this.price) {
    this.price = this.rent;
  }
  if (!this.location && this.city) {
    this.location = this.city;
  }
  next();
});

module.exports = mongoose.model("Property", PropertySchema);
