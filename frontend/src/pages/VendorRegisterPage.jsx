import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

const indianCities = [ 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur' ];

const VendorRegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        city: indianCities[0],
        businessName: '',
    });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await api.post('/auth/vendor/register', formData);
            login(data);
            navigate('/vendor/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Vendor registration failed.');
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <h2>Create Your Vendor Account</h2>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <div className="form-group">
                    <label>Your Name</label>
                    <input type="text" name="username" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Business Name</label>
                    <input type="text" name="businessName" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Business Email</label>
                    <input type="email" name="email" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" name="password" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>City</label>
                    <select name="city" value={formData.city} onChange={handleChange}>
                        {indianCities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <button type="submit" className="btn">Register as Vendor</button>
            </form>
        </div>
    );
};

export default VendorRegisterPage;