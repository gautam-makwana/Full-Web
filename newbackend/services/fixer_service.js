// backend/services/fixer_service.js
const axios = require("axios");
const FIXER_KEY = process.env.FIXER_API_KEY;

/**
 * Currency conversion using Fixer.io
 */
exports.convert = async (from, to, amount) => {
  try {
    const res = await axios.get("http://data.fixer.io/api/latest", {
      params: {
        access_key: FIXER_KEY,
      },
    });

    const rates = res.data.rates;
    if (!rates[from] || !rates[to]) throw new Error("Invalid currency");

    const converted = (amount / rates[from]) * rates[to];
    return { from, to, amount, converted };
  } catch (err) {
    console.error("❌ Fixer API error:", err.message);
    return { from, to, amount, converted: null };
  }
};
