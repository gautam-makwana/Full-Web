const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY not set. AI chatbot will not work.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Sends a message to Gemini AI and returns the response text
 * @param {string} userMessage
 * @returns {Promise<string>}
 */
async function chatWithGemini(userMessage) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(userMessage);
    return result.response.text();
  } catch (err) {
    console.error("❌ Gemini API error:", err.message);
    return "Sorry, I couldn’t process your request.";
  }
}

module.exports = { chatWithGemini };
