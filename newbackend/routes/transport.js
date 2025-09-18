// backend/routes/transport.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/authMiddleware");
const transportController = require("../controllers/transport_controller");

router.get("/flights", verifyToken, transportController.getFlights);
router.get("/trains", verifyToken, transportController.getTrains);
router.get("/buses", verifyToken, transportController.getBuses);

module.exports = router;
