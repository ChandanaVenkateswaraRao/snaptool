const Review = require('../models/Review');
const Transaction = require('../models/Transaction');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { transactionId, rating, comment } = req.body;
    const reviewerId = req.user._id;

    // 1. Find the transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    // 2. Security Check: Ensure transaction is 'completed'
    if (transaction.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed transactions.' });
    }

    // 3. Security Check: Ensure the reviewer is part of the transaction
    if (transaction.owner.toString() !== reviewerId.toString() && transaction.requester.toString() !== reviewerId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to review this transaction.' });
    }

    // 4. Security Check: Prevent a user from reviewing twice for the same transaction
    const existingReview = await Review.findOne({ transactionId, reviewer: reviewerId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already submitted a review for this transaction.' });
    }

    // 5. Determine who is being reviewed (the "other" person in the transaction)
    const revieweeId = transaction.owner.toString() === reviewerId.toString() ? transaction.requester : transaction.owner;

    // 6. Create and save the new review
    const review = new Review({
      transactionId,
      rating,
      comment,
      reviewer: reviewerId,
      reviewee: revieweeId,
    });
    await review.save();

    res.status(201).json({ message: 'Thank you for your review!', review });

  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};