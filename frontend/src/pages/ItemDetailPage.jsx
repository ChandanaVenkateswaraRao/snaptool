import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';
import './ItemDetailPage.css';

const ItemDetailPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        console.log(`[FRONTEND] Requesting item with ID: ${id}`);
        const response = await api.get(`/items/${id}`);
        
        console.log("[FRONTEND] Full API Response received:", response);
        const data = response.data;
        console.log("[FRONTEND] Data from response:", data);

        // Bulletproof check for valid data
        if (data && typeof data === 'object' && data._id) {
          setItem(data);
          if (data.images && data.images.length > 0) {
            setMainImage(data.images[0].url);
          }
        } else {
          setError('The requested item is missing or invalid.');
          console.error("[FRONTEND] API returned success, but data is invalid:", data);
        }
      } catch (err) {
        console.error("[FRONTEND] An error occurred during fetch:", err);
        setError('Could not find the requested item. It may have been deleted.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleStatusToggle = async () => {
        try {
            const { data } = await api.put(`/items/${id}/status`);
            // Update the item state locally to reflect the change instantly
            setItem(prev => ({ ...prev, status: data.status }));
        } catch (error) {
            alert("Could not update status.");
        }
    };

  // --- HANDLER FUNCTIONS ARE NOW CORRECTLY PLACED INSIDE THE COMPONENT ---
  const handleRequest = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post('/transactions', { itemId: id });
      alert(res.data.message);
      // A more robust way to handle the button state
      const requestButton = document.querySelector('.btn-request');
      if (requestButton) requestButton.disabled = true;
    } catch (err) {
      alert(err.response?.data?.message || 'Could not send request.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/items/${id}`);
        navigate('/');
      } catch (err) {
        alert('Failed to delete the item.');
      }
    }
  };

  // --- RENDER LOGIC ---
  if (loading) {
    return <Loader />;
  }
  if (error) {
    return <p className="error-message">{error}</p>;
  }
  if (!item) {
    return <p className="error-message">No item data to display.</p>;
  }

  const isOwner = user && item.owner && user._id === item.owner._id;

  return (
    <div className="container">
      <div className="item-detail-layout">
        {/* Image Panel */}
        <div className="item-images-panel">
          <div className="main-image-container">
            <img src={mainImage || (item.images && item.images[0]?.url)} alt={item.title} className="main-image" />
          </div>
          <div className="thumbnail-container">
            {item.images && item.images.map((img, index) => (
              <img
                key={index}
                src={img.url}
                alt={`Thumbnail ${index + 1}`}
                className={`thumbnail ${img.url === mainImage ? 'active' : ''}`}
                onClick={() => setMainImage(img.url)}
              />
            ))}
          </div>
        </div>
        <div className="item-owner-info">
          <h3>Contact Owner</h3>
          <p>
            <strong>Owner:</strong> 
            {/* --- THIS IS THE NEW LOGIC --- */}
            {/* Check if the populated owner has a vendorProfile attached */}
            {item.owner && item.owner.vendorProfile ? (
              // If yes, link to the vendor page using the vendorProfile's _id
              <Link to={`/vendor/${item.owner.vendorProfile._id}`}>
                {item.owner.vendorProfile.businessName}
              </Link>
            ) : (
              // If no, just show the username
              <span>{item.owner ? item.owner.username : 'Unknown'}</span>
            )}
          </p>
          {/* The rest of the contact info now needs to access the nested user object from the vendor */}
          <p><strong>Email:</strong> <a href={`mailto:${item.owner?.email}`}>{item.owner?.email}</a></p>
          {item.owner?.phoneNumber && (
            <p><strong>Phone:</strong> <a href={`tel:${item.owner.phoneNumber}`}>{item.owner.phoneNumber}</a></p>
          )}
        </div>
        {/* Info Panel */}
        <div className="item-info-panel">
          <span className="item-detail-category">{item.category}</span>
          <h1>{item.title}</h1>
          <p className="item-detail-price">
            {item.listingType === 'Sell' ? `$${item.price}` : `$${item.price} / day`}
          </p>
          <div className="item-owner-info">
            <p><strong>Owner:</strong> {item.owner ? item.owner.username : 'Unknown'}</p>
            <p><strong>Location:</strong> {item.location}</p>
          </div>
          <h3>Description</h3>
          <p className="item-detail-description">{item.description}</p>
          
          <div className="item-actions">
            {user && isOwner ? (
              <div className="owner-actions">
                <Link to={`/item/edit/${item._id}`} className="btn btn-edit">Edit Listing</Link>
                <button className="btn-delete" onClick={handleDelete}>Delete Listing</button>
                {/* --- NEW BUTTON --- */}
                <button className="btn" onClick={handleStatusToggle}>
                    {item.status === 'available' ? 'Mark as Unavailable' : 'Mark as Available'}
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-request" 
                onClick={handleRequest}
                disabled={item.status !== 'available'} 
              >
                {item.status === 'available' ? `Request to ${item.listingType}` : `Item is ${item.status}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;