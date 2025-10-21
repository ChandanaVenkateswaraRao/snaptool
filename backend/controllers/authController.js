const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// --- UPDATED ---
exports.registerUser = async (req, res) => {
  // --- UPDATED: Receive 'city' instead of coordinates ---
  const { username, email, password, city } = req.body;
  try {
    if (!city) {
      return res.status(400).json({ message: 'City is a required field.' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await User.create({ username, email, password, city });
    
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      city: user.city, // Also return city
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- NEW ---
exports.loginVendor = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate('vendorProfile');
    if (user && (await user.matchPassword(password))) {
      if (user.vendorProfile) {
        res.json({
          _id: user._id,
          username: user.username,
          email: user.email,
          token: generateToken(user._id),
          isVendor: true // Send flag to frontend
        });
      } else {
        return res.status(403).json({ message: 'This account is not registered as a vendor.' });
      }
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.registerVendor = async (req, res) => {
  const { username, email, password, city, businessName } = req.body;
  try {
    if (!city || !businessName) {
      return res.status(400).json({ message: 'City and Business Name are required.' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // 1. Create the User document
    const user = new User({ username, email, password, city });
    await user.save();

    // 2. Create the linked Vendor document
    const vendor = new Vendor({ user: user._id, businessName });
    await vendor.save();

    // 3. Update the user document with the link to the vendor profile
    user.vendorProfile = vendor._id;
    await user.save();

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      city: user.city,
      isVendor: true,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};