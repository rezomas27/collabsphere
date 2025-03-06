import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const PrivateRoute = ({ children }) => {
  const [isVerified, setIsVerified] = useState(null);
  
  useEffect(() => {
    const AUTH_CACHE_KEY = 'auth_cache';
    const AUTH_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    const verifyAuth = async () => {
      // Check cache first
      const cachedAuth = localStorage.getItem(AUTH_CACHE_KEY);
      if (cachedAuth) {
        const { timestamp, status } = JSON.parse(cachedAuth);
        if (Date.now() - timestamp < AUTH_CACHE_DURATION) {
          setIsVerified(status);
          return;
        }
      }

      try {
        // First get CSRF token
        const csrfResponse = await axios.get('/api/csrf-token', { withCredentials: true });
        const csrfToken = csrfResponse.data.token;

        // Then make the authenticated request
        const response = await axios.get('/api/users/me', { 
          withCredentials: true,
          headers: {
            'x-csrf-token': csrfToken
          },
          validateStatus: function (status) {
            return status < 500;
          }
        });

        const status = response.status === 200;
        setIsVerified(status);

        // Cache the result
        localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          status
        }));
      } catch (error) {
        console.error('Auth verification error:', error);
        if (error.response?.status === 429) {
          // If rate limited, use cached value or default to previous state
          const cached = localStorage.getItem(AUTH_CACHE_KEY);
          if (cached) {
            const { status } = JSON.parse(cached);
            setIsVerified(status);
          }
          return;
        }

        setIsVerified(false);
        sessionStorage.removeItem('auth');
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        localStorage.removeItem(AUTH_CACHE_KEY);
      }
    };

    verifyAuth();
  }, []);

  if (isVerified === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent"></div>
      </div>
    );
  }

  return isVerified ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;