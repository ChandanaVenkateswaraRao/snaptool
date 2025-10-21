import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';
import Loader from '../components/Loader';
import ItemCard from '../components/ItemCard.jsx';
import ChatModal from '../components/ChatModal.jsx';
import ReviewModal from '../components/ReviewModal.jsx';
import io from 'socket.io-client';
import './ProfilePage.css';

const ProfilePage = () => {
  // --- STATE MANAGEMENT ---
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Data State
  const [profileData, setProfileData] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [outgoingTransactions, setOutgoingTransactions] = useState([]);
  const [incomingTransactions, setIncomingTransactions] = useState([]);

  // Socket & Chat State
  const [socket, setSocket] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [currentChatRoom, setCurrentChatRoom] = useState('');
  const [currentTransactionId, setCurrentTransactionId] = useState('');

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('sharing');

  // --- EFFECTS ---
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
        if (err.response && err.response.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, navigate, logout]);

  useEffect(() => {
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  // --- HANDLER FUNCTIONS ---
  const openChat = (transaction) => {
    if (socket && socket.connected) {
      if (transaction && transaction.chatRoomId) {
        socket.emit('join_room', transaction.chatRoomId);
        setCurrentChatRoom(transaction.chatRoomId);
        setCurrentTransactionId(transaction._id);
        setShowChat(true);
      } else {
        alert("Error: Could not find a chat room for this transaction.");
      }
    } else {
      alert("Chat is not available yet, please wait a moment and try again.");
    }
  };

  const handleStatusUpdate = async (transactionId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this request?`)) return;
    try {
      await api.put(`/transactions/${transactionId}/status`, { status: newStatus });
      window.location.reload();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const openReviewModal = (transaction, reviewee) => {
    setReviewTarget({ transaction, reviewee });
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = (shouldRefresh) => {
    setShowReviewModal(false);
    setReviewTarget(null);
    if (shouldRefresh) {
      window.location.reload();
    }
  };

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

  // --- RENDER LOGIC ---
  if (loading) return <Loader />;
  if (error) return <p className="error-message">{error}</p>;
  if (!profileData) return null;

  return (
    <div className="container">
      {/* Modals */}
      {showChat && (
        <ChatModal
          socket={socket}
          user={profileData}
          chatRoomId={currentChatRoom}
          transactionId={currentTransactionId}
          onClose={() => setShowChat(false)}
        />
      )}
      {showReviewModal && (
        <ReviewModal 
          transaction={reviewTarget.transaction}
          reviewee={reviewTarget.reviewee}
          onClose={handleCloseReviewModal}
        />
      )}

      {/* Profile Header */}
      <div className="profile-header">
        <img src={profileData.profilePicture?.url} alt={profileData.username} className="profile-picture" />
        <div className="profile-info">
          <h1>{profileData.username}</h1>
          <p>{profileData.email}</p>

          {/* --- THIS IS THE CORRECTED LINE --- */}
          <p>
            {profileData.location && profileData.location.address 
              ? profileData.location.address 
              : 'No location set'
            }
          </p>
          
          <p>Average Rating: {(profileData.averageRating || 0).toFixed(1)}</p>
          <Link to="/profile/edit" className="edit-profile-btn">Edit Profile</Link>
          {!profileData.vendorProfile && (
            <Link to="/become-vendor" className="vendor-btn">Become a Vendor</Link>
          )}
        </div>
      </div>

      {/* Tabs & Tab Content... (The rest of the file is identical to what you posted) */}
      <div className="profile-tabs">
        <button className={`tab-btn ${activeTab === 'sharing' ? 'active' : ''}`} onClick={() => setActiveTab('sharing')}>
          Items I'm Sharing
        </button>
        <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          Transaction History
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'sharing' && (
          <div>
            {renderItemsByCategory('Sell', 'For Sale')}
            {renderItemsByCategory('Rent', 'For Rent')}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="transaction-history">
            <div className="transaction-list">
              <h3>Items I've Acquired</h3>
              {outgoingTransactions.length > 0 ? (
                outgoingTransactions.map(tx => (
                  <div key={tx._id} className="transaction-item">
                    <div className="tx-info">
                      <span>You requested <strong>{tx.item.title}</strong> from <strong>{tx.owner.username}</strong></span>
                      <span className={`transaction-status status-${tx.status}`}>{tx.status}</span>
                    </div>
                    <div className="tx-actions">
                     <button className="btn-chat" onClick={() => openChat(tx)}>Chat</button>
                     {tx.status === 'completed' && (
                       <button className="btn-review" onClick={() => openReviewModal(tx, tx.owner)}>Leave Review</button>
                     )}
                    </div>
                  </div>
                ))
              ) : <p>You have not requested any items yet.</p>}
            </div>

            <div className="transaction-list">
              <h3>Incoming Requests</h3>
              {incomingTransactions.length > 0 ? (
                incomingTransactions.map(tx => (
                  <div key={tx._id} className="transaction-item">
                    <div className="tx-info">
                      <span><strong>{tx.requester.username}</strong> requested <strong>{tx.item.title}</strong></span>
                      <span className={`transaction-status status-${tx.status}`}>{tx.status}</span>
                    </div>
                    <div className="tx-actions">
                      <button className="btn-chat" onClick={() => openChat(tx)}>Chat</button>
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