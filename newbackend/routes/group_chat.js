const express = require("express");
const router = express.Router();
const groupChatController = require("../controllers/group_chat");

// Save chat history
router.post("/:roomId", groupChatController.saveMessage);

// Get chat history
router.get("/:roomId", groupChatController.getMessages);

module.exports = router;
