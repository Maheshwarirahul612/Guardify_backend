const Message = require('../models/Message');
const User = require('../models/userModel');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;  // Get sender from the decoded token

    // Log the message data to ensure it's correct
    console.log('Sending message:', { senderId, receiverId, content });

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      isRead: false,  // New message is not read initially
    });

    await message.save();

    // Update the last seen time of the sender
    await User.findByIdAndUpdate(senderId, { lastSeen: new Date() });

    res.status(201).json({ success: true, message: 'Message sent', data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all chat messages between two users
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;  // Get current user from the decoded token

    // Log the values to see what userId and currentUserId are being used in the query
    console.log('Fetching messages for:', currentUserId, userId);

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    // Log the fetched messages from the database
    console.log('Fetched messages:', messages);

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark a message as "seen"
exports.markMessageAsSeen = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Mark message as read
    message.isRead = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message marked as seen',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get the last seen time of a user
exports.getLastSeen = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: { lastSeen: user.lastSeen },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get unread message count for a user
exports.getUnreadMessageCount = async (req, res) => {
  const { userId } = req.params;

  try {
    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a message (only admin can delete)
exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;

    // Find and delete the message
    const message = await Message.findByIdAndDelete(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
