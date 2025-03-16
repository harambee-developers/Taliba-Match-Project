const dotenv = require('dotenv')
const express = require("express");
const cors = require("cors");
const http = require('http')
const { Server } = require('socket.io')
const Message = require('./model/Message')
const Conversation = require('./model/Conversation')

// Import and initialize the MongoDB connection
require("./db")

// Load the appropriate .env file
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });

const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messagesRoutes");
const matchRoutes = require("./routes/matchRoutes");

const port = 7777;
const app = express();
const server = http.createServer(app)

const corsOptions = {
  origin: ["https://talibamatch.com", "http://localhost", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"], // Ensure all necessary methods are allowed
};

app.use(express.json())
app.use(cors(corsOptions));

// Modularized routes
app.use("/api/payment", paymentRoutes); 
app.use("/api/auth", authRoutes); 
app.use("/api/user", userRoutes); 
app.use("/api/message", messageRoutes); 
app.use("/api/match", matchRoutes);

// WebSocket server on the same port as Express
const io = new Server(server, {
  cors: corsOptions,
});

io.on('connection', (socket) => {
  console.log(`Client has connected`, socket.id)

  socket.on("join_chat", ({ conversationId, userId }) => {
    socket.join(conversationId);
    console.log(`User ${userId} joined chat ${conversationId}`);
  });

  socket.on("send_message", async ({ conversation_id, sender_id, receiver_id, text }) => {
    try {
      // Save message to MongoDB
      const message = await Message.create({
        conversation_id,
        sender_id,
        receiver_id,
        text
      });

      await message.save()

      // Update lastMessage in the Conversation document
      await Conversation.findByIdAndUpdate(conversation_id, {
        last_message: text,  // Update last message
        updatedAt: new Date(), // Update timestamp
      });

      // Broadcast message to the receiver in the same conversation
      io.to(conversation_id).emit("message", message);

    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id)
  })
});

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
