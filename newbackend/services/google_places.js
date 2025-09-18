// backend/services/google_places.js
const axios = require("axios");

const getKey = () => process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_KEY;

async function getNearbyPlaces(lat, lon, type = "tourist_attraction") {
  try {
    const API_KEY = getKey();
    if (!API_KEY) {
      console.error("[GooglePlaces] Missing API key in environment (expected GOOGLE_MAPS_API_KEY or GOOGLE_PLACES_API_KEY)");
      return [];
    }

    const radius = 1500;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=${type}&key=${API_KEY}`;

    console.log("[GooglePlaces] Requesting:", url);
    const res = await axios.get(url);
    const data = res?.data || {};

    if (data.error_message) {
      console.error("[GooglePlaces] API Error:", data.error_message);
      return [];
    }

    const results = data.results || [];
    console.log(`[GooglePlaces] Received ${results.length} results`);

    return results.map((p) => ({
      name: p.name,
      address: p.vicinity || "",
      rating: p.rating ?? null,
      userRatingsTotal: p.user_ratings_total ?? null,
      category: (p.types && p.types[0]) || null,
      location: p.geometry && p.geometry.location ? { lat: p.geometry.location.lat, lng: p.geometry.location.lng } : { lat: 0, lng: 0 },
    }));
  } catch (err) {
    console.error("[GooglePlaces] Exception:", err && err.message ? err.message : err);
    return [];
  }
}

module.exports = { getNearbyPlaces };
