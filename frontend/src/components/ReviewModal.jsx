import React, { useState } from 'react';
import api from '../api/axiosConfig';
import './ReviewModal.css';
import { FaStar } from 'react-icons/fa';

const ReviewModal = ({ transaction, reviewee, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // The path is now correctly '/reviews'
      await api.post('/reviews', {
        transactionId: transaction._id,
        rating,
        comment,
      });
      alert('Review submitted successfully!');
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Leave a Review for {reviewee.username}</h2>
        <p>For the item: <strong>{transaction.item.title}</strong></p>
        <form onSubmit={handleSubmit}>
          <div className="star-rating">
            {[...Array(5)].map((star, index) => {
              const ratingValue = index + 1;
              return (
                <label key={index}>
                  <input type="radio" name="rating" value={ratingValue} onClick={() => setRating(ratingValue)} />
                  <FaStar 
                    className="star" 
                    color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"} 
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                  />
                </label>
              );
            })}
          </div>
          <textarea
            rows="5"
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;