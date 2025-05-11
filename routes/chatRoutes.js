const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect, admin } = require('../Middleware/authMiddleware');

// Protect these routes and ensure the user is logged in
router.post('/send', protect, chatController.sendMessage);  // Send a message
router.get('/messages/:userId', protect, chatController.getMessages);  // Get messages
router.put('/message-seen/:messageId', protect, chatController.markMessageAsSeen);  // Mark message as seen
router.get('/last-seen/:userId', protect, chatController.getLastSeen);  // Get last seen time
router.get('/unread-count/:userId', protect, chatController.getUnreadMessageCount);  // Get unread message count

// Route protected by the 'admin' middleware, only admin users can access it
router.delete('/admin/delete-message/:messageId', protect, admin, chatController.deleteMessage);

module.exports = router;
