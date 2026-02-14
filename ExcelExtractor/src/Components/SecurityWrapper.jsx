import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SecurityWrapper = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only run security checks after authentication has finished loading
    if (loading) return;

    // Prevent access to cached authenticated pages
    const preventBackNavigation = () => {
      if (!isAuthenticated) {
        // If user is not authenticated, redirect to login
        navigate('/login', { replace: true });
        return;
      }
    };

    // Handle page visibility changes (user switching tabs)
    const handleVisibilityChange = () => {
      if (document.hidden && isAuthenticated) {
        // Page is hidden, check authentication when it becomes visible again
        const checkAuthOnVisible = () => {
          if (!document.hidden) {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');

            if (!token || !user) {
              navigate('/login', { replace: true });
            }
            document.removeEventListener('visibilitychange', checkAuthOnVisible);
          }
        };
        document.addEventListener('visibilitychange', checkAuthOnVisible);
      }
    };

    // Handle page unload
    const handleBeforeUnload = (e) => {
      if (isAuthenticated) {
        // Clear sensitive data from memory (but NOT localStorage - we keep it for persistence)
        // Note: This doesn't prevent all forms of session hijacking but adds a layer of security
        console.log('🧹 [SECURITY] Page unloading - clearing sessionStorage only');
        sessionStorage.clear();
      }
    };

    // Set up event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, loading, navigate]);

  // Prevent right-click context menu on production
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (process.env.NODE_ENV === 'production') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Prevent keyboard shortcuts that could compromise security
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent Ctrl+Shift+I (DevTools), Ctrl+U (View Source), etc.
      if (process.env.NODE_ENV === 'production') {
        if (
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u') ||
          (e.ctrlKey && e.key === 'U') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C')
        ) {
          e.preventDefault();
          return false;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return children;
};

export default SecurityWrapper;