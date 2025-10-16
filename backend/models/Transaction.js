const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
  },
  // Optional: For rentals
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  // The agreed upon price at the time of transaction
  agreedPrice: {
    type: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);