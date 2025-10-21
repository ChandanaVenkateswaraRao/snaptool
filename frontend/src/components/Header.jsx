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

        {/* --- MAIN NAVIGATION (Always Visible) --- */}
        <nav className="nav-links-main">
          {/* <Link to="/sale" className="nav-link">For Sale</Link> */}
          {/* <Link to="/rent" className="nav-link">For Rent</Link> */}
          {/* <Link to="/vendors" className="nav-link">Vendors</Link>  */}
        </nav>

        {/* --- AUTHENTICATION NAVIGATION (Changes based on login state) --- */}
        <nav className="nav-links-auth">
          {user ? (
            // --- LOGGED-IN VIEW ---
           
            <>
              {/* Conditionally render the Vendor Dashboard link */}
              {user.isVendor && (
                <Link to="/vendor/dashboard" className="nav-link special">Vendor Dashboard</Link>
              )}

              <Link to="/vendors" className="nav-link">Vendors</Link> 
              <Link to="/rent" className="nav-link">For Rent</Link>
              <Link to="/sale" className="nav-link">For Sale</Link>
              <Link to="/profile" className="nav-link">My Profile</Link>
              <Link to="/create-listing" className="add-item-btn">+ Add Item</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            // --- LOGGED-OUT VIEW ---
            <>
              <Link to="/login" className="nav-link">User Login</Link>
              <Link to="/register" className="nav-link special">Sign Up</Link>
              <Link to="/vendor/login" className="nav-link">Vendor Login</Link>
              <Link to="/vendor/register" className="nav-link special">Become a Vendor</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;