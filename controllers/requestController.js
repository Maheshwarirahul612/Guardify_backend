const User = require('../models/userModel');
const FollowRequest = require('../models/followRequestModel');

// Send a follow request
exports.sendFollowRequest = async (req, res) => {
  try {
    const sender = req.user.id;
    const receiverId = req.params.id;

    if (sender === receiverId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: 'User not found' });

    const existingRequest = await FollowRequest.findOne({ sender, receiver: receiverId });
    if (existingRequest) {
      return res.status(400).json({ message: 'Follow request already sent' });
    }

    const followRequest = new FollowRequest({ sender, receiver: receiverId });
    await followRequest.save();

    res.status(200).json({ message: 'Follow request sent successfully' });
  } catch (error) {
    console.error('Follow request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept a follow request
exports.acceptFollowRequest = async (req, res) => {
    try {
      const { requestId } = req.params;
      
      // Find the follow request by its ID
      const followRequest = await FollowRequest.findById(requestId);
      if (!followRequest) {
        return res.status(404).json({ message: 'Request not found' });
      }
  
      if (followRequest.status !== 'pending') {
        return res.status(400).json({ message: 'Request already processed' });
      }
  
      // Update the follow request status to 'accepted'
      followRequest.status = 'accepted';
      await followRequest.save();
  
      // Add the sender to the receiver's followers and the receiver to the sender's following
      const sender = await User.findById(followRequest.sender);
      const receiver = await User.findById(followRequest.receiver);
  
      receiver.followers.push(sender._id);
      sender.following.push(receiver._id);
  
      await receiver.save();
      await sender.save();
  
      res.status(200).json({ message: 'Follow request accepted' });
    } catch (error) {
      console.error('Accept follow request error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  
// Reject a follow request
exports.rejectFollowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const followRequest = await FollowRequest.findById(requestId);
    if (!followRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (followRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    followRequest.status = 'rejected';
    await followRequest.save();

    res.status(200).json({ message: 'Follow request rejected' });
  } catch (error) {
    console.error('Reject follow request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile with followers and following
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId)
      .populate('followers following', 'username email profileImage')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage || null,
      followers: user.followers,
      following: user.following,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const sender = req.user.id;
    const receiverId = req.params.id;

    if (sender === receiverId) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: 'User not found' });

    receiver.followers.pull(sender);
    await receiver.save();

    const senderUser = await User.findById(sender);
    senderUser.following.pull(receiverId);
    await senderUser.save();

    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Fetch all users except the currently logged-in user
exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find({ _id: { $ne: req.user.id } });  // Exclude the logged-in user
      if (!users) {
        return res.status(404).json({ message: 'No users found' });
      }
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // Send a follow request (same as before)
  exports.sendFollowRequest = async (req, res) => {
    try {
      const sender = req.user.id; // The authenticated user (from JWT)
      const receiverId = req.params.id;
  
      if (sender === receiverId) {
        return res.status(400).json({ message: 'You cannot follow yourself' });
      }
  
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const existingRequest = await FollowRequest.findOne({ sender, receiver: receiverId });
      if (existingRequest) {
        return res.status(400).json({ message: 'Follow request already sent' });
      }
  
      const followRequest = new FollowRequest({ sender, receiver: receiverId });
      await followRequest.save();
  
      res.status(200).json({ message: 'Follow request sent successfully' });
    } catch (error) {
      console.error('Follow request error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };


  // Get all pending follow requests for the logged-in user
exports.getPendingFollowRequests = async (req, res) => {
    try {
      const userId = req.user.id;  // Get the logged-in user's ID from the request
  
      // Find all follow requests where the receiver is the logged-in user and status is 'pending'
      const pendingRequests = await FollowRequest.find({ receiver: userId, status: 'pending' })
        .populate('sender', 'username profileImage')  // Populate sender details
        .exec();
  
      // If no pending requests found
      if (pendingRequests.length === 0) {
        return res.status(404).json({ message: 'No pending follow requests' });
      }
  
      // Return the list of pending requests
      res.status(200).json(pendingRequests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };