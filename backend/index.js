const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const gigRoutes = require('./routes/gigRoutes');
const hiringRoutes = require('./routes/hiringRoutes');

dotenv.config();
const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH"],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Global Map to track online users for notifications
global.onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('register-user', (userId) => {
    global.onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} linked to socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of global.onlineUsers.entries()) {
      if (socketId === socket.id) {
        global.onlineUsers.delete(userId);
        break;
      }
    }
  });
});

// Make 'io' accessible in controllers
app.set('io', io);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', hiringRoutes);
app.use('/api/hiring', hiringRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server & Socket running on port ${PORT}`));