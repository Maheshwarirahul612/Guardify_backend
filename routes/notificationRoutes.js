// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Get all notifications
router.get('/', notificationController.getNotifications);

// Create a new notification
router.post('/', notificationController.createNotification);

// Update a notification by ID
router.put('/:id', notificationController.updateNotification);

// Delete a notification by ID
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
