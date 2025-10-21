const express = require('express');
const { createVendorProfile, getVendorById } = require('../controllers/vendorController'); // <-- Updated names
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Route for a user to CREATE their vendor profile
router.post('/', protect, createVendorProfile);

// Route to get a vendor's public profile and listings
router.get('/:vendorId', getVendorById); // <-- Note: :vendorId now refers to the Vendor's _id

module.exports = router;