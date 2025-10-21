const User = require('../models/User');
const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.registerUser = async (req, res) => {
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
      city: user.city,
      token: generateToken(user._id),
    });
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

    const user = new User({ username, email, password, city });
    await user.save();

    const vendor = new Vendor({ user: user._id, businessName });
    await vendor.save();

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

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        city: user.city, // Ensures city is sent on login
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
          city: user.city, // Ensures city is sent on vendor login
          token: generateToken(user._id),
          isVendor: true
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