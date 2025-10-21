const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Link to the transaction this message belongs to
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true,
  },
  // Link to the user who sent the message
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The content of the message
  message: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true }); // `createdAt` will be our message timestamp

module.exports = mongoose.model('Message', messageSchema);