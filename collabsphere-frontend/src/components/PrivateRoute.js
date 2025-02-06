import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, ...props }) => {
  console.log('Auth check:', document.cookie);
  const token = document.cookie.includes('token=') || sessionStorage.getItem('auth');
  
  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
