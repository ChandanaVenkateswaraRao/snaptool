const User = require('../models/User');
const Vendor = require('../models/Vendor'); // <-- Import the new Vendor model
const Item = require('../models/Item');

// @desc    Create a new Vendor profile for the logged-in user
// @route   POST /api/vendors
// @access  Private
exports.createVendorProfile = async (req, res) => {
  try {
    const { businessName, businessDescription } = req.body;
    const userId = req.user._id;

    // SECURITY CHECK: Does this user already have a vendor profile?
    const existingVendor = await Vendor.findOne({ user: userId });
    if (existingVendor) {
      return res.status(400).json({ message: 'You already have a vendor profile.' });
    }

    // 1. Create the new Vendor document
    const vendor = new Vendor({
      user: userId,
      businessName,
      businessDescription,
    });
    const savedVendor = await vendor.save();

    // 2. Update the User document to link to this new Vendor profile
    await User.findByIdAndUpdate(userId, { vendorProfile: savedVendor._id });

    res.status(201).json({ message: 'Congratulations! Your vendor profile is created.', vendor: savedVendor });

  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get a public vendor profile by their VENDOR ID
// @route   GET /api/vendors/:vendorId
// @access  Public
exports.getVendorById = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.vendorId)
            .populate('user', 'email phoneNumber location averageRating profilePicture'); // Get associated user details

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found.' });
        }

        // Find all available items listed by this vendor's associated user account
        const items = await Item.find({ owner: vendor.user._id, status: 'available' });

        res.json({ vendor, items });

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};