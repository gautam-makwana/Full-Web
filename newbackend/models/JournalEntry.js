const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  url: String,
  public_id: String,
});

const journalEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" }, // optional link to a trip
    title: { type: String, required: true },
    content: { type: String, required: true },
    photos: [photoSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("JournalEntry", journalEntrySchema);
