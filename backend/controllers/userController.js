const User = require('../models/User');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const cloudinary = require('cloudinary').v2;

// @desc    Get current user's profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Get all items the user is sharing
    const items = await Item.find({ owner: req.user._id });

    // 2. Get all transactions where the user was the requester (they borrowed/rented/bought)
    const outgoingTransactions = await Transaction.find({ requester: req.user._id })
      .populate('item', 'title listingType') // Get item title and type
      .populate('owner', 'username'); // Get the owner's username

    // 3. Get all transactions where the user was the owner (they lent/rented out/sold)
    const incomingTransactions = await Transaction.find({ owner: req.user._id })
      .populate('item', 'title listingType') // Get item title and type
      .populate('requester', 'username'); // Get the requester's username

    // 4. Send all the data back to the frontend
    res.json({
      user,
      items,
      outgoingTransactions, // History of items you acquired
      incomingTransactions, // History of items you gave out
    });

  } catch (error) {
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