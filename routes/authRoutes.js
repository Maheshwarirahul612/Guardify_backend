const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  changePassword,
  logout,
  getAllUsers,
  adminDeleteUser,
  adminUpdateUserRole,
} = require('../controllers/authController');
const { protect, admin } = require('../Middleware/authMiddleware');
const User = require('../models/userModel'); // Import the User model
const upload = require('../Middleware/uploadMiddleware'); // Import upload middleware
const userController = require('../controllers/authController'); // Import user controller

// ============================== Auth Routes ==============================
// Route for user registration
router.post('/register', register);

// Route for user login
router.post('/login', login);

// Route for user logout (Requires user authentication)
router.post('/logout', protect, logout);

// =========================== User Profile Routes =========================
// Route to get user profile by ID (Requires authentication)
router.get('/profile', protect, getUserProfile);

// Route to update user profile (Requires authentication)
router.put('/profile', protect, updateUserProfile);

// Route to delete user profile (Requires authentication)
router.delete('/profile', protect, deleteUser);

// Route to change user password (Requires authentication)
router.put('/change-password', protect, changePassword);

// ============================== Admin Routes ==============================
// Route to get all users (Requires authentication and admin role)
router.get('/admin/users', protect, admin, getAllUsers);

// Route to delete a user by ID (Requires authentication and admin role)
router.delete('/admin/user/:id', protect, admin, adminDeleteUser);

// Route to update a user's role by ID (Requires authentication and admin role)
router.put('/admin/user/:id/role', protect, admin, adminUpdateUserRole);

// ========================== User Info Route (by ID) ======================
// Match `/api/user/info/:id`
router.get('/info/:id', protect, async (req, res) => {
  try {
    // Fetch user info by ID, excluding the password
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data, including username, email, and profileImage
    res.status(200).json({
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
    });
  } catch (err) {
    console.error("Error fetching user info:", err); // Log the detailed error
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to get all users (Requires authentication)
router.get('/users', protect, async (req, res) => {
  try {
    // Fetch all users, excluding their passwords
    const users = await User.find().select('-password');

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    // Return the list of users with their usernames, emails, and profileImages
    res.status(200).json(
      users.map(user => ({
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      }))
    );
  } catch (err) {
    console.error("Error fetching users:", err); // Log the detailed error
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================== Avatar Upload Route =====================
router.post('/upload-avatar', protect, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
