import React, { useState, useEffect,useContext  } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import api from '../api/axiosConfig';
import ItemCard from '../components/ItemCard.jsx';
import Loader from '../components/Loader';
import './SalePage.css';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// --- NEW: Dummy coordinates for our major cities. In a real app, this would come from an API or be stored with the item. ---
const cityCoordinates = {
  'Mumbai': [19.0760, 72.8777], 'Delhi': [28.7041, 77.1025], 'Bangalore': [12.9716, 77.5946],
  'Hyderabad': [17.3850, 78.4867], 'Ahmedabad': [23.0225, 72.5714], 'Chennai': [13.0827, 80.2707],
  'Kolkata': [22.5726, 88.3639], 'Surat': [21.1702, 72.8311], 'Pune': [18.5204, 73.8567], 'Jaipur': [26.9124, 75.7873]
};
const categories = [ 'Electronics', 'Tools', 'Furniture', 'Vehicles', 'Kitchen', 'Camera', 'Books', 'Clothing', 'Other' ];
const indianCities = [ 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur' ];

const SalePage = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', location: '' });

  useEffect(() => {
    if (!user || !user.city) {
        // If user isn't logged in, or has no city, show no items.
        setItems([]);
        setLoading(false);
        return;
    }

    const fetchSaleItems = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ listingType: 'Sell', city : user.city });
        if (filters.category) params.append('category', filters.category);
        if (filters.location) {
            // Note: 'location' filter here might be redundant now, but we can keep it
            // for more specific searches within a city if needed later.
            params.set('city', filters.location);
          }
        
        const { data } = await api.get(`/items?${params.toString()}`);
        setItems(data);
      } catch (error) {
        console.error('Failed to fetch sale items:', error);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => fetchSaleItems(), 500);
    return () => clearTimeout(handler);
  }, [filters,user]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!user) {
    return (
        <div className="container">
            <h1>Items for Sale</h1>
            <p className="no-items-message">Please <Link to="/login">log in</Link> to see items available in your city.</p>
        </div>
    );
  }

  return (
    <div className="container">
      <div className="sale-page-header">
        <h1>Items For Sale</h1>
        <p>Showing results for <strong>{user.city}</strong>.</p>
      </div>

      <div className="filter-bar">
        <select name="category" value={filters.category} onChange={handleFilterChange} className="filter-select">
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select name="location" value={filters.location} onChange={handleFilterChange} className="filter-select">
          <option value="">All Locations</option>
          {indianCities.map(city => <option key={city} value={city}>{city}</option>)}
        </select>
      </div>

      {/* --- NEW: Leaflet Map Section --- */}
      <div className="map-section">
        <h3>Item Locations</h3>
        <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={false} className="leaflet-map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {items.map(item => {
            const city = item.owner?.city; 
            const coords = city ? cityCoordinates[city] : null;

            return coords ? (
              <Marker position={coords} key={item._id}>
                <Popup>
                  <strong>{item.title}</strong><br />
                  Price: ${item.price}
                </Popup>
              </Marker>
            ) : null;
          })}
        </MapContainer>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="items-grid">
          {items.length > 0 ? (
            items.map(item => <ItemCard key={item._id} item={item} />)
          ) : (
            <p className="no-items-message">No items for sale matching your criteria.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SalePage;