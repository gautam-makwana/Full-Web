// backend/controllers/group_chat.js

// Simple in-memory store; replace with MongoDB for persistence
let chatHistory = {};

/**
 * Save a message
 */
exports.saveMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { user, message } = req.body;

    if (!roomId || !message) {
      return res.status(400).json({ success: false, error: "Missing roomId or message" });
    }

    if (!chatHistory[roomId]) chatHistory[roomId] = [];
    chatHistory[roomId].push({ user, message, ts: Date.now() });

    res.json({ success: true, message: "Message saved" });
  } catch (err) {
    console.error("❌ Save chat error:", err);
    res.status(500).json({ success: false, error: "Failed to save message" });
  }
};

/**
 * Get chat history
 */
exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = chatHistory[roomId] || [];
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error("❌ Fetch chat history error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
};
