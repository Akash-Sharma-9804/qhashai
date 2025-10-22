



// test working
global.fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

global.ReadableStream = require('stream/web').ReadableStream;

require("dotenv").config();
const express = require("express");
const cors = require("cors"); 
const cookieParser = require("cookie-parser");
const session = require("express-session");


const http = require("http");
const { WebSocketServer } = require("ws");
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("./config/passport"); // <- Make sure this is loaded
// const cron = require('node-cron');
// const { cleanupOtps } = require('./controllers/authController');
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const chatRoutes = require("./routes/chatRoutes");
const voiceRoutes = require("./routes/voiceRoutes");
const middleware = require("./middleware/authMiddleware");
// const { handleLiveVoiceMessage } = require("./controllers/voiceController");
const { handleLiveVoiceMessage, handleDictateMode } = require("./controllers/voiceController");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Allowed origins for both local & production
const allowedOrigins = [
  "http://localhost:5173",          // Local dev
//  "https://composed-singular-seagull.ngrok-free.app/stream", // Your ngrok URL
  "https://qhashai.com", // Your production frontend domain
  "*"
];

// ✅ CORS middleware (basic setup)
// const corsOptions = {
//   origin: allowedOrigins,
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
// };

const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins, including undefined (for tools like Postman)
    callback(null, origin || "*");
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
};


app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ✅ Middleware
// app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard_cat", // keep this secret in env
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true if using HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session()); // <-- critical for Google login to persist user

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/voice", voiceRoutes); // ⬅️ Added voice route

// ✅ Base rout
app.get("/", (req, res) => res.send("Welcome to QhashAi1! "));

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Run every 15 minutes (adjust as needed)
// cron.schedule('*/20 * * * *', () => {
//   console.log("🕒 Running OTP cleanup cron job...");
//   await cleanupOtps();
// });
// cron.schedule('*/07 * * * *', async () => {
//   console.log(`🕒 [${new Date().toLocaleString()}] Running OTP cleanup...`);
//   await cleanupOtps();
// });


// ✅ Create HTTP server for Express + WebSocket
const server = http.createServer(app);

// ✅ WebSocket for Live Voice Streaming with Deepgram
const wss = new WebSocketServer({ 
  server, 
  path: "/api/voice/ws",
  // Increase WebSocket limits for audio streaming
  maxPayload: 16 * 1024 * 1024, // 16MB max payload
  perMessageDeflate: false, // Disable compression for better audio streaming
});

console.log('🚀 WebSocket server initialized on path: /api/voice/ws');

wss.on("connection", async (ws, req) => {
  console.log('📞 New WebSocket connection attempt');
  
  try {
    // Check if the token is passed through headers or query params
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token") || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.error("❌ No token provided");
      ws.send(JSON.stringify({ 
        type: "error", 
        error: "Authentication required" 
      }));
      return ws.close(1008, "Authentication required");
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.user_id;
    // ✅ Extract conversation_id from query
const conversationIdRaw = url.searchParams.get("conversation_id");
const conversationId = conversationIdRaw ? parseInt(conversationIdRaw, 10) : null;

console.log(`🎯 Received conversationId: ${conversationId}`);
  // 👈 NEW: Check for dictate mode
    const mode = url.searchParams.get("mode");

    if (!userId) {
      console.error("❌ Invalid token, closing connection");
      ws.send(JSON.stringify({ 
        type: "error", 
        error: "Invalid authentication token" 
      }));
      return ws.close(1008, "Invalid token");
    }

    console.log(`✅ WebSocket authenticated for user: ${userId}`);

    // Send connection success message
    ws.send(JSON.stringify({
      type: "connected",
      message: "WebSocket connection established",
      userId: userId
    }));

     // 👈 NEW: Route to dictate mode if requested
    if (mode === "dictate") {
      console.log("🎤 [Mode] Routing to dictate mode");
      return handleDictateMode(ws, userId);
    }
    // Proceed with handling the voice stream if the token is valid
    await handleLiveVoiceMessage(ws, userId, conversationId);

  } catch (error) {
    console.error("❌ WebSocket Auth Error:", error.message);
    ws.send(JSON.stringify({ 
      type: "error", 
      error: "Authentication failed" 
    }));
    ws.close(1008, "Authentication failed");
  }
});

// ✅ Handle WebSocket server errors
wss.on("error", (error) => {
  console.error("❌ WebSocket Server Error:", error);
});

// ✅ Log WebSocket server info
wss.on("listening", () => {
  console.log("🎤 WebSocket server listening for voice connections");
});


// ✅ Graceful shutdown for WebSocket
process.on("SIGINT", () => {
  wss.close(() => {
    console.log("✅ WebSocket server closed gracefully");
    server.close(() => {
      console.log("✅ Server shut down gracefully");
      process.exit(0);
    });
  });
});

// ✅ Start server
server.listen(PORT,'127.0.0.1', () => {
  console.log(`🚀 Server running on https://localhost:${PORT}`);
});


