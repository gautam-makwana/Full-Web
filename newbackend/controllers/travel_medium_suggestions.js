// backend/controllers/travel_medium_suggestions.js
const transportService = require("../services/transport_service");

/**
 * Controller: Get transport options
 */
exports.getTransportOptions = async (req, res) => {
  try {
    const { destination } = req.params;
    if (!destination) {
      return res.status(400).json({ success: false, error: "Destination is required" });
    }

    const options = await transportService.getTransportOptions(destination);
    res.json({ success: true, data: options });
  } catch (err) {
    console.error("❌ Transport options error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch transport options" });
  }
};
