const { chatWithGemini } = require("../services/ai_client");

/**
 * POST /api/ai
 * Body: { message }
 * Response: { reply }
 */
exports.askAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const response = await chatWithGemini(message);
    res.json({ reply: response });
  } catch (err) {
    console.error("❌ AI chatbot error:", err.message);
    res.status(500).json({ error: "AI service failed" });
  }
};
