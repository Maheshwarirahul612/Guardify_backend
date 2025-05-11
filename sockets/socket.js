const Message = require('../models/Message');  // Import Message model

let onlineUsers = new Map();

function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // User comes online
    socket.on('user-online', (userId) => {
      if (!userId) {
        console.log("Invalid user ID received:", userId);
        return;
      }
      console.log("User is online:", userId);  // Debugging line to check userId
      onlineUsers.set(userId, socket.id);
      io.emit('update-online-users', Array.from(onlineUsers.keys()));  // Notify all clients about online users
    });

    // Typing indicator
    socket.on('typing', ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', { senderId });
      }
    });

    // Send message
    socket.on('send-message', async ({ senderId, receiverId, content }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        const newMessage = await Message.create({
          sender: senderId,
          receiver: receiverId,
          content: content,
          isRead: false,
          seenAt: null,  // Initially, the message isn't seen
        });
        io.to(receiverSocketId).emit('receive-message', {
          senderId,
          receiverId,
          content,
          messageId: newMessage._id,  // Sending the message ID
        });
      }
    });

    // Mark message as seen
    socket.on('message-seen', async ({ messageId, receiverId }) => {
      try {
        const message = await Message.findByIdAndUpdate(messageId, {
          isRead: true,
          seenAt: new Date(),  // Optional: You can store the time the message was seen
        }, { new: true });

        // Notify the sender that the message has been seen
        const senderSocketId = onlineUsers.get(receiverId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('message-seen-ack', { messageId, receiverId });
        }

        // Count unread messages for the receiver
        const unreadCount = await Message.countDocuments({ receiver: receiverId, isRead: false });
        io.to(receiverSocketId).emit('unread-message-count', { receiverId, unreadCount });

      } catch (error) {
        console.error('Error marking message as seen:', error);
      }
    });

    // Last seen update: When a user is online, update their last seen time
    socket.on('last-seen', (userId) => {
      const receiverSocketId = onlineUsers.get(userId);
      if (receiverSocketId) {
        // Emit the last seen timestamp
        io.to(receiverSocketId).emit('last-seen', { lastSeenAt: new Date() });
      }
    });

    // User disconnects
    socket.on('disconnect', () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log("User disconnected:", userId);  // Debugging line
          break;
        }
      }
      io.emit('update-online-users', Array.from(onlineUsers.keys()));  // Notify all clients about updated online users
    });
  });
}

module.exports = socketHandler;
