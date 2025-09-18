const express = require("express");
const router = express.Router();
const liveController = require("../controllers/live_tracking");

// Save/update live location
router.post("/", liveController.updateLocation);

// Get group locations
router.get("/:roomId", liveController.getGroupLocations);

module.exports = router;
