// backend/services/weather_service.js
const axios = require("axios");
const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY;

/**
 * Generate packing list based on weather forecast + activities
 */
exports.generatePackingList = async (destination, startDate, endDate, activities = []) => {
  try {
    // Fetch weather
    const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        q: destination,
        appid: OPENWEATHER_KEY,
        units: "metric",
      },
    });

    const temp = res.data.main.temp;
    const weather = res.data.weather[0].main;

    let list = ["Passport/ID", "Cash & Cards", "Toiletries", "Phone Charger"];

    if (temp < 15) list.push("Warm Jacket", "Gloves");
    else if (temp < 25) list.push("Light Jacket", "Jeans");
    else list.push("T-Shirts", "Shorts", "Sunglasses");

    if (weather.includes("Rain")) list.push("Umbrella", "Raincoat");

    // Add based on activities
    if (activities.includes("trekking")) list.push("Trekking Shoes", "Backpack");
    if (activities.includes("beach")) list.push("Swimwear", "Sunscreen");
    if (activities.includes("cultural")) list.push("Ethnic Wear", "Camera");

    return { destination, temp, weather, recommended: list };
  } catch (err) {
    console.error("❌ Weather API error:", err.message);
    return { destination, recommended: ["Clothes", "Essentials", "Shoes"] };
  }
};
