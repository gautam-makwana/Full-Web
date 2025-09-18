// backend/routes/journal.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyToken } = require("../utils/authMiddleware");
const { getEntries, createEntry, deleteEntry } = require("../controllers/journalController");

const router = express.Router();

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/journal");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Routes
router.get("/", verifyToken, getEntries);
router.post("/", verifyToken, upload.array("photos", 10), createEntry);
router.delete("/:id", verifyToken, deleteEntry);

module.exports = router;
