// In backend/models/Item.js

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  listingType: { type: String, enum: ['Rent', 'Sell'], required: true }, // 'Borrow' can be removed if you want
  price: { type: Number, default: 0 },
  images: [{
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  }],
  location: { type: String, required: true },
  
  // --- THIS IS THE CRITICAL CHANGE ---
  // REMOVE the 'availability' field and ADD the 'status' field.
  // availability: { type: Boolean, default: true }, // <-- REMOVE THIS LINE
  // In the itemSchema, update the status enum
    status: {
        type: String,
        enum: ['available', 'rented_out', 'sold', 'unavailable'], // <-- Add 'unavailable'
        default: 'available'
    },

}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);