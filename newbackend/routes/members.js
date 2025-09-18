const express = require("express");
const Member = require("../models/Member");
const router = express.Router();

// Add members
router.post("/", async (req, res) => {
  try {
    const { members, tripId, userId } = req.body;

    if (!tripId) return res.status(400).json({ error: "tripId is required" });
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: "Members must be a non-empty array" });
    }

    const newMembers = await Member.insertMany(
      members.map((m) => ({ name: m.name, tripId, userId }))
    );

    res.json(newMembers);
  } catch (err) {
    console.error("❌ Error saving members:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
