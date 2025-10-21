import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import .jsx files
import Header from './components/Header.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CreateListingPage from './pages/CreateListingPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ItemDetailPage from './pages/ItemDetailPage.jsx';
import EditItemPage from './pages/EditItemPage.jsx';
import RentPage from './pages/RentPage.jsx';
import SalePage from './pages/SalePage.jsx';
import EditProfilePage from './pages/EditProfilePage.jsx'
import BecomeVendorPage from './pages/BecomeVendorPage.jsx';
import VendorProfilePage from './pages/VendorProfilePage.jsx';
import VendorLoginPage from './pages/VendorLoginPage.jsx';
import VendorDashboardPage from './pages/VendorDashboardPage.jsx';
import VendorsPage from './pages/VendorsPage.jsx';
import VendorRegisterPage from './pages/VendorRegisterPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sale" element={<SalePage />} />
            <Route path="/rent" element={<RentPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/create-listing" element={<CreateListingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/become-vendor" element={<BecomeVendorPage />} /> {/* <-- ADD */}
            <Route path="/vendor/:id" element={<VendorProfilePage />} /> {/* <-- ADD */}
            <Route path="/item/:id" element={<ItemDetailPage />} />
            <Route path="/item/:id" element={<ItemDetailPage />} />
            <Route path="/item/edit/:id" element={<EditItemPage />} /> 
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/vendor/login" element={<VendorLoginPage />} />
            <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
            <Route path="/vendor/register" element={<VendorRegisterPage />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;