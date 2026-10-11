const express = require("express");
const router = express.Router();
const controller = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

// Protected booking endpoints
router.post("/", protect, controller.createBooking);
router.get("/", protect, controller.getMyBookings);
router.get("/my", protect, controller.getMyBookings);
router.get("/owner", protect, controller.getOwnerBookings);
router.put("/:id", protect, controller.updateBookingStatus);
router.patch("/:id/status", protect, controller.updateBookingStatus);
router.delete("/:id", protect, controller.deleteBooking);

module.exports = router;
