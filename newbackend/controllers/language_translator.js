// backend/controllers/language_translator.js
const googleTranslate = require("../services/google_translate");

/**
 * Translate text
 */
exports.translateText = async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    if (!text || !targetLang) {
      return res.status(400).json({ success: false, error: "Missing text or targetLang" });
    }

    const translated = await googleTranslate.translate(text, targetLang);
    res.json({ success: true, data: translated });
  } catch (err) {
    console.error("❌ Translation error:", err);
    res.status(500).json({ success: false, error: "Failed to translate text" });
  }
};
