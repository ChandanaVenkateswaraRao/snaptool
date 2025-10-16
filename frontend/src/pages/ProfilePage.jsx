// In frontend/src/pages/ProfilePage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';
import Loader from '../components/Loader';
import ItemCard from '../components/ItemCard.jsx';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [outgoingTransactions, setOutgoingTransactions] = useState([]);
  const [incomingTransactions, setIncomingTransactions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('sharing'); // 'sharing' or 'history'

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/users/profile');
        setProfileData(data.user);
        setUserItems(data.items);
        setOutgoingTransactions(data.outgoingTransactions);
        setIncomingTransactions(data.incomingTransactions);
      } catch (err) {
        setError('Failed to fetch profile data.');
        if (err.response && err.response.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate, logout]);

  // Helper function to render a list of items for a specific category
  const renderItemsByCategory = (listingType, title) => {
    const filteredItems = userItems.filter(item => item.listingType === listingType);
    return (
      <div className="items-category">
        <h3>{title}</h3>
        {filteredItems.length > 0 ? (
          <div className="items-grid">
            {filteredItems.map(item => <ItemCard key={item._id} item={item} />)}
          </div>
        ) : (
          <p>You have no items listed {listingType === 'Sell' ? 'for sale' : `for ${listingType.toLowerCase()}`}.</p>
        )}
      </div>
    );
  };
  
      const handleStatusUpdate = async (transactionId, newStatus) => {
      if (!window.confirm(`Are you sure you want to ${newStatus} this request?`)) return;
      try {
        await api.put(`/transactions/${transactionId}/status`, { status: newStatus });
        // Refresh the profile data to show the change
        // This is a simple way; a more advanced solution would use state management (e.g., Redux)
        window.location.reload(); 
      } catch (err) {
        alert('Failed to update status.');
      }
    };
  if (loading) return <Loader />;
  if (error) return <p className="error-message">{error}</p>;
  if (!profileData) return null;

  return (
    <div className="container">
      <div className="profile-header">
        <img src={profileData.profilePicture?.url} alt={profileData.username} className="profile-picture" />
        <div className="profile-info">
          <h1>{profileData.username}</h1>
          <p>{profileData.email}</p>
          <p>{profileData.location || 'No location set'}</p>
          <p>Average Rating: {profileData.averageRating || 'Not rated yet'}</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'sharing' ? 'active' : ''}`} 
          onClick={() => setActiveTab('sharing')}
        >
          Items I'm Sharing
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} 
          onClick={() => setActiveTab('history')}
        >
          Transaction History
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'sharing' && (
          <div>
            {renderItemsByCategory('Sell', 'For Sale')}
            {renderItemsByCategory('Rent', 'For Rent')}
            {renderItemsByCategory('Borrow', 'For Borrow')}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="transaction-history">
            <div className="transaction-list">
              <h3>Items I've Acquired (Borrowed, Rented, or Bought)</h3>
              {outgoingTransactions.length > 0 ? (
                outgoingTransactions.map(tx => (
                  <div key={tx._id} className="transaction-item">
                    <span>You requested <strong>{tx.item.title}</strong> from <strong>{tx.owner.username}</strong></span>
                    <span className={`transaction-status status-${tx.status}`}>{tx.status}</span>
                  </div>
                ))
              ) : <p>You have not requested any items yet.</p>}
            </div>
            
            <div className="transaction-list">
            <h3>Items Others Acquired From Me (Incoming Requests)</h3>
            {incomingTransactions.length > 0 ? (
              incomingTransactions.map(tx => (
                <div key={tx._id} className="transaction-item">
                  <div className="tx-info">
                    <span><strong>{tx.requester.username}</strong> requested <strong>{tx.item.title}</strong></span>
                    <span className={`transaction-status status-${tx.status}`}>{tx.status}</span>
                  </div>
                  <div className="tx-actions">
                    {tx.status === 'pending' && (
                      <>
                        <button className="btn-approve" onClick={() => handleStatusUpdate(tx._id, 'approved')}>Approve</button>
                        <button className="btn-reject" onClick={() => handleStatusUpdate(tx._id, 'rejected')}>Reject</button>
                      </>
                    )}
                    {tx.status === 'approved' && (
                      <button className="btn-complete" onClick={() => handleStatusUpdate(tx._id, 'completed')}>Mark as Complete</button>
                    )}
                  </div>
                </div>
              ))
            ) : <p>No one has requested any of your items yet.</p>}
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;