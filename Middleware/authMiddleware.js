const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware to protect routes by verifying JWT token
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Format: "Bearer <token>")
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];  // Get the token part after "Bearer"
  }

  // If no token is provided
  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    // Verify token and decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user associated with the decoded token (skip password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach user to the request object to make it available for route handlers
    next();
  } catch (error) {
    // Log the error to help with debugging
    console.error('JWT Verification Error:', error);

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    
    // General error for invalid or malformed tokens
    return res.status(401).json({ message: 'Invalid or malformed token' });
  }
};

// Middleware to allow only admin users
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();  // If the user is an admin, proceed to the next middleware
  } else {
    return res.status(403).json({ message: 'Admin access required' });
  }
};

// Middleware to allow access for specific roles
exports.role = (allowedRoles) => (req, res, next) => {
  if (req.user && allowedRoles.includes(req.user.role)) {
    return next();  // If the user's role is allowed, proceed to the next middleware
  } else {
    return res.status(403).json({ message: 'Access denied, insufficient role' });
  }
};
