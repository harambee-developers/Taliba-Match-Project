const dotenv = require('dotenv')
const express = require("express");
const cors = require("cors");
const http = require('http')
const { Server } = require('socket.io')
const Message = require('./model/Message')
const User = require('./model/User')
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
  origin: ["https://talibamatch.com", "http://localhost", "http://localhost:5173", "http://127.0.0.1:3100"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  transports: ['websocket', 'polling'], // Allow fallback transport // Ensure all necessary methods are allowed
}

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

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`Client has connected`, socket.id)

  // Extract userId from the client (e.g., from auth token)
  socket.on("user_connected", async ({ userId }) => {
    if (!userId) return;

    try {
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: null, // Reset last seen when they come online
        socketId: socket.id
      });

      console.log(`✅ User ${userId} is now ONLINE`);
      io.emit("user_online", { userId });
    } catch (error) {
      console.error("❌ Error updating online status:", error);
    }
  });

  socket.on("join_chat", async ({ conversationId, userId }) => {
    socket.join(conversationId);
    socket._id = userId

    console.log(`User ${userId} joined chat ${conversationId}.`);

    try {
      // Update all messages where the receiver is the user who just joined
      await Message.updateMany(
        {
          conversation_id: conversationId,
          receiver_id: userId,
          status: "Sent"
        },
        {
          $set: { status: "Read" }
        }
      );

      console.log(`Marking messages as read.`);

      // Optionally, notify the sender that messages were read
      socket.to(conversationId).emit("messages_read", { conversationId, receiverId: userId });

    } catch (error) {
      console.error("Error updating message status:", error);
    }
  });

  // Handle "typing" event
  socket.on("typing", ({ conversationId, senderId }) => {
    socket.to(conversationId).emit("typing", { senderId });
  });

  // Handle "stop_typing" event
  socket.on("stop_typing", ({ conversationId, senderId }) => {
    socket.to(conversationId).emit("stop_typing", { senderId });
  });

  socket.on("check_user_online", ({ userId }) => {
    const isOnline = onlineUsers.has(userId);
    // Emit back to the requesting socket only:
    socket.emit("user_online", { userId, online: isOnline });
  });

  // Handle "user_online" event from the client.
  // This could be used if the client wants to explicitly notify the server of its online status.
  socket.on("user_online", ({ userId, conversationId }) => {
    onlineUsers.set(userId, socket.id);
    // Broadcast to other sockets that this user is now online.
    io.to(conversationId).emit("user_online", { userId, conversationId });
    console.log(`User ${userId} is online.`);
  });

  // Handle "user_offline" event from the client.
  socket.on("user_offline", ({ userId, conversationId }) => {
    onlineUsers.delete(userId);
    // Broadcast to other sockets that this user went offline,
    // along with a timestamp to indicate "last seen" time.
    io.to(conversationId).emit("user_offline", { userId, lastSeen: new Date().toISOString() });
    console.log(`User ${userId} is offline.`);
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
        last_sender_id: sender_id,
        updatedAt: new Date(), // Update timestamp
      });

      // Broadcast message to the receiver in the same conversation
      io.to(conversation_id).emit("message", message);

      // ✅ If the receiver is online and in the chatroom, mark message as read
      const receiverSockets = await io.in(conversation_id).fetchSockets();
      const isReceiverOnline = receiverSockets.some(socket => socket.userId === receiver_id);

      if (isReceiverOnline) {
        await Message.findByIdAndUpdate(message._id, { status: "Read" });
        io.to(conversation_id).emit("messages_read", { messageId: message._id });
      }

    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // When a user disconnects, mark as offline
  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);

    try {
      const user = await User.findOneAndUpdate(
        { socketId: socket.id },
        { isOnline: false, lastSeen: new Date() },
        { new: true }
      );

      if (user) {
        console.log(`User ${user._id} is now offline`);
        io.emit("user_offline", { userId: user._id, lastSeen: user.lastSeen });
      }
    } catch (error) {
      console.error("Error setting user offline:", error);
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
