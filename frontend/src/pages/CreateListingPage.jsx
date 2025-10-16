import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import './CreateListingPage.css';

// --- NEW: Define categories and cities as constants for easy management ---
const categories = [
  'Electronics', 'Tools', 'Furniture', 'Vehicles', 'Kitchen', 'Camera', 'Books', 'Clothing', 'Other'
];

const indianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'
];

const CreateListingPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: categories[0], // Default to the first category
    listingType: 'Rent', // Default to 'Rent' since 'Borrow' is removed
    price: '',
    location: indianCities[0], // Default to the first city
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files.length > 5) {
      alert("You can only upload a maximum of 5 images.");
      e.target.value = null;
    } else {
      setImages(e.target.files);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (rest of the submit logic is the same)
    setError('');
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    for (let i = 0; i < images.length; i++) {
      data.append('images', images[i]);
    }
    try {
      await api.post('/items', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Create a New Listing</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        
        <div className="form-group">
          <label>Title</label>
          <input type="text" name="title" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" onChange={handleChange} rows="4" required />
        </div>

        {/* --- UPDATED: Category Dropdown --- */}
        <div className="form-group">
          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange}>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* --- UPDATED: Location Dropdown --- */}
        <div className="form-group">
          <label>Location</label>
          <select name="location" value={formData.location} onChange={handleChange}>
            {indianCities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
        
        {/* --- UPDATED: Listing Type (Borrow removed) --- */}
        <div className="form-group">
          <label>Listing Type</label>
          <select name="listingType" value={formData.listingType} onChange={handleChange}>
              <option value="Rent">Rent</option>
              <option value="Sell">Sell</option>
          </select>
        </div>
        
        <div className="form-group price-input">
            <label>Price {formData.listingType === 'Rent' ? '($ per day)' : '($)'}</label>
            <input type="number" name="price" min="0" step="0.01" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Images (up to 5)</label>
          <input type="file" name="images" onChange={handleImageChange} multiple accept="image/*" required />
        </div>
        
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
};

export default CreateListingPage;