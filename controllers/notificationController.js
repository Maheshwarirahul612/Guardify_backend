// controllers/notificationController.js
const Notification = require('../models/Notification');

// Get all notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', error: err });
  }
};

// Create a new notification
const createNotification = async (req, res) => {
  const { message, type, timestamp, read } = req.body;
  try {
    const newNotification = new Notification({ message, type, timestamp, read });
    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (err) {
    res.status(500).json({ message: 'Error creating notification', error: err });
  }
};

// Update a notification (e.g., mark as read)
const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Error updating notification', error: err });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Error deleting notification', error: err });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification
};
