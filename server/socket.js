const { Server } = require('socket.io');
const Message = require('./model/Message');
const User = require('./model/User');
const Notifications = require('./model/Notifications');
const Conversation = require('./model/Conversation');
const logger = require('./logger');

const onlineUsers = new Map();

function initializeSocket(server, corsOptions) {
  const io = new Server(server, {
    cors: corsOptions,
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on("user_connected", async ({ userId }) => {
      if (!userId) return;
      try {
        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);

        const user = await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: null,
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
      logger.info(`User ${userId} joined chat ${conversationId}`);

      try {
        await Message.updateMany(
          { conversation_id: conversationId, receiver_id: userId, status: "Sent" },
          { $set: { status: "Read" } }
        );
        logger.info(`✅ Marked messages as read for user ${userId} in chat ${conversationId}`);

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

    socket.on("user_offline", async ({ userId }) => {
      if (!userId) return;

      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });

      logger.info(`🚫 User ${userId} is now OFFLINE`);
      io.emit("user_offline", { userId, lastSeen: new Date().toISOString() });
    });

    socket.on("notification", async ({ text, type, sender_id, receiver_id, isRead = false }) => {
      try {
        const senderUser = await User.findById(sender_id);
        const displayName = senderUser?.firstName || "Someone";

        const notification = await Notifications.create({
          userId: receiver_id,
          senderId: sender_id,
          text: text || `${displayName} sent you a notification.`,
          type,
          isRead
        });

        io.to(receiver_id.toString()).emit("new_notification", notification);

      } catch (error) {
        logger.error("Error creating notification:", error);
      }
    });

    socket.on("send_message", async ({ conversation_id, sender_id, receiver_id, text, attachment, type }) => {
      try {
        const message = await Message.create({
          conversation_id,
          sender_id,
          receiver_id,
          text,
          attachment,
          type
        });

        const senderUser = await User.findById(sender_id);
        const username = senderUser?.firstName || "Unknown";

        await Conversation.findByIdAndUpdate(conversation_id, {
          last_message: text,
          last_sender_id: sender_id,
          updatedAt: new Date(),
        });

        socket.emit("notification", {
          text: `${username} sent you a message!`,
          type: "message",
          sender_id,
          receiver_id,
          isRead: false
        });

        io.to(conversation_id).emit("message", { message, username });

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

    socket.on("disconnect", async () => {
      logger.warn(`Client disconnected: ${socket.id}`);

      try {
        let userIdToRemove = null;

        for (const [userId, sockets] of onlineUsers.entries()) {
          if (sockets.has(socket.id)) {
            sockets.delete(socket.id);
            userIdToRemove = userId;

            if (sockets.size === 0) {
              onlineUsers.delete(userId);
              await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });

              logger.warn(`🚫 User ${userId} is now OFFLINE`);
              io.emit("user_offline", { userId, lastSeen: new Date().toISOString() });
              socket.removeAllListeners();
            }
            break;
          }
        }
      } catch (error) {
        logger.error("❌ Error setting user offline:", error);
      }
    });
  });

  return io;
}

module.exports = initializeSocket;
