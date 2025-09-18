// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const socketio = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

// ----------------- CORS -----------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin?.trim())) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ----------------- Import Routes -----------------
const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");
const journalRoutes = require("./routes/journal");
const transportRoutes = require("./routes/transport");
const groupToolRoutes = require("./routes/groupTools"); // factory: io => router
const { verifyTokenSocket } = require("./utils/authMiddleware");

// ----------------- Socket.IO -----------------
const io = socketio(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// ----------------- Socket Namespace: Group -----------------
const groupNamespace = io.of("/group");

groupNamespace.use(async (socket, next) => {
  try {
    await verifyTokenSocket(socket);
    next();
  } catch (err) {
    console.error("❌ Socket auth failed:", err.message);
    next(new Error("Authentication error"));
  }
});

groupNamespace.on("connection", (socket) => {
  console.log(`✅ Socket connected: ${socket.id} (user: ${socket.user?.id || "anon"})`);

  socket.on("joinRoom", (roomId) => {
    if (!roomId) return;
    socket.join(roomId);
    socket.to(roomId).emit("userJoined", { socketId: socket.id, user: socket.user });
  });

  socket.on("leaveRoom", (roomId) => socket.leave(roomId));

  socket.on("locationUpdate", ({ roomId, userId, lat, lon, name }) => {
    if (!roomId) return;
    socket.to(roomId).emit("locationUpdate", { userId, lat, lon, name, ts: Date.now() });
  });

  socket.on("chatMessage", ({ roomId, message, user }) => {
    if (!roomId || !message) return;
    groupNamespace.to(roomId).emit("chatMessage", { message, user, ts: Date.now() });
  });

  ["updateMembers","updateExpenses","updateChecklist","updatePolls","updateAnnouncements"].forEach(event => {
    socket.on(event, (payload) => {
      const roomId = payload?.roomId;
      const data = payload?.data || {};
      if (!roomId) return;
      socket.to(roomId).emit(event, data);
    });
  });

  socket.on("disconnect", (reason) => {
    console.log(`⚠️ Socket disconnected: ${socket.id} (${reason})`);
  });
});

// ----------------- API Routes -----------------
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/transport", transportRoutes);

// accept /journal alias (legacy)
app.use("/journal", journalRoutes);

// Nearby recommendations
app.use("/api/nearby", require("./routes/nearby_recommendations"));

// Extra TravelMate routes
app.use("/api/travel-type", require("./routes/travel_type_selection"));
app.use("/api/mood", require("./routes/mood_based_destination"));
app.use("/api/travel-medium", require("./routes/travel_medium_suggestions"));
app.use("/api/packing", require("./routes/packing_suggestions"));
app.use("/api/live", require("./routes/live_tracking"));
app.use("/api/group-chat", require("./routes/group_chat"));
app.use("/api/currency", require("./routes/currency_converter"));
app.use("/api/translate", require("./routes/language_translator"));
app.use("/api/ai", require("./routes/ai_chatbot_for_local_assistance"));

// ----------------- Group Tools Route (pass io) -----------------
app.use("/api/group-tools", groupToolRoutes(io));

// ----------------- Static Uploads -----------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads/journal", express.static(path.join(__dirname, "uploads/journal")));

// ----------------- Health Check -----------------
app.get("/api/health", (req, res) => res.json({ ok: true, ts: Date.now() }));

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 8080;

async function start() {
  try {
    // connect to mongodb only if uri present
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ MongoDB connected");
    } else {
      console.log("⚠️ MONGODB_URI not set — skipping DB connect (useful for local dev without DB)");
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err && err.message ? err.message : err);
    process.exit(1);
  }
}

start();
