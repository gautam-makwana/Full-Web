// backend/controllers/transport_controller.js
const { getFlights, getTrains, getBuses } = require("../services/transport_service");

exports.getFlights = async (req, res) => {
  try {
    const { from, to, date } = req.query;
    const results = await getFlights(from, to, date);
    res.json({ results });
  } catch (err) {
    console.error("getFlights error:", err);
    res.status(500).json({ error: "Failed to fetch flights" });
  }
};

exports.getTrains = async (req, res) => {
  try {
    const { from, to, date } = req.query;
    const results = await getTrains(from, to, date);
    res.json({ results });
  } catch (err) {
    console.error("getTrains error:", err);
    res.status(500).json({ error: "Failed to fetch trains" });
  }
};

exports.getBuses = async (req, res) => {
  try {
    const { from, to, date } = req.query;
    const results = await getBuses(from, to, date);
    res.json({ results });
  } catch (err) {
    console.error("getBuses error:", err);
    res.status(500).json({ error: "Failed to fetch buses" });
  }
};
