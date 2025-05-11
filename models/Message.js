const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 1,  // Ensure non-empty messages
      maxlength: 1000,  // Optionally limit max length
    },
    isRead: {  // Marks the message as read or unread
      type: Boolean,
      default: false,
    },
    seenAt: {  // Optional: Timestamp when message is marked as seen
      type: Date,
      default: null,
    },
  },
  { timestamps: true }  // This ensures createdAt and updatedAt fields are added automatically
);

// Indexes for performance improvement on common queries
messageSchema.index({ sender: 1, receiver: 1 });  // Index for fast querying of conversations
messageSchema.index({ receiver: 1, isRead: 1 });  // Index for unread messages

module.exports = mongoose.model('Message', messageSchema);
