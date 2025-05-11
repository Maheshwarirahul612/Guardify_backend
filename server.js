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
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:5173',          // Local frontend (development)
      'http://192.168.175.15:8081',     // Local network (mobile)
      'https://maheshwarirahul612.github.io', // GitHub Pages frontend
    ],
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// MongoDB Connection
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
const requestRoutes = require('./routes/requestRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/user', authRoutes); // Optional: consider removing to avoid duplicate route binding
app.use('/api', requestRoutes);
app.use('/api/chat', chatRoutes);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Socket.IO integration
socketHandler(io);

// Start Server on Render-required PORT and HOST
const PORT = process.env.PORT || 10000; // Render sets PORT automatically
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on http://0.0.0.0:${PORT}`);
});
