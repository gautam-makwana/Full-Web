// backend/controllers/packing_suggestions.js
// Defensive packing suggestions controller.
// It will attempt to call the weather service if available, but will never throw
// an unhandled exception back to the client — instead it returns useful fallbacks.

const { getWeather } = require("../services/weather_service");

function tempToCelsius(rawTemp) {
  if (rawTemp == null || Number.isNaN(Number(rawTemp))) return null;
  const t = Number(rawTemp);
  // If it's obviously Kelvin ( > 200 ), convert to Celsius
  if (t > 200) return Math.round(t - 273.15);
  // otherwise assume it's already Celsius
  return Math.round(t);
}

exports.getPackingSuggestions = async (req, res) => {
  try {
    const city = (req.query.city || "").trim();
    const moodRaw = (req.query.mood || "").trim();

    if (!city) {
      // keep consistent with previous behaviour
      return res.status(400).json({ error: "City is required" });
    }

    let weather = null;
    try {
      // call weather service if present; if it throws we'll catch below and continue
      if (typeof getWeather === "function") {
        weather = await getWeather(city);
      }
    } catch (we) {
      console.warn("Warning: weather service failed for city=", city, "error=", we && we.message);
      weather = null;
    }

    const suggestions = [];

    // Base essentials
    suggestions.push("Passport/ID", "Travel tickets", "Wallet", "Phone & Charger");

    // Temperature-based items only if we have a numeric temp
    const rawTemp = weather?.main?.temp ?? weather?.temp ?? null;
    const tempC = tempToCelsius(rawTemp);

    if (tempC != null) {
      if (tempC < 10) {
        suggestions.push("Heavy Winter Jacket", "Woolen Cap", "Gloves", "Thermal Layers");
      } else if (tempC >= 10 && tempC < 20) {
        suggestions.push("Light Jacket", "Long Sleeve Tops");
      } else if (tempC >= 20 && tempC < 30) {
        suggestions.push("Light Cotton Clothes", "Sunscreen", "Sunglasses", "Hat");
      } else {
        suggestions.push("Very Light Clothes", "Sunscreen", "Hat", "Reusable Water Bottle");
      }
    } else {
      // no weather info — give reasonable neutral defaults
      suggestions.push("Layered Clothing (weather unknown)", "Sunscreen", "Comfortable Shoes");
    }

    // Rain check (be defensive: some services use weather[0].main, others use weather_description)
    const weatherMain = (weather?.weather?.[0]?.main || "").toLowerCase();
    const weatherDesc = (weather?.weather?.[0]?.description || "").toLowerCase();

    if (weatherMain.includes("rain") || weatherDesc.includes("rain") || weatherMain.includes("drizzle")) {
      suggestions.push("Umbrella", "Raincoat", "Waterproof Shoes");
    }

    // Activity-specific suggestions (case-insensitive)
    const mood = moodRaw.toLowerCase();
    if (mood.includes("advent") || mood.includes("adventure") || mood.includes("trek")) {
      suggestions.push("Hiking Boots", "Trekking Pole", "First Aid Kit", "Quick-dry Clothing");
    }
    if (mood.includes("beach") || mood.includes("sun")) {
      suggestions.push("Swimwear", "Flip Flops", "Beach Towel", "Beach Bag");
    }
    if (mood.includes("romant") || mood.includes("romantic")) {
      suggestions.push("Dressy Outfit", "Small Gift/Flowers (optional)");
    }

    // De-duplicate while preserving order
    const deduped = [];
    for (const s of suggestions) {
      if (!deduped.includes(s)) deduped.push(s);
    }

    return res.json({ city, weather: weather || null, suggestions: deduped });
  } catch (err) {
    // This catch is a last-resort guard — log full stack, but return a 200 with fallback suggestions
    console.error("Packing API unexpected error:", err && (err.stack || err.message || err));
    const fallback = [
      "Passport/ID",
      "Travel tickets",
      "Wallet",
      "Phone & Charger",
      "Layered Clothing",
      "Comfortable Shoes",
      "Sunscreen",
    ];
    return res.status(200).json({ city: req.query.city || null, weather: null, suggestions: fallback });
  }
};
