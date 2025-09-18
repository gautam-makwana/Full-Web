const express = require("express");
const router = express.Router();
const travelMediumController = require("../controllers/travel_medium_suggestions");

// GET transport suggestions for destination
router.get("/:destination", travelMediumController.getTransportOptions);

module.exports = router;
