// server.js
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socket = require('./socket');
const { createClient } = require('redis');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedTest');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());
app.use('/api/protected', protectedRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
  res.send('Bokningsplattformen är igång');
});

const server = http.createServer(app);

// SOCKET.IO 
const io = socket.init(server);

io.on('connection', (socketClient) => {
  console.log('Klient ansluten med socket id:', socketClient.id);

  socketClient.on('disconnect', () => {
    console.log('Klient kopplade från:', socketClient.id);
  });
});

// REDIS 
let redisClient;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,  
      socket: {
        tls: true,                
        rejectUnauthorized: false,
      },
    });

    redisClient.on('connect', () => console.log(' Connected to Redis'));
    redisClient.on('error', (err) => console.error(' Redis connection error:', err));

    await redisClient.connect();
  } catch (err) {
    console.error(' Redis connection failed:', err);
  }
};

// --- STARTA SERVER ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' MongoDB connected');

    await connectRedis();

    server.listen(PORT, () => {
      console.log(`Servern är igång på port ${PORT}`);
    });
  } catch (error) {
    console.error(' Fel vid start:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = { redisClient };
