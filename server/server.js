require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const roomManager = require('./roomManager');
const registerSocketHandlers = require('./socket');

const app = express();
const server = http.createServer(app);

// Configure CORS
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: clientUrl,
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Express REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Hush server is running smoothly.' });
});

// Endpoint to create a new room
app.post('/api/rooms', (req, res) => {
  try {
    const roomId = roomManager.createRoom();
    res.status(201).json({ success: true, roomId });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ success: false, message: 'Failed to create room.' });
  }
});

// Endpoint to check if a room exists
app.get('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  const exists = roomManager.roomExists(id.trim().toLowerCase());
  res.json({ exists, roomId: id });
});

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: clientUrl,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Register Socket.io events
registerSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Hush Server running on port ${PORT}`);
  console.log(` Client URL allowed: ${clientUrl}`);
  console.log(`=========================================`);
});
