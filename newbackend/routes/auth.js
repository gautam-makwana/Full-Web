const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../utils/authMiddleware");

// ----------------- Auth Routes -----------------
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", verifyToken, authController.me);

// ----------------- Travel Type -----------------
router.put("/travel-type", verifyToken, authController.updateTravelType);

module.exports = router;
