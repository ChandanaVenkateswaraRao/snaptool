const User = require('../models/User');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const cloudinary = require('cloudinary').v2;

// @desc    Get current user's profile
// @route   GET /api/users/profile
// @access  Private
// In backend/controllers/userController.js

exports.getUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, user not found.' });
    }

    const user = await User.findById(req.user._id).select('-password').populate('vendorProfile');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found in database.' });
    }

    const items = await Item.find({ owner: user._id });

    // --- STANDARDIZING QUERIES FOR THE FIX ---

    // Outgoing Transactions (where the user is the requester)
    const outgoingTransactions = await Transaction.find({ requester: user._id })
      .select('_id item owner status chatRoomId') // Ensure fields are selected
      .populate('item', 'title listingType')
      .populate('owner', 'username');

    // Incoming Transactions (where the user is the owner)
    const incomingTransactions = await Transaction.find({ owner: user._id })
      .select('_id item requester status chatRoomId') // Ensure fields are selected
      .populate('item', 'title listingType')
      .populate('requester', 'username');
      
    console.log('[GET PROFILE] Incoming transactions being sent to frontend:', incomingTransactions);
    console.log('[GET PROFILE] Outgoing transactions being sent to frontend:', outgoingTransactions);

    res.json({
      user,
      items,
      outgoingTransactions,
      incomingTransactions,
    });

  } catch (error) {
    console.error("ERROR in getUserProfile:", error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = req.body.username || user.username;
    user.location = req.body.location || user.location;

    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    // Handle profile picture update
    if (req.file) {
      // If user already has a profile picture, delete the old one from Cloudinary
      if (user.profilePicture && user.profilePicture.public_id) {
        await cloudinary.uploader.destroy(user.profilePicture.public_id);
      }
      
      user.profilePicture = {
        public_id: req.file.filename,
        url: req.file.path,
      };
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      location: updatedUser.location,
       phoneNumber: updatedUser.phoneNumber,
      profilePicture: updatedUser.profilePicture,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get public profile of a user by ID
// @route   GET /api/users/:id
// @access  Public
exports.getPublicUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email'); // Exclude sensitive info
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const items = await Item.find({ owner: user._id });
    res.json({ user, items });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};