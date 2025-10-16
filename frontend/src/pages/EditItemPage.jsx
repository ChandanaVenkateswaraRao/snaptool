// Create this new file at frontend/src/pages/EditItemPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';

const EditItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    listingType: 'Borrow',
    price: '',
    location: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await api.get(`/items/${id}`);
        // Ensure the current user is the owner
        if (user && data.owner._id !== user._id) {
          setError('You are not authorized to edit this item.');
          setTimeout(() => navigate('/'), 3000);
        } else {
          setFormData({
            title: data.title,
            description: data.description,
            category: data.category,
            listingType: data.listingType,
            price: data.price,
            location: data.location,
          });
        }
      } catch (err) {
        setError('Failed to fetch item data.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/items/${id}`, formData);
      navigate(`/item/${id}`); // Navigate back to the item detail page
    } catch (err) {
      setError('Failed to update the item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="form-container">
      {error ? (
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2>Edit Your Listing</h2>
          <div className="form-group">
            <label>Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Listing Type</label>
            <select name="listingType" value={formData.listingType} onChange={handleChange}>
              <option value="Borrow">Borrow (Free)</option>
              <option value="Rent">Rent</option>
              <option value="Sell">Sell</option>
            </select>
          </div>
          {formData.listingType !== 'Borrow' && (
            <div className="form-group price-input">
              <label>Price {formData.listingType === 'Rent' ? '($ per day)' : '($)'}</label>
              <input type="number" name="price" value={formData.price} min="0" step="0.01" onChange={handleChange} required />
            </div>
          )}
          {/* Note: Image editing is more complex and handled separately. This form focuses on text details. */}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
};

export default EditItemPage;