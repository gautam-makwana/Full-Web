const express = require("express");
const router = express.Router();
const currencyController = require("../controllers/currency_converter");

// GET currency conversion
router.get("/", currencyController.convertCurrency);

module.exports = router;
