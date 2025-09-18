const jwt = require("jsonwebtoken");

// ---------------- HTTP Middleware ----------------
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ---------------- Socket.IO Middleware ----------------
async function verifyTokenSocket(socket) {
  try {
    const auth = socket.handshake?.auth || {};
    const headers = socket.handshake?.headers || {};

    const headerToken = headers.authorization || headers.Authorization;
    const token =
      auth.token || (headerToken && headerToken.replace(/^Bearer\s+/i, ""));

    if (!token) throw new Error("No token for socket auth");

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: payload.id, email: payload.email };
    return true;
  } catch (err) {
    console.error("❌ Socket auth error:", err.message);
    throw new Error("Invalid socket token");
  }
}

module.exports = { verifyToken, verifyTokenSocket };
