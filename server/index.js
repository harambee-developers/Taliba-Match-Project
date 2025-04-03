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
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messagesRoutes");
const matchRoutes = require("./routes/matchRoutes");

const port = 7777;
const app = express();
const server = http.createServer(app)

const corsOptions = {
  origin: ["https://talibamatch.com", "http://localhost", "http://localhost:5173"],
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
      // Add socket ID to the user’s active socket list
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);

      const user = await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: null, // Reset last seen when they come online
        socketId: socket.id
      });

      console.log(`✅ User ${userId} is now ONLINE`);

      socket.broadcast.emit("user_online", { userId, username: user?.firstName });
    } catch (error) {
      console.error("❌ Error updating online status:", error);
    }
  });

  socket.on("join_chat", async ({ conversationId, userId }) => {
    socket.join(conversationId);

    console.log(`User ${userId} joined chat ${conversationId}.`);

    try {
      // Update messages as read in DB
      await Message.updateMany(
        {
          conversation_id: conversationId,
          receiver_id: userId,
          status: "Sent",
        },
        {
          $set: { status: "Read" },
        }
      );

      console.log(`✅ Marking messages as read for user ${userId} in chat ${conversationId}`);

      // Emit event to ALL users in the conversation, including the sender
      io.to(conversationId).emit("messages_read", { conversationId, receiverId: userId });

    } catch (error) {
      console.error("❌ Error updating message status:", error);
    }
  });

  socket.removeAllListeners("typing");
  socket.on("typing", ({ conversationId, senderId }) => {
    socket.to(conversationId).emit("typing", { senderId });
  });

  socket.removeAllListeners("stop_typing");
  socket.on("stop_typing", ({ conversationId, senderId }) => {
    socket.to(conversationId).emit("stop_typing", { senderId });
  });

  socket.on("check_user_online", ({ userId }) => {
    const isOnline = onlineUsers.has(userId);
    socket.emit("user_online", { userId, online: isOnline });
  });

  // Handle "user_offline" event from the client.
  socket.on("user_offline", async ({ userId }) => {
    if (!userId) return;

    onlineUsers.delete(userId);
    await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });

    console.log(`🚫 User ${userId} is now OFFLINE`);
    io.emit("user_offline", { userId, lastSeen: new Date().toISOString() });
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

      // Retrieve sender's user information to get the firstName
      const senderUser = await User.findById(sender_id);
      const username = senderUser?.firstName || "Unknown";

      // Broadcast message to the receiver in the same conversation
      io.to(conversation_id).emit("message", { message, username});

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
      let userIdToRemove = null;

      // Find the user that owns this socket
      for (const [userId, sockets] of onlineUsers.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          userIdToRemove = userId;

          // If user has no more active sockets, mark them offline
          if (sockets.size === 0) {
            onlineUsers.delete(userId);
            await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });

            console.log(`🚫 User ${userId} is now OFFLINE`);
            io.emit("user_offline", { userId, lastSeen: new Date().toISOString() });
            socket.removeAllListeners(); // 🚀 Remove all listeners for this socket
          }
          break;
        }
      }
    } catch (error) {
      console.error("❌ Error setting user offline:", error);
    }
  });
})

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
