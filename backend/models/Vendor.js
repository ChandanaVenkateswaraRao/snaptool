const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  // This creates a direct, required, and unique link to a User document.
  // This enforces a one-to-one relationship.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, 
  },
  businessName: {
    type: String,
    required: true,
    trim: true,
  },
  businessDescription: {
    type: String,
    trim: true,
  },
  businessLogo: {
    public_id: { type: String },
    url: { type: String },
  },
  // You can add more vendor-specific fields here later, like address, tax ID, etc.
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);