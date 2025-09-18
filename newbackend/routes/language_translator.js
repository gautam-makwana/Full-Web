const express = require("express");
const router = express.Router();
const translatorController = require("../controllers/language_translator");

// POST translation request
router.post("/", translatorController.translateText);

module.exports = router;
