// backend/routes/packing_suggestions.js
const express = require("express");
const router = express.Router();
const { getPackingSuggestions } = require("../controllers/packing_suggestions");
const { verifyToken } = require("../utils/authMiddleware");

router.get("/", verifyToken, getPackingSuggestions);

module.exports = router;
