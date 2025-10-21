const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  listingType: { type: String, enum: ['Rent', 'Sell'], required: true },
  price: { type: Number, default: 0 },
  images: [{
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  }],
  
  // --- THIS IS THE LINE TO REMOVE ---
  // location: { type: String, required: true },
  
  status: {
    type: String,
    enum: ['available', 'rented_out', 'sold', 'unavailable'],
    default: 'available'
  },

}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);