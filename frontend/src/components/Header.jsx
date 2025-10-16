import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">ShareHub</Link>
        <nav className="nav-links">
        <Link to="/sale" className="nav-link">For sale</Link>
        <Link to="/rent" className="nav-link">For Rent</Link>
          {user ? (
            <>
              <Link to="/profile" className="nav-link">My Profile</Link>
              <Link to="/create-listing" className="add-item-btn">+ Add Item</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
export default Header;