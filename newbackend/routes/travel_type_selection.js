// backend/routes/travel_type_selection.js
const express = require("express");
const router = express.Router();
const { getTravelTypes, updateTravelType } = require("../controllers/travel_type_selection");
const { verifyToken } = require("../utils/authMiddleware");

// GET available travel types
router.get("/", verifyToken, getTravelTypes);

// PUT update user's selected travel type
router.put("/", verifyToken, updateTravelType);

module.exports = router;
