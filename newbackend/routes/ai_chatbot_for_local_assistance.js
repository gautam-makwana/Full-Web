const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/authMiddleware");
const aiController = require("../controllers/ai_chatbot_for_local_assistance");

// POST user message → Gemini AI response
router.post("/", verifyToken, aiController.askAI);

module.exports = router;
