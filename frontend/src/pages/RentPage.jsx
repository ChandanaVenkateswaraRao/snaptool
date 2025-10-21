import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import ItemCard from '../components/ItemCard.jsx';
import Loader from '../components/Loader';
import './RentPage.css'; 

// Define categories and cities for the filter dropdowns
const categories = [ 'Electronics', 'Tools', 'Furniture', 'Vehicles', 'Kitchen', 'Camera', 'Books', 'Clothing', 'Other' ];
const indianCities = [ 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur' ];

const RentPage = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
  });

  useEffect(() => {
    if (!user || !user.city) {
      setItems([]);
      setLoading(false);
      return;
    }
    
    // The stray 's' has been removed from here.

    const fetchRentableItems = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          listingType: 'Rent',
          city: user.city
        });

        if (filters.category) {
          params.append('category', filters.category);
        }
        // If the user selects a different city in the filter, it overrides their default city
        if (filters.location) {
          params.set('city', filters.location);
        }
        
        const { data } = await api.get(`/items?${params.toString()}`);
        setItems(data);
      } catch (error) {
        console.error('Failed to fetch rentable items:', error);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      fetchRentableItems();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filters, user]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  if (!user) {
    return (
        <div className="container">
            <h1>Items for Rent</h1>
            <p className="no-items-message">Please <Link to="/login">log in</Link> to see items available in your city.</p>
        </div>
    );
  }

  return (
    <div className="container">
      <div className="rent-page-header">
        <h1>Items Available for Rent</h1>
        <p>Showing results for <strong>{filters.location || user.city}</strong>.</p>
      </div>

      {/* --- UPDATED FILTER BAR to be consistent with SalePage --- */}
      <div className="filter-bar">
        <select name="category" value={filters.category} onChange={handleFilterChange} className="filter-select">
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select name="location" value={filters.location} onChange={handleFilterChange} className="filter-select">
          <option value="">Default City</option>
          {indianCities.map(city => <option key={city} value={city}>{city}</option>)}
        </select>
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