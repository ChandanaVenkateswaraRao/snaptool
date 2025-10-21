// Create this new file at frontend/src/pages/EditProfilePage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';

const EditProfilePage = () => {
  const { user, login } = useContext(AuthContext); // Get login to update context
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    location: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Pre-fill the form with existing user data
    if (user) {
      api.get('/users/profile').then(res => {
        const { username, location, phoneNumber } = res.data.user;
        setFormData({ username, location: location || '', phoneNumber: phoneNumber || '' });
        setLoading(false);
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', formData);
      // Update the user context with the new details
      login({ ...user, username: data.username }); 
      navigate('/profile');
    } catch (err) {
      setError('Failed to update profile.');
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Edit Your Profile</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <div className="form-group">
          <label>Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Phone Number (Optional)</label>
          <input type="tel" name="phoneNumber" placeholder="e.g., 9876543210" value={formData.phoneNumber} onChange={handleChange} />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditProfilePage;