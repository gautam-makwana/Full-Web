const mongoose = require("mongoose");

const JournalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  photos: [
    {
      url: String, // Store path or URL
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Journal", JournalSchema);
