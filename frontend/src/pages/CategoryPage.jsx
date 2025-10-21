import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import ItemCard from '../components/ItemCard.jsx';
import Loader from '../components/Loader';
import { AuthContext } from '../context/AuthContext';

const CategoryPage = () => {
    const { categoryName } = useParams();
    const { user } = useContext(AuthContext); // Get user to know their city
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch items only if we know the user's city
        if (user && user.city) {
            const fetchItems = async () => {
                setLoading(true);
                try {
                    const params = new URLSearchParams({
                        category: categoryName,
                        city: user.city // <-- Filter by the logged-in user's city
                    });
                    // You'll need to update getItems to handle city filtering
                    const { data } = await api.get(`/items?${params.toString()}`);
                    setItems(data);
                } catch (error) {
                    console.error("Failed to fetch category items", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchItems();
        } else if (user === null) { // Handle non-logged-in users
            // Maybe show a message or fetch all items in that category regardless of city
            setLoading(false);
        }
    }, [categoryName, user]);

    return (
        <div className="container">
            <h1>{categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}</h1>
            <p>Showing items available in your city: <strong>{user?.city}</strong></p>
            {loading ? <Loader /> : (
                <div className="items-grid">
                    {items.length > 0 ? (
                        items.map(item => <ItemCard key={item._id} item={item} />)
                    ) : <p>No items found in this category for your city.</p>}
                </div>
            )}
        </div>
    );
};

export default CategoryPage;