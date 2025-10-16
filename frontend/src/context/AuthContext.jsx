import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      try {
        const decodedToken = jwtDecode(parsedUser.token);
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('userInfo');
          setUser(null);
        } else {
          setUser(parsedUser);
        }
      } catch (e) {
        // Invalid token
        localStorage.removeItem('userInfo');
        setUser(null);
      }
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};