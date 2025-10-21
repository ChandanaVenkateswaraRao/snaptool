const mongoose = require('mongoose');
const User = require('./User'); // Import User to update it

const reviewSchema = new mongoose.Schema({
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true,
  },
  // The user who is WRITING the review
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The user who is BEING REVIEWED
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating between 1 and 5.'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters.']
  },
}, { timestamps: true });

// --- THE "MAGIC" LOGIC ---
// This static method calculates the average rating for a user and saves it to their profile.
reviewSchema.statics.calculateAverageRating = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: { reviewee: userId } // Match all reviews for a specific user
    },
    {
      $group: {
        _id: '$reviewee',
        averageRating: { $avg: '$rating' } // Calculate the average of the 'rating' field
      }
    }
  ]);

  try {
    if (stats.length > 0) {
      // If there are reviews, update the user with the new average
      await User.findByIdAndUpdate(userId, {
        averageRating: stats[0].averageRating.toFixed(1) // Round to one decimal place
      });
    } else {
      // If there are no reviews (e.g., the last one was deleted), reset to 0
      await User.findByIdAndUpdate(userId, {
        averageRating: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// This middleware ensures the average is recalculated every time a new review is saved.
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.reviewee);
});

module.exports = mongoose.model('Review', reviewSchema);
