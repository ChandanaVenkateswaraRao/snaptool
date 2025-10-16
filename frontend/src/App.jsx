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
            <Route path="/item/:id" element={<ItemDetailPage />} />
            <Route path="/item/:id" element={<ItemDetailPage />} />
            <Route path="/item/edit/:id" element={<EditItemPage />} /> 
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;