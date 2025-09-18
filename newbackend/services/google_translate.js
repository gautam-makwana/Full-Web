// backend/services/google_translate.js
const axios = require("axios");
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Translate text using Google Translate API
 */
exports.translate = async (text, targetLang) => {
  try {
    const res = await axios.post(
      `https://translation.googleapis.com/language/translate/v2`,
      {},
      {
        params: {
          q: text,
          target: targetLang,
          key: GOOGLE_API_KEY,
        },
      }
    );

    return res.data.data.translations[0].translatedText;
  } catch (err) {
    console.error("❌ Translate API error:", err.message);
    return text; // fallback
  }
};
