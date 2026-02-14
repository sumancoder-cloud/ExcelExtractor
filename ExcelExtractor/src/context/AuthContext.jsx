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
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

  // Function to check if token is expired
  const isTokenExpired = (authToken) => {
    if (!authToken) return true;
    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  // Function to get time until token expires (in seconds)
  const getTimeUntilExpiry = (authToken) => {
    if (!authToken) return 0;
    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return Math.max(0, payload.exp - currentTime);
    } catch (error) {
      return 0;
    }
  };

  // Function to refresh token by calling refresh endpoint
  const refreshToken = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return false;

      const userData = JSON.parse(storedUser);
      
      // Call refresh endpoint
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId: userData._id })
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.token;
        setToken(newToken);
        localStorage.setItem('token', newToken);
        console.log('✅ New token obtained');
        return true;
      } else if (response.status === 401) {
        console.warn('⚠️ Unauthorized - token refresh endpoint rejected');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Token refresh network error:', error.message);
      // On network errors, don't immediately logout - user might have no internet
      return false;
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

  // On mount: Check if user was previously logged in
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 [INIT] App loading - checking localStorage...');
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('🔍 [INIT] Token in localStorage:', storedToken ? '✅ YES' : '❌ NO');
        console.log('🔍 [INIT] User in localStorage:', storedUser ? '✅ YES' : '❌ NO');

        if (storedToken && storedUser) {
          // Simply restore from localStorage on page load
          console.log('✅ [INIT] Restoring session from localStorage');
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          console.log('✅ [INIT] Session restored! Token and User set.');
        } else {
          console.log('⚠️ [INIT] No stored session found');
        }
      } catch (error) {
        console.error('❌ [INIT] Auth initialization error:', error);
      } finally {
        console.log('✅ [INIT] Initialization complete - setting loading to false');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Track inactivity and logout after 10 minutes of no activity
  useEffect(() => {
    if (!token || !user) {
      console.log('⏸️  [TIMER] Inactivity timer skipped - no token or user');
      return;
    }

    console.log('⏱️ [TIMER] Starting 10-minute inactivity timer');
    let inactivityTimer;
    
    const resetInactivityTimer = () => {
      // Clear existing timer
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      
      // Set new timer - logout after 10 minutes of inactivity
      inactivityTimer = setTimeout(() => {
        console.log('⏰ [TIMER] 10 minutes of inactivity - logging out');
        logoutUser();
      }, INACTIVITY_TIMEOUT);
    };
    
    // Track user activity (mouse, keyboard, touch, scroll)
    const handleActivity = () => {
      console.log('🖱️  [ACTIVITY] Activity detected - resetting timer');
      resetInactivityTimer();
    };
    
    // Add event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', handleActivity);
    
    // Initialize the inactivity timer
    resetInactivityTimer();
    console.log('✅ [TIMER] Activity listeners attached');
    
    // Cleanup
    return () => {
      console.log('🧹 [TIMER] Cleaning up inactivity timer');
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [token, user]);

  const loginUser = (userData, authToken) => {
    console.log('✅ [LOGIN] loginUser called');
    console.log('✅ [LOGIN] userData:', userData);
    console.log('✅ [LOGIN] authToken:', authToken ? 'Token exists' : 'NO TOKEN!');
    
    if (!authToken) {
      console.error('❌ [LOGIN] ERROR: No token provided!');
      return;
    }
    
    if (!userData) {
      console.error('❌ [LOGIN] ERROR: No user data provided!');
      return;
    }

    console.log('✅ [LOGIN] Setting state...');
    setUser(userData);
    setToken(authToken);
    
    console.log('✅ [LOGIN] Saving to localStorage...');
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log('✅ [LOGIN] Verify localStorage saved:');
    console.log('✅ [LOGIN] Token in localStorage:', localStorage.getItem('token') ? 'YES' : 'NO');
    console.log('✅ [LOGIN] User in localStorage:', localStorage.getItem('user') ? 'YES' : 'NO');
  };

  const logoutUser = () => {
    console.log('👋 [LOGOUT] User logged out');
    console.trace('👋 [LOGOUT] Logout called from:'); // Shows where logout was called
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
  };

  const value = {
    user,
    token,
    loading,
    loginUser,
    logoutUser,
    isAuthenticated: !!user && !!token,
    isTokenExpired,
    getTimeUntilExpiry,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
