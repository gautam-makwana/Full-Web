// backend/controllers/live_tracking.js

// In-memory store (you could move to MongoDB if persistence is needed)
let groupLocations = {};

/**
 * Update a user’s live location
 */
exports.updateLocation = async (req, res) => {
  try {
    const { roomId, userId, lat, lon, name } = req.body;
    if (!roomId || !userId || !lat || !lon) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    if (!groupLocations[roomId]) groupLocations[roomId] = {};
    groupLocations[roomId][userId] = { lat, lon, name, ts: Date.now() };

    res.json({ success: true, message: "Location updated" });
  } catch (err) {
    console.error("❌ Live tracking error:", err);
    res.status(500).json({ success: false, error: "Failed to update location" });
  }
};

/**
 * Get all locations in a room
 */
exports.getGroupLocations = async (req, res) => {
  try {
    const { roomId } = req.params;
    const locations = groupLocations[roomId] || {};
    res.json({ success: true, data: locations });
  } catch (err) {
    console.error("❌ Fetch locations error:", err);
    res.status(500).json({ success: false, error: "Failed to get locations" });
  }
};
