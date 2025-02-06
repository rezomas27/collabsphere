// hooks/useAuth.js
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for token in cookies
    const cookies = document.cookie.split(';');
    const hasToken = cookies.some(cookie => 
      cookie.trim().startsWith('token=')
    );
    setIsLoggedIn(hasToken);
  }, []);

  return isLoggedIn;
};