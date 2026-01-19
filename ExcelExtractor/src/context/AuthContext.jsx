import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Function to check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  // Function to validate token with server
  const validateToken = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data.valid;
      }
      return false;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        // Check if token is expired
        if (isTokenExpired(storedToken)) {
          console.log('Token expired, clearing auth data');
          logoutUser();
          setLoading(false);
          return;
        }

        // Validate token with server
        const isValid = await validateToken(storedToken);
        if (isValid) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          console.log('Token invalid, clearing auth data');
          logoutUser();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Set up periodic token validation (every 5 minutes)
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(async () => {
      if (isTokenExpired(token)) {
        console.log('Token expired during session');
        logoutUser();
        return;
      }

      const isValid = await validateToken(token);
      if (!isValid) {
        console.log('Token became invalid during session');
        logoutUser();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [token]);

  const loginUser = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear any other auth-related data
    sessionStorage.clear();
  };

  const value = {
    user,
    token,
    loading,
    loginUser,
    logoutUser,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
