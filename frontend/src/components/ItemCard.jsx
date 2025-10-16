import React from 'react';
import { Link } from 'react-router-dom';
import './ItemCard.css';

const ItemCard = ({ item }) => {
  const displayPrice = () => {
    if (item.listingType === 'Borrow') {
      return 'Free to Borrow';
    }
    if (item.listingType === 'Rent') {
      return `$${item.price} / day`;
    }
    return `$${item.price}`;
  };

  return (
 <Link to={`/item/${item._id}`} className="item-card-link">
      <div className="item-card">

        {/* --- NEW: UNAVAILABLE OVERLAY --- */}
        {item.status !== 'available' && (
          <div className="item-card-overlay">
            <p className="overlay-text">
              {item.status === 'sold' ? 'Sold' : 'Rented Out'}
            </p>
          </div>
        )}

        <img 
          src={item.images[0]?.url || 'https://i.imgur.com/fallback-image.jpg'} 
          alt={item.title} 
          className="item-card-image" 
        />
        <div className="item-card-content">
          <span className="item-card-category">{item.category}</span>
          <h3 className="item-card-title">{item.title}</h3>
          <p className="item-card-location">{item.location}</p>
          <div className="item-card-footer">
            <p className="item-card-price">{displayPrice()}</p>
            <span className={`item-card-type type-${item.listingType?.toLowerCase()}`}>
              {item.listingType}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;