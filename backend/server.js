const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const Message = require('./models/Message');
const chatRoutes = require('./routes/chatRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/vendors', vendorRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);

const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"], // Your React app's URL
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] New connection established. Socket ID: ${socket.id}`);

  socket.on('join_room', (chatRoomId) => {
    socket.join(chatRoomId);
    console.log(`[Socket.IO] Socket ${socket.id} successfully joined room: ${chatRoomId}`);
  });

  socket.on('send_message', async (data, callback) => {
    console.log(`[Socket.IO] Received 'send_message' event with data:`, data);
    try {
      const newMessage = new Message({
        transactionId: data.transactionId,
        author: data.authorId,
        message: data.message,
      });
      await newMessage.save();
      console.log(`[Socket.IO] Message saved to DB. ID: ${newMessage._id}`);

      const savedMessage = await Message.findById(newMessage._id).populate('author', 'username');

      const clientsInRoom = io.sockets.adapter.rooms.get(data.room);
      if (clientsInRoom) {
        console.log(`[Socket.IO] Clients in room ${data.room}:`, clientsInRoom);
        console.log(`[Socket.IO] Room size: ${clientsInRoom.size}`);
      } else {
        console.log(`[Socket.IO] Room ${data.room} is empty or does not exist.`);
      }
      // --- THIS IS THE CORRECTED LINE ---
      // The correct syntax is socket.broadcast.to(room).emit(...)
      socket.broadcast.to(data.room).emit('receive_message', savedMessage);
      
      console.log(`[Socket.IO] Broadcasted message to room ${data.room} (excluding sender)`);

      if (callback) {
        callback(savedMessage);
      }

    } catch (error) {
      console.error('[Socket.IO] Error in send_message handler:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] User disconnected. Socket ID: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));