// backend/models/Trip.js
const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    destination: {
      name: { type: String, required: true },
      coords: {
        lat: Number,
        lon: Number,
      },
    },
    mood: { type: String, default: "Custom" },
    date: { type: Date, required: true },
    endDate: { type: Date },
    duration: { type: String, required: true },
    budget: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },

    // ✅ Expanded to support frontend values
    travelType: {
      type: String,
      enum: ["solo", "group", "couple", "family"],
      default: "solo",
      lowercase: true,
      trim: true,
    },

    origin: {
      name: String,
      code: String,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    plannedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
