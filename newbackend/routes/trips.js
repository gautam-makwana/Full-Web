const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/authMiddleware");
const tripController = require("../controllers/tripController");

// Create a trip
router.post("/", verifyToken, tripController.createTrip);

// Get summary (for current user)
router.get("/summary", verifyToken, tripController.getTripSummary);

// Update trip
router.put("/:id", verifyToken, tripController.updateTrip);

// Delete trip
router.delete("/:id", verifyToken, tripController.deleteTrip);

module.exports = router;
