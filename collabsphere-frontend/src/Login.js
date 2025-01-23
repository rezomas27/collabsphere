import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const token = document.cookie.includes('token=');
    if (token) {
      navigate('/posts');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(
        '/api/users/login',
        { email, password },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('Login response:', response.data);

      if (response.data.success) {
        // Store user data if needed
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        // Redirect using window.location for a full page reload
        if (response.data.redirectUrl) {
          window.location.href = response.data.redirectUrl;
        } else {
          window.location.href = '/posts';
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(
        error.response?.data?.message || 
        'Something went wrong. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold text-white">
              Collab<span className="text-yellow-300">Sphere</span>
            </Link>
            
            <nav className="hidden md:flex space-x-4">
              <Link to="/browse" className="text-white hover:text-yellow-300">
                Browse Projects
              </Link>
              <Link to="/login" className="text-white hover:text-yellow-300">
                Login
              </Link>
              <Link to="/signup" className="text-white hover:text-yellow-300">
                Sign Up
              </Link>
              <Link to="/about" className="text-white hover:text-yellow-300">
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Welcome Back
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>

            {errorMessage && (
              <div className="text-red-500 text-sm text-center">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don't have an account?</span>
            <Link to="/signup" className="ml-1 text-indigo-600 hover:text-indigo-500 font-medium">
              Sign up
            </Link>
          </div>

          <div className="mt-2 text-center text-sm">
            <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;