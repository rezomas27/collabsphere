import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

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
        console.log('Verifying authentication...');
        const response = await fetch('http://localhost:3000/api/users/me', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        console.log('Auth response status:', response.status);
        console.log('Auth response headers:', Object.fromEntries(response.headers.entries()));

        if (response.status === 429) {
          // Rate limit hit - wait a bit and try again
          await new Promise(resolve => setTimeout(resolve, 2000));
          return verifyAuth();
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Auth verification failed:', errorData);
          throw new Error(errorData.message || 'Authentication failed');
        }

        const data = await response.json();
        console.log('Auth verification response:', data);

        if (data.success) {
          setIsVerified(true);
          // Cache the successful result
          localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            status: true
          }));
        } else {
          throw new Error(data.message || 'Authentication failed');
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        setIsVerified(false);
        sessionStorage.removeItem('auth');
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