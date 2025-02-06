import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from './components/Header';

const Login = () => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [errorMessage, setErrorMessage] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const navigate = useNavigate();

 console.log('Login page TEST');
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
   try {
     const response = await axios.post('/api/users/login', 
       { email, password },
       { withCredentials: true }
     );
     
     console.log('Response:', response);
     
     if (response.data.success) {
       sessionStorage.setItem('auth', 'true');
       navigate('/posts');
     }
   } catch (error) {
     setErrorMessage(error.response?.data?.message || 'Login failed');
   }
   setIsLoading(false);
 };

 return (
  <div className="min-h-screen bg-gray-900">
    <div className="bg-gray-900 border-b border-gray-800">
      <Header />
    </div>

    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Welcome Back
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                        placeholder-gray-400"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                        placeholder-gray-400"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          {errorMessage && (
            <div className="text-red-400 text-sm text-center bg-red-900/50 p-2 rounded-md border border-red-700">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md 
                     hover:bg-indigo-500 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-indigo-500 
                     transition-colors duration-200 disabled:opacity-50
                     disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-400">Don't have an account?</span>
          <Link to="/signup" className="ml-1 text-indigo-400 hover:text-indigo-300 font-medium">
            Sign up
          </Link>
        </div>

        <div className="mt-2 text-center text-sm">
          <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  </div>
);
};

export default Login;