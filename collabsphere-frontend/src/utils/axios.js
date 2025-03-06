import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  withCredentials: true,
  timeout: 10000 // 10 second timeout
});

// Request interceptor for adding CSRF token
instance.interceptors.request.use(async (config) => {
  // Skip CSRF token for these endpoints
  if (config.url.includes('/api/users/login') || 
      config.url.includes('/api/users/signup') || 
      config.url.includes('/api/csrf-token') ||
      config.url.includes('/api/users/verify-email')) {
    return config;
  }

  try {
    const response = await axios.get('/api/csrf-token', { withCredentials: true });
    if (response.data.token) {
      config.headers['x-csrf-token'] = response.data.token;
    }
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
  }

  return config;
});

// Response interceptor to handle token expiration
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on 401
      sessionStorage.removeItem('auth');
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance; 