const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  splitAmount: { type: Number, required: true },
  userId: { type: String, required: true },
  tripId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Expense", ExpenseSchema);
