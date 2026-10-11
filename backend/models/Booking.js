const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property"
    },
    propertyTitle: {
      type: String,
      default: ""
    },
    propertyImage: {
      type: String,
      default: ""
    },
    propertyLocation: {
      type: String,
      default: ""
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userName: {
      type: String,
      default: ""
    },
    userEmail: {
      type: String,
      default: ""
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0]
    },
    type: {
      type: String,
      default: "Visit"
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "pending", "confirmed", "cancelled"],
      default: "Pending"
    },
    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
