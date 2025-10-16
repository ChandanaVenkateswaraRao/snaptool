// Replace all code in frontend/src/pages/HomePage.jsx with this

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import ItemCard from '../components/ItemCard.jsx';
import Loader from '../components/Loader';
import './HomePage.css'; // We will update this file next

const HomePage = () => {
  const [saleItems, setSaleItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaleItems = async () => {
      setLoading(true);
      try {
        // Use our smart API to fetch only items listed for 'Sell'
        const { data } = await api.get('/items?listingType=Sell');
        setSaleItems(data);
      } catch (error) {
        console.error('Failed to fetch sale items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSaleItems();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <h1>Welcome to ShareHub</h1>
          <p className="hero-tagline">Your community marketplace to borrow, rent, and sell items. Join the circular economy and save money.</p>
          <Link to="/sale" className="hero-btn">Start Exploring</Link>
        </div>
      </div>

      {/* "For Sale" Section */}
      {/* <div className="container">
        <h2 className="section-title">Freshly Listed for Sale</h2>
        {loading ? (
          <Loader />
        ) : (
          <div className="items-grid">
            {saleItems.length > 0 ? (
              // Display only the first 4 for a clean look, or remove .slice(0, 4) to show all
              saleItems.slice(0, 4).map(item => <ItemCard key={item._id} item={item} />)
            ) : (
              <p>No items are currently listed for sale.</p>
            )}
          </div>
        )}
      </div> */}
    </div>
  );
};

export default HomePage;