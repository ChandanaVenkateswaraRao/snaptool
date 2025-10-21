import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import Loader from '../components/Loader';
import ItemCard from '../components/ItemCard.jsx';
// Add a new CSS file for this page if desired: import './VendorProfilePage.css';

const VendorProfilePage = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const { data } = await api.get(`/vendors/${id}`);
        setVendor(data.vendor);
        setItems(data.items);
      } catch (error) {
        console.error("Failed to fetch vendor data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorData();
  }, [id]);

  if (loading) return <Loader />;
  if (!vendor) return <p className="error-message">Vendor not found.</p>;

  return (
    <div className="container">
      <div className="profile-header">
        <img src={vendor.user.profilePicture?.url} alt={vendor.businessName} className="profile-picture" />
        <div className="profile-info">
          <h1>{vendor.businessName}</h1>
          <p>{vendor.businessDescription}</p>
          <p>Location: {vendor.user.location}</p>
          <p>Average Rating: {vendor.user.averageRating || 'Not rated'}</p>
        </div>
      </div>
      <div className="profile-content">
        <h2>Items from {vendor.businessName}</h2>
        <div className="items-grid">
          {items.map(item => <ItemCard key={item._id} item={item} />)}
        </div>
      </div>
    </div>
  );
};

export default VendorProfilePage;