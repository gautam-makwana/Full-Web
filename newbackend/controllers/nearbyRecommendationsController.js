// backend/controllers/nearbyRecommendationsController.js
const { getNearbyPlaces } = require("../services/google_places");

const FALLBACK = [
  { name: "City Park", vicinity: "Green Park", location: { lat: 0, lng: 0 } },
  { name: "Local Market", vicinity: "Downtown", location: { lat: 0, lng: 0 } },
  { name: "Popular Cafe", vicinity: "Central Square", location: { lat: 0, lng: 0 } },
];

exports.getNearbyRecommendations = async (req, res) => {
  try {
    const { lat, lon, type } = req.query;
    console.log("[NearbyController] Incoming request with query:", req.query);

    if (!lat || !lon) {
      console.warn("[NearbyController] Missing lat/lon, returning fallback");
      return res.json({ results: FALLBACK });
    }

    const places = await getNearbyPlaces(lat, lon, type || "tourist_attraction");

    if (!places || places.length === 0) {
      console.warn("[NearbyController] No results from Google, returning fallback");
      return res.json({ results: FALLBACK });
    }

    console.log(`[NearbyController] Returning ${places.length} results`);
    // ensure each result has location shaped { lat, lng }
    const normalized = places.map((p) => ({
      name: p.name,
      address: p.address ?? p.vicinity ?? "",
      category: p.category ?? "",
      rating: p.rating ?? null,
      location: p.location?.lat != null
        ? { lat: p.location.lat, lng: p.location.lng ?? p.location.lon ?? 0 }
        : p.location ?? { lat: p.lat ?? 0, lng: p.lon ?? 0 },
    }));

    return res.json({ results: normalized });
  } catch (err) {
    console.error("[NearbyController] Error fetching places:", err && err.message ? err.message : err);
    return res.status(500).json({ error: "Failed to fetch nearby places", results: FALLBACK });
  }
};
