// backend/services/transport_service.js
const axios = require("axios");

const AVIATIONSTACK_KEY = process.env.AVIATIONSTACK_API_KEY;
const RAIL_API_URL = process.env.RAIL_API_URL || "http://localhost:5000";

// Flights (AviationStack)
async function getFlights(from, to, date) {
  try {
    if (!AVIATIONSTACK_KEY) return [];
    const q = `dep_iata=${encodeURIComponent(from)}&arr_iata=${encodeURIComponent(to)}&flight_date=${encodeURIComponent(date || "")}`;
    const url = `http://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_KEY}&${q}`;
    const r = await axios.get(url);
    const data = r.data?.data || [];
    return data.map((f) => ({
      airline: f.airline?.name,
      flightNumber: f.flight?.iata || f.flight?.icao,
      from: f.departure?.airport,
      to: f.arrival?.airport,
      departure: f.departure?.estimated || f.departure?.actual || f.departure?.scheduled,
      arrival: f.arrival?.estimated || f.arrival?.actual || f.arrival?.scheduled,
      status: f.flight_status,
      price: Math.floor(Math.random() * 6000) + 1500,
      duration: f.flight?.duration || "N/A",
    }));
  } catch (err) {
    console.warn("getFlights error:", err.message);
    return [];
  }
}

// Trains (proxy to your indian-rail-api)
async function getTrains(from, to, date) {
  try {
    const res = await axios.get(`${RAIL_API_URL}/getTrains`, { params: { from, to, date } });
    return (res.data && res.data.trains) ? res.data.trains : res.data;
  } catch (err) {
    console.warn("getTrains error:", err.message);
    return [];
  }
}

// Buses (mock)
async function getBuses(from, to, date) {
  try {
    return [
      { provider: "KSRTC", from, to, departure: `${date || "TBA"}T08:00:00Z`, arrival: `${date || "TBA"}T14:00:00Z`, duration: "6h", price: 900, status: "active" },
      { provider: "VRL Travels", from, to, departure: `${date || "TBA"}T22:00:00Z`, arrival: `${date || "TBA"}T04:00:00Z`, duration: "6h", price: 1100, status: "active" },
    ];
  } catch (err) {
    console.warn("getBuses error:", err.message);
    return [];
  }
}

module.exports = { getFlights, getTrains, getBuses };
