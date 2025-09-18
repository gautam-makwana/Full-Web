// backend/controllers/travel_type_selection.js
const Trip = require("../models/Trip");

/**
 * GET /api/travel-type
 * Returns static list of available travel categories
 */
exports.getTravelTypes = async (req, res) => {
  try {
    const travelTypes = [
      { id: 1, name: "Solo", desc: "Plan your solo adventure with smart recommendations." },
      { id: 2, name: "Group", desc: "Plan and coordinate with your friends in real time." },
      { id: 3, name: "Couple", desc: "Romantic getaways, honeymoons, private trips." },
      { id: 4, name: "Family", desc: "Safe and fun experiences for families with kids." },
    ];
    res.json({ success: true, data: travelTypes });
  } catch (err) {
    console.error("❌ Error fetching travel types:", err);
    res.status(500).json({ success: false, error: "Failed to fetch travel types" });
  }
};

/**
 * PUT /api/travel-type
 * Saves the selected travel type into the user's active trip
 */
exports.updateTravelType = async (req, res) => {
  try {
    const { travelType } = req.body;
    if (!travelType) {
      return res.status(400).json({ success: false, error: "travelType is required" });
    }

    // find latest trip for this user
    const trip = await Trip.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!trip) {
      return res.status(404).json({ success: false, error: "No active trip found" });
    }

    trip.travelType = travelType;
    await trip.save();

    res.json({ success: true, data: trip });
  } catch (err) {
    console.error("❌ Error updating travel type:", err);
    res.status(500).json({ success: false, error: "Failed to update travel type" });
  }
};
