const dotenv = require('dotenv')
const express = require("express");
const cors = require("cors");
const http = require('http')
const { Server } = require('socket.io')
const Message = require('./model/Message')
const User = require('./model/User')
const Notifications = require('./model/Notifications');
const Conversation = require('./model/Conversation')
const path = require('path')
const fs = require('fs')
const logger = require('./logger')

// Import and initialize the MongoDB connection
require("./db")

// Load the appropriate .env file
const envFile = process.env.NODE_ENV === "UAT" ? ".env.UAT" : ".env.development";
dotenv.config({ path: envFile });
logger.info(`Environment: ${envFile}`)

// Ensure public/uploads folder exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info('📁 Created public/uploads directory');
}

const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messagesRoutes");
const matchRoutes = require("./routes/matchRoutes");
const notificationsRoutes = require('./routes/notificationsRoutes');

const port = 7777;
const app = express();
const server = http.createServer(app)

logger.info(process.env.BACKEND_URL, process.env.FRONTEND_URL)

const corsOptions = {
  origin: [process.env.BACKEND_URL, process.env.FRONTEND_URL],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  transports: ['websocket', 'polling'], // Allow fallback transport // Ensure all necessary methods are allowed
}

app.use(express.json())
app.use(cors(corsOptions));
app.use('/uploads', express.static('public/uploads'));

// Modularized routes
app.use("/api/payment", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/match", matchRoutes);
app.use('/api/notifications', notificationsRoutes);

// WebSocket server on the same port as Express
const io = new Server(server, {
  cors: corsOptions,
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  logger.info(`Client has connected`, socket.id)

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

      logger.info(`✅ User ${userId} is now ONLINE`);

      socket.broadcast.emit("user_online", { userId, username: user?.firstName });
    } catch (error) {
      logger.error("❌ Error updating online status:", error);
    }
  });

  socket.on("join_chat", async ({ conversationId, userId }) => {
    socket.join(conversationId);

    logger.info(`User ${userId} joined chat ${conversationId}.`);

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

      logger.info(`✅ Marking messages as read for user ${userId} in chat ${conversationId}`);

      // Emit event to ALL users in the conversation, including the sender
      io.to(conversationId).emit("messages_read", { conversationId, receiverId: userId });

    } catch (error) {
      logger.error("❌ Error updating message status:", error);
    }
  });

  socket.on("typing", ({ conversationId, senderId }) => {
    socket.to(conversationId).emit("typing", { senderId, conversationId });
  });

  socket.on("stop_typing", ({ conversationId, senderId }) => {
    socket.to(conversationId).emit("stop_typing", { senderId, conversationId });
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

    logger.info(`🚫 User ${userId} is now OFFLINE`);
    io.emit("user_offline", { userId, lastSeen: new Date().toISOString() });
  });

  socket.on("notification", async ({ text, type, sender_id, receiver_id, isRead = false }) => {
    try {
      // Optional: Fetch sender info for logging or customizing the text
      const senderUser = await User.findById(sender_id);
      const displayName = senderUser?.firstName || "Someone";
  
      const notification = await Notifications.create({
        userId: receiver_id,
        senderId: sender_id,
        text: text || `${displayName} sent you a notification.`,
        type,
        isRead
      });
  
      await notification.save();
  
      // Emit notification to the receiver if they’re online
      io.to(receiver_id.toString()).emit("new_notification", notification);
  
    } catch (error) {
      logger.error("Error creating notification:", error);
    }
  });

  socket.on("send_message", async ({ conversation_id, sender_id, receiver_id, text, attachment, type }) => {
    try {

      // Save message to MongoDB
      const message = await Message.create({
        conversation_id,
        sender_id,
        receiver_id,
        text,
        attachment,
        type
      });

      await message.save()

      // Retrieve sender's user information to get the firstName
      const senderUser = await User.findById(sender_id);
      const username = senderUser?.firstName || "Unknown";

      // Update lastMessage in the Conversation document
      await Conversation.findByIdAndUpdate(conversation_id, {
        last_message: text,  // Update last message
        last_sender_id: sender_id,
        updatedAt: new Date(), // Update timestamp
      });

      // 🔥 Emit universal notification
      socket.emit("notification", {
        text: `${username} sent you a message!`,
        type: "message",
        sender_id,
        receiver_id,
        isRead: false
      });
      // Broadcast message to the receiver in the same conversation
      io.to(conversation_id).emit("message", { message, username });

      // ✅ If the receiver is online and in the chatroom, mark message as read
      const receiverSockets = await io.in(conversation_id).fetchSockets();
      const isReceiverOnline = receiverSockets.some(socket => socket.userId === receiver_id);

      if (isReceiverOnline) {
        await Message.findByIdAndUpdate(message._id, { status: "Read" });
        io.to(conversation_id).emit("messages_read", { messageId: message._id });
      }

    } catch (error) {
      logger.error("Error sending message:", error);
    }
  });

  // When a user disconnects, mark as offline
  socket.on("disconnect", async () => {
    logger.warn("Client disconnected:", socket.id);

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

            logger.warn(`🚫 User ${userId} is now OFFLINE`);
            io.emit("user_offline", { userId, lastSeen: new Date().toISOString() });
            socket.removeAllListeners(); // 🚀 Remove all listeners for this socket
          }
          break;
        }
      }
    } catch (error) {
      logger.error("❌ Error setting user offline:", error);
    }
  });
})

server.listen(port, () => {
  logger.info(`Server listening at ${port}`);
});
