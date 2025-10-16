import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import ItemCard from '../components/ItemCard.jsx';
import Loader from '../components/Loader';
import './RentPage.css'; // We will create this CSS file next

const RentPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
  });

  useEffect(() => {
    const fetchRentableItems = async () => {
      setLoading(true);
      try {
        // Construct the query parameters string
        const params = new URLSearchParams({
          listingType: 'Rent', // Always filter by 'Rent' for this page
        });
        if (filters.category) {
          params.append('category', filters.category);
        }
        if (filters.location) {
          params.append('location', filters.location);
        }
        
        // Make the API call with the filters
        const { data } = await api.get(`/items?${params.toString()}`);
        setItems(data);
      } catch (error) {
        console.error('Failed to fetch rentable items:', error);
      } finally {
        setLoading(false);
      }
    };

    // This timeout debounces the API call, so it doesn't fire on every keystroke
    const handler = setTimeout(() => {
      fetchRentableItems();
    }, 500); // Wait 500ms after the user stops typing

    return () => {
      clearTimeout(handler);
    };
  }, [filters]); // Re-run the effect whenever filters change

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div className="container">
      <div className="rent-page-header">
        <h1>Items Available for Rent</h1>
        <p>Find tools, electronics, and more from your local community.</p>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          name="category"
          className="filter-input"
          placeholder="Filter by category (e.g., Tools)"
          value={filters.category}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="location"
          className="filter-input"
          placeholder="Filter by location (e.g., City)"
          value={filters.location}
          onChange={handleFilterChange}
        />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="items-grid">
          {items.length > 0 ? (
            items.map(item => <ItemCard key={item._id} item={item} />)
          ) : (
            <p className="no-items-message">No rental items found matching your criteria.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RentPage;