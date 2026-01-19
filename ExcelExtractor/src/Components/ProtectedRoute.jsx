import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Block back button navigation for authenticated users
  useEffect(() => {
    if (isAuthenticated && !loading) {
      // Completely disable back button navigation
      const disableBackButton = () => {
        // Replace current state
        window.history.replaceState(null, null, window.location.href);

        // Push multiple states to create a barrier
        window.history.pushState(null, null, window.location.href);
        window.history.pushState(null, null, window.location.href);
        window.history.pushState(null, null, window.location.href);
      };

      // Initial setup
      disableBackButton();

      // Handle any attempt to go back
      const handlePopState = (event) => {
        // Prevent the default back action
        event.preventDefault();

        // Immediately restore the current page
        window.history.pushState(null, null, window.location.href);
        window.history.pushState(null, null, window.location.href);
        window.history.pushState(null, null, window.location.href);

        // Force stay on current page
        window.location.hash = '';
        window.location.hash = '#stay';
      };

      // Handle beforeunload to prevent navigation
      const handleBeforeUnload = (event) => {
        if (isAuthenticated) {
          // Cancel the navigation
          event.preventDefault();
          event.returnValue = '';
          return '';
        }
      };

      // Handle hashchange to prevent hash-based navigation
      const handleHashChange = () => {
        if (window.location.hash === '#stay') {
          window.location.hash = '';
        }
      };

      // Add all event listeners
      window.addEventListener('popstate', handlePopState, false);
      window.addEventListener('beforeunload', handleBeforeUnload, false);
      window.addEventListener('hashchange', handleHashChange, false);

      // Override browser navigation methods
      const originalBack = window.history.back;
      const originalGo = window.history.go;
      const originalForward = window.history.forward;

      window.history.back = () => {
        // Do nothing - prevent back navigation
      };

      window.history.go = (delta) => {
        if (delta < 0) {
          // Prevent going back
          return;
        }
        originalGo.call(window.history, delta);
      };

      window.history.forward = () => {
        // Allow forward navigation if needed
        originalForward.call(window.history);
      };

      // Cleanup function
      return () => {
        window.removeEventListener('popstate', handlePopState, false);
        window.removeEventListener('beforeunload', handleBeforeUnload, false);
        window.removeEventListener('hashchange', handleHashChange, false);

        // Restore original methods
        window.history.back = originalBack;
        window.history.go = originalGo;
        window.history.forward = originalForward;
      };
    }
  }, [isAuthenticated, loading]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Verifying authentication...</div>
        </div>
      </div>
    );
  }

  // Only redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
