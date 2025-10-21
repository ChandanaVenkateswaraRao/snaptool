import React from 'react';
import { Link } from 'react-router-dom';
import './VendorsPage.css'; // New CSS file

const categories = [
  { name: 'Electronics', icon: '💻' }, { name: 'Tools', icon: '🛠️' },
  { name: 'Furniture', icon: '🛋️' }, { name: 'Vehicles', icon: '🚗' },
  { name: 'Kitchen', icon: '🍳' }, { name: 'Camera', icon: '📷' },
  { name: 'Books', icon: '📚' }, { name: 'Clothing', icon: '👕' }
];

const VendorsPage = () => {
    return (
        <div className="container">
            <div className="vendors-header">
                <h1>Browse by Category</h1>
                <p>Find what you need by exploring our popular categories.</p>
            </div>
            <div className="category-grid">
                {categories.map(cat => (
                    <Link to={`/category/${cat.name.toLowerCase()}`} key={cat.name} className="category-card">
                        <div className="category-icon">{cat.icon}</div>
                        <div className="category-name">{cat.name}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default VendorsPage;