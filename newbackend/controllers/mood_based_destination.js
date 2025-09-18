// backend/controllers/mood_based_destination.js
const moodService = require("../services/mood_service");

/**
 * Controller: Recommend destinations based on mood
 */
exports.getDestinationsByMood = async (req, res) => {
  try {
    const { mood, travelType } = req.body;
    if (!mood) {
      return res.status(400).json({ success: false, error: "Mood is required" });
    }

    const destinations = await moodService.recommendDestinations(mood, travelType);
    res.json({ success: true, data: destinations });
  } catch (err) {
    console.error("❌ Mood destination error:", err);
    res.status(500).json({ success: false, error: "Failed to get destinations" });
  }
};
