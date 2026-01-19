import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const useSecurity = () => {
  const { logoutUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Prevent browser back button from showing cached authenticated pages
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isAuthenticated) {
        // Clear sensitive data on page unload
        sessionStorage.clear();
      }
    };

    const handleUnload = () => {
      if (isAuthenticated) {
        // Force logout on page unload to prevent session hijacking
        logoutUser();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [isAuthenticated, logoutUser]);

  // Secure logout function
  const secureLogout = () => {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }

    // Logout user
    logoutUser();

    // Navigate to login
    navigate('/login', { replace: true });

    // Prevent back navigation
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, '', window.location.href);
    };
  };

  // Check for suspicious activity
  const checkSecurity = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    // Check if token exists but user doesn't (or vice versa)
    if ((token && !user) || (!token && user)) {
      console.warn('Security warning: Inconsistent authentication data');
      secureLogout();
      return false;
    }

    // Check for multiple tabs/windows with different auth states
    const currentAuthState = isAuthenticated ? 'authenticated' : 'unauthenticated';
    const storedAuthState = sessionStorage.getItem('authState');

    if (storedAuthState && storedAuthState !== currentAuthState) {
      console.warn('Security warning: Authentication state mismatch across tabs');
      secureLogout();
      return false;
    }

    sessionStorage.setItem('authState', currentAuthState);
    return true;
  };

  return {
    secureLogout,
    checkSecurity,
  };
};

// Security headers utility
export const setSecurityHeaders = () => {
  // Prevent clickjacking
  if (!document.querySelector('meta[name="X-Frame-Options"]')) {
    const frameOptions = document.createElement('meta');
    frameOptions.name = 'X-Frame-Options';
    frameOptions.content = 'DENY';
    document.head.appendChild(frameOptions);
  }

  // Prevent MIME type sniffing
  if (!document.querySelector('meta[name="X-Content-Type-Options"]')) {
    const contentTypeOptions = document.createElement('meta');
    contentTypeOptions.name = 'X-Content-Type-Options';
    contentTypeOptions.content = 'nosniff';
    document.head.appendChild(contentTypeOptions);
  }

  // Enable XSS protection
  if (!document.querySelector('meta[name="X-XSS-Protection"]')) {
    const xssProtection = document.createElement('meta');
    xssProtection.name = 'X-XSS-Protection';
    xssProtection.content = '1; mode=block';
    document.head.appendChild(xssProtection);
  }
};