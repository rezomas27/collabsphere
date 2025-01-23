import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Check if user is authenticated (has valid token)
  const isAuthenticated = document.cookie.includes('token=');
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;