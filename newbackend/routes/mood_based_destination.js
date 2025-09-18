const express = require("express");
const router = express.Router();
const moodController = require("../controllers/mood_based_destination");

// POST mood → destinations
router.post("/", moodController.getDestinationsByMood);

module.exports = router;
