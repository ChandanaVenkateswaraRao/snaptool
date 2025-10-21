import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

const BecomeVendorPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ businessName: '', businessDescription: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/vendors', formData); 
    alert('Congratulations! You have successfully created your vendor profile.');
    navigate('/profile');  // Redirect to profile to see changes
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Become a Vendor</h2>
        <p>List your items professionally by creating a vendor profile.</p>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <div className="form-group">
          <label>Business Name</label>
          <input type="text" name="businessName" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Business Description (Optional)</label>
          <textarea name="businessDescription" rows="4" onChange={handleChange} />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Register as Vendor'}
        </button>
      </form>
    </div>
  );
};

export default BecomeVendorPage;