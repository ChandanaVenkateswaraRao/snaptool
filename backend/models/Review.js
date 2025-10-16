const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // The user who is writing the review
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The user who is being reviewed
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

// Optional: Add a static method to calculate average rating after a review is saved
reviewSchema.statics.calculateAverageRating = async function(userId) {
  const obj = await this.aggregate([
    {
      $match: { reviewee: userId }
    },
    {
      $group: {
        _id: '$reviewee',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);
  
  try {
    await this.model('User').findByIdAndUpdate(userId, {
      averageRating: obj[0] ? obj[0].averageRating.toFixed(1) : 0
    });
  } catch (err) {
    console.error(err);
  }
};

reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.reviewee);
});

module.exports = mongoose.model('Review', reviewSchema);