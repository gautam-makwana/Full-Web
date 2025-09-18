const express = require("express");
const mongoose = require("mongoose");

/**
 * Group Tools router factory.
 * Receives `io` (Socket.IO server/namespace) and returns an Express Router.
 */
module.exports = function (io) {
  // -------------------- SCHEMAS --------------------
  const memberSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    tripId: { type: String, required: true, index: true },
    userId: { type: String },
    createdAt: { type: Date, default: Date.now },
  });

  // Compound unique index to help avoid exact duplicate names per trip at DB level
  // (case-sensitive by default — if you want case-insensitive you can add collation)
  memberSchema.index({ tripId: 1, name: 1 }, { unique: true });

  const expenseSchema = new mongoose.Schema({
    description: String,
    amount: Number,
    splitAmount: Number,
    tripId: String,
    userId: String,
    createdAt: { type: Date, default: Date.now },
  });

  const checklistSchema = new mongoose.Schema({
    item: String,
    completed: { type: Boolean, default: false },
    tripId: String,
    userId: String,
    createdAt: { type: Date, default: Date.now },
  });

  const pollSchema = new mongoose.Schema({
    question: String,
    options: [
      {
        text: String,
        votes: { type: Number, default: 0 },
      },
    ],
    votedUserIds: [
      {
        userId: String,
        optionIndex: Number,
      },
    ],
    tripId: String,
    userId: String,
    createdAt: { type: Date, default: Date.now },
  });

  const announcementSchema = new mongoose.Schema({
    text: String,
    tripId: String,
    userId: String,
    createdAt: { type: Date, default: Date.now },
  });

  // -------------------- MODELS --------------------
  // Use distinct model names to avoid clashing with other files
  const Member = mongoose.models.GroupToolMember || mongoose.model("GroupToolMember", memberSchema);
  const Expense = mongoose.models.GroupToolExpense || mongoose.model("GroupToolExpense", expenseSchema);
  const Checklist = mongoose.models.GroupToolChecklist || mongoose.model("GroupToolChecklist", checklistSchema);
  const Poll = mongoose.models.GroupToolPoll || mongoose.model("GroupToolPoll", pollSchema);
  const Announcement = mongoose.models.GroupToolAnnouncement || mongoose.model("GroupToolAnnouncement", announcementSchema);

  const router = express.Router();

  // Helper: broadcast current authoritative members list for a trip
  async function broadcastMembers(tripId) {
    try {
      const list = await Member.find({ tripId }).sort({ createdAt: 1 }).lean();
      io.of("/group").to(tripId).emit("updateMembers", list);
      return list;
    } catch (err) {
      console.error("broadcastMembers error:", err);
      return [];
    }
  }
  
  // -------------------- MEMBERS --------------------
  router.get("/:tripId/members", async (req, res) => {
    try {
      const members = await Member.find({ tripId: req.params.tripId }).sort({ createdAt: 1 }).lean();
      res.json(members);
    } catch (err) {
      console.error("get members error:", err);
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  router.post("/:tripId/members", async (req, res) => {
    try {
      const { name, userId } = req.body;
      const tripId = req.params.tripId;
      if (!tripId) return res.status(400).json({ error: "tripId required" });
      if (!name || !name.trim()) return res.status(400).json({ error: "name required" });

      const trimmed = name.trim();
      const existing = await Member.findOne({ tripId, name: trimmed }).lean();
      if (existing) {
        const list = await broadcastMembers(tripId);
        return res.status(200).json(existing);
      }

      const member = new Member({ name: trimmed, tripId, userId });
      await member.save();
      const list = await broadcastMembers(tripId);
      return res.status(201).json(member);
    } catch (err) {
      console.error("add member error:", err);
      if (err && err.code === 11000) {
        const list = await broadcastMembers(req.params.tripId);
        return res.status(409).json({ error: "Duplicate", list });
      }
      return res.status(500).json({ error: "Failed to add member" });
    }
  });

  router.patch("/:tripId/members/:id", async (req, res) => {
    try {
      const { name, userId } = req.body;
      const { tripId, id } = req.params;
      if (!name || !name.trim()) return res.status(400).json({ error: "Valid name required" });

      const member = await Member.findById(id);
      if (!member || member.tripId !== tripId) return res.status(404).json({ error: "Member not found" });

      const normalizedName = name.trim();
      const conflict = await Member.findOne({ tripId, name: normalizedName, _id: { $ne: id } });
      if (conflict) {
        return res.status(409).json({ error: "Another member with that name exists" });
      }

      member.name = normalizedName;
      await member.save();
      const list = await broadcastMembers(tripId);
      return res.json(member);
    } catch (err) {
      console.error("patch member error:", err);
      return res.status(500).json({ error: "Failed to update member" });
    }
  });

  router.delete("/:tripId/members/:id", async (req, res) => {
    try {
      const { tripId, id } = req.params;
      const result = await Member.findByIdAndDelete(id);
      if (!result) return res.status(404).json({ error: "Member not found" });
      await broadcastMembers(tripId);
      return res.json({ success: true });
    } catch (err) {
      console.error("delete member error:", err);
      return res.status(500).json({ error: "Failed to delete member" });
    }
  });

  // -------------------- EXPENSES --------------------
  router.get("/:tripId/expenses", async (req, res) => {
    const expenses = await Expense.find({ tripId: req.params.tripId }).sort({ createdAt: -1 });
    res.json(expenses);
  });

  router.post("/:tripId/expenses", async (req, res) => {
    try {
      const { description, amount, splitAmount, userId } = req.body;
      const expense = new Expense({ description, amount, splitAmount, tripId: req.params.tripId, userId });
      await expense.save();
      io.of("/group").to(req.params.tripId).emit("updateExpenses", await Expense.find({ tripId: req.params.tripId }).sort({ createdAt: -1 }));
      res.status(201).json(expense);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add expense" });
    }
  });
  
  router.delete("/:tripId/expenses/:id", async (req, res) => {
    try {
      await Expense.findByIdAndDelete(req.params.id);
      io.of("/group").to(req.params.tripId).emit("updateExpenses", await Expense.find({ tripId: req.params.tripId }).sort({ createdAt: -1 }));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // -------------------- CHECKLIST --------------------
  router.get("/:tripId/checklist", async (req, res) => {
    const tasks = await Checklist.find({ tripId: req.params.tripId }).sort({ createdAt: -1 });
    res.json(tasks);
  });

  router.post("/:tripId/checklist", async (req, res) => {
    try {
      const { item, userId, isCompleted } = req.body;
      const task = new Checklist({ item, tripId: req.params.tripId, userId, completed: isCompleted });
      await task.save();
      io.of("/group").to(req.params.tripId).emit("updateChecklist", await Checklist.find({ tripId: req.params.tripId }).sort({ createdAt: -1 }));
      res.status(201).json(task);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add task" });
    }
  });
  
  // Correct PATCH route to toggle task completion
  router.patch("/:tripId/checklist/:id", async (req, res) => {
    try {
      const { isCompleted } = req.body;
      const task = await Checklist.findById(req.params.id);
      if (!task) return res.status(404).json({ error: "Task not found" });

      task.completed = isCompleted;
      await task.save();
      io.of("/group").to(req.params.tripId).emit("updateChecklist", await Checklist.find({ tripId: req.params.tripId }).sort({ createdAt: -1 }));
      res.json(task);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to toggle task" });
    }
  });

  router.delete("/:tripId/checklist/:id", async (req, res) => {
    try {
      await Checklist.findByIdAndDelete(req.params.id);
      io.of("/group").to(req.params.tripId).emit("updateChecklist", await Checklist.find({ tripId: req.params.tripId }).sort({ createdAt: -1 }));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // -------------------- POLLS --------------------
  router.get("/:tripId/polls", async (req, res) => {
    const polls = await Poll.find({ tripId: req.params.tripId }).sort({ createdAt: -1 });
    res.json(polls);
  });

  router.post("/:tripId/polls", async (req, res) => {
    try {
      const { question, options, userId } = req.body;
      const poll = new Poll({ question, options, tripId: req.params.tripId, userId });
      await poll.save();
      io.of("/group").to(req.params.tripId).emit("updatePolls", await Poll.find({ tripId: req.params.tripId }).sort({ createdAt: -1 }));
      res.status(201).json(poll);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add poll" });
    }
  });

  router.patch("/:tripId/polls/:id/vote", async (req, res) => {
    try {
      const { optionIndex, userId } = req.body;
      const poll = await Poll.findById(req.params.id);
      if (!poll) return res.status(404).json({ error: "Poll not found" });

      if (poll.votedUserIds.some(v => v.userId === userId)) {
        return res.status(400).json({ error: "User has already voted" });
      }

      if (optionIndex >= poll.options.length) {
        return res.status(400).json({ error: "Invalid option index" });
      }

      poll.votedUserIds.push({ userId, optionIndex });
      poll.options[optionIndex].votes = (poll.options[optionIndex].votes || 0) + 1;
      await poll.save();

      io.of("/group").to(req.params.tripId).emit("updatePolls", await Poll.find({ tripId: req.params.tripId }).sort({ createdAt: -1 }));
      res.json(poll);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to vote" });
    }
  });

  router.delete("/:tripId/polls/:id", async (req, res) => {
    try {
      await Poll.findByIdAndDelete(req.params.id);
      io.of("/group").to(req.params.tripId).emit("updatePolls", await Poll.find({ tripId: req.params.tripId }).sort({ createdAt: -1 }));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete poll" });
    }
  });

  // -------------------- ANNOUNCEMENTS --------------------
  router.get("/:tripId/announcements", async (req, res) => {
    const announcements = await Announcement.find({ tripId: req.params.tripId }).sort({ createdAt: -1 });
    res.json(announcements);
  });

  router.post("/:tripId/announcements", async (req, res) => {
    try {
      const { text, userId } = req.body;
      const announcement = new Announcement({ text, tripId: req.params.tripId, userId });
      await announcement.save();
      io.of("/group").to(req.params.tripId).emit("updateAnnouncements", await Announcement.find({ tripId: req.params.tripId }).sort({ createdAt: -1 }));
      res.status(201).json(announcement);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add announcement" });
    }
  });

  router.delete("/:tripId/announcements/:id", async (req, res) => {
    try {
      await Announcement.findByIdAndDelete(req.params.id);
      io.of("/group").to(req.params.tripId).emit("updateAnnouncements", await Announcement.find({ tripId: req.params.tripId }).sort({ createdAt: -1 }));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete announcement" });
    }
  });

  return router;
};