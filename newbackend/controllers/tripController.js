const Trip = require("../models/Trip");

// Create a trip
exports.createTrip = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = req.body || {};
    payload.userId = req.user.id;

    const trip = await Trip.create(payload);
    return res.status(201).json({ trip }); // ✅ wrapped in { trip }
  } catch (err) {
    console.error("createTrip error:", err);
    return res.status(500).json({ error: "Failed to create trip" });
  }
};

// Get trip summary for current user
exports.getTripSummary = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const trip = await Trip.findOne({ userId: req.user.id })
      .populate("members")
      .lean();

    if (!trip) return res.status(404).json({ error: "No trip found" });
    return res.json({ trip }); // ✅ consistent response
  } catch (err) {
    console.error("getTripSummary error:", err);
    return res.status(500).json({ error: "Failed to fetch trip summary" });
  }
};

// Update trip
exports.updateTrip = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = req.params.id;
    const payload = req.body || {};

    const trip = await Trip.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      payload,
      { new: true }
    );

    if (!trip) return res.status(404).json({ error: "Trip not found or permission denied" });
    return res.json({ trip });
  } catch (err) {
    console.error("updateTrip error:", err);
    return res.status(500).json({ error: "Failed to update trip" });
  }
};

// Delete trip
exports.deleteTrip = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = req.params.id;
    const trip = await Trip.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!trip) return res.status(404).json({ error: "Trip not found or permission denied" });
    return res.json({ ok: true, msg: "Trip deleted" });
  } catch (err) {
    console.error("deleteTrip error:", err);
    return res.status(500).json({ error: "Failed to delete trip" });
  }
};
