const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/authMiddleware'); // Middleware to protect routes
const {
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  getUserProfile,
  unfollowUser,
  getAllUsers,
  getPendingFollowRequests, // Import getPendingFollowRequests function
} = require('../controllers/requestController');

// ✅ Send a follow request
router.post('/follow/:id', protect, sendFollowRequest);

// ✅ Accept a follow request
router.put('/follow/accept/:requestId', protect, acceptFollowRequest);

// ✅ Reject a follow request
router.put('/follow/reject/:requestId', protect, rejectFollowRequest);

// ✅ Get user profile with followers and following
router.get('/profile/:id', protect, getUserProfile);

// ✅ Unfollow a user
router.delete('/unfollow/:id', protect, unfollowUser);

// ✅ Get all users
router.get('/users', protect, getAllUsers); // Get all users route

// ✅ Get all pending follow requests for the logged-in user
router.get('/follow/requests', protect, getPendingFollowRequests); // New route added to get pending follow requests

module.exports = router;
