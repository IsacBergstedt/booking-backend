const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socket = require('./socket');

// Läser .env tidigt
dotenv.config();

// Routes
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedTest');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Init app
const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/protected', protectedRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// Root
app.get('/', (req, res) => res.send('Bokningsplattformen är igång'));

// HTTP + Socket.io
const server = http.createServer(app);
const io = socket.init(server);

io.on('connection', (socketClient) => {
  console.log('Klient ansluten med socket id:', socketClient.id);

  socketClient.on('disconnect', () => {
    console.log('Klient frånkopplad:', socketClient.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); 
    console.log('MongoDB connected');

    server.listen(PORT, () => console.log(`Servern är igång på port ${PORT}`));
  } catch (error) {
    console.error('Fel vid start:', error.message);
    process.exit(1);
  }
};

startServer();

// Upstash Redis import, initieras när den används
require('./redisClient');
