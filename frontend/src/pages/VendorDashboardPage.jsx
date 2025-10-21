import React from 'react';
import { Link } from 'react-router-dom';

const VendorDashboardPage = () => {
    // In a full implementation, you'd fetch and display vendor-specific data here
    return (
        <div className="container">
            <h1>Vendor Dashboard</h1>
            <p>Welcome! Manage your business and listings from this central hub.</p>
            <div style={{marginTop: '30px', display: 'flex', gap: '20px'}}>
                <Link to="/create-listing" className="btn">Add New Item</Link>
                <Link to="/profile" className="btn" style={{backgroundColor: '#555'}}>View My Profile</Link>
            </div>
            {/* Future sections: My Listings, Pending Requests, Sales Analytics */}
        </div>
    );
};

export default VendorDashboardPage;