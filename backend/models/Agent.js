const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      default: ""
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400"
    },
    bio: {
      type: String,
      default: "Experienced real estate agent specializing in residential rentals and property management."
    },
    location: {
      type: String,
      default: "Hyderabad"
    },
    experience: {
      type: Number,
      default: 5
    },
    rating: {
      type: Number,
      default: 4.8
    },
    totalListings: {
      type: Number,
      default: 12
    },
    activeLeads: {
      type: Number,
      default: 8
    },
    closedDeals: {
      type: Number,
      default: 24
    },
    commission: {
      type: Number,
      default: 150000
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agent", agentSchema);
