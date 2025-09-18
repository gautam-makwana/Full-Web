// backend/controllers/currency_converter.js
const fixerService = require("../services/fixer_service");

/**
 * Convert currency
 */
exports.convertCurrency = async (req, res) => {
  try {
    const { from = "USD", to = "INR", amount = 1 } = req.query;
    const result = await fixerService.convert(from, to, amount);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("❌ Currency conversion error:", err);
    res.status(500).json({ success: false, error: "Failed to convert currency" });
  }
};
