// backend/routes/nearby_recommendations.js
const express = require("express");
const router = express.Router();
const nearbyController = require("../controllers/nearbyRecommendationsController");

// GET /api/nearby?lat=...&lon=...&type=...
router.get("/", nearbyController.getNearbyRecommendations);

module.exports = router;
