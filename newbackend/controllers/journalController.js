// backend/controllers/journalController.js
const path = require("path");
const JournalEntry = require("../models/JournalEntry"); // adjust path if your model filename differs

// GET /api/journal  -> returns { entries: [...] }
exports.getEntries = async (req, res) => {
  try {
    // optionally accept tripId query or only user's entries
    const query = {};
    if (req.user && req.user.id) query.userId = req.user.id;
    if (req.query.tripId) query.tripId = req.query.tripId;

    const entries = await JournalEntry.find(query).sort({ createdAt: -1 }).lean();

    // ensure each photo has a public url if stored as filename
    const host = `${req.protocol}://${req.get("host")}`;
    const normalized = entries.map((e) => {
      const photos = (e.photos || []).map((p) => {
        // if p.url already looks like a full URL, keep it; else build /uploads/journal/<filename>
        if (!p || !p.url) return null;
        if (/^https?:\/\//i.test(p.url)) return p;
        return { ...p, url: p.url.startsWith("/uploads") ? `${host}${p.url}` : `${host}/uploads/journal/${p.url}` };
      }).filter(Boolean);
      return { ...e, photos };
    });

    return res.json({ entries: normalized });
  } catch (err) {
    console.error("getEntries error:", err);
    return res.status(500).json({ error: "Failed to fetch journal entries" });
  }
};

// POST /api/journal  -> expects form-data (title, content, photos[])
exports.createEntry = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    // handle uploaded files (multer) at req.files
    const photos = (req.files || []).map((file) => {
      // store filename in DB and rely on /uploads static serving
      return { url: file.filename, public_id: file.filename };
    });

    const entry = await JournalEntry.create({
      userId,
      title,
      content,
      photos,
    });

    const host = `${req.protocol}://${req.get("host")}`;
    const normalizedPhotos = (entry.photos || []).map((p) => ({
      ...p,
      url: p.url.startsWith("/uploads") ? `${host}${p.url}` : `${host}/uploads/journal/${p.url}`,
    }));

    const result = { ...entry.toObject(), photos: normalizedPhotos };

    return res.status(201).json({ entry: result });
  } catch (err) {
    console.error("createEntry error:", err);
    return res.status(500).json({ error: "Failed to create journal entry" });
  }
};

// DELETE /api/journal/:id
exports.deleteEntry = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const id = req.params.id;
    const entry = await JournalEntry.findOneAndDelete({ _id: id, userId });
    if (!entry) return res.status(404).json({ error: "Entry not found or not allowed" });

    // optionally remove files from disk
    // if (entry.photos && entry.photos.length) { ... fs.unlinkSync(...) ... }

    return res.json({ ok: true, id });
  } catch (err) {
    console.error("deleteEntry error:", err);
    return res.status(500).json({ error: "Failed to delete entry" });
  }
};
