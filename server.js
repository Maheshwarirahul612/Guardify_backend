const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const socketHandler = require('./sockets/socket');
const bodyParser = require('body-parser');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app); // Ensure we're using the HTTP server here
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://192.168.175.15:8081',
      'https://maheshwarirahul612.github.io',
      'https://maheshwarirahul612.github.io/Guardify', // ✅ Add this
    ],
    credentials: true, // Allow credentials (cookies, headers, etc.)
    methods: ['GET', 'POST'], // Allowed methods
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settings');
const chatRoutes = require('./routes/chatRoutes');
const requestRoutes = require('./routes/requestRoutes'); // Add requestRoutes


// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/user', authRoutes);
app.use('/api', requestRoutes);
app.use('/api/chat', chatRoutes);


// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Socket Setup
socketHandler(io);

// Start the server
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
