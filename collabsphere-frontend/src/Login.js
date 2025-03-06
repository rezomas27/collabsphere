import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from './utils/axios';
import { useToast } from './contexts/ToastContext';

const Login = () => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [errorMessage, setErrorMessage] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [showVerificationForm, setShowVerificationForm] = useState(false);
 const [verificationCode, setVerificationCode] = useState('');
 const navigate = useNavigate();
 const { addToast } = useToast();

 useEffect(() => {
   const token = document.cookie.includes('token=');
   const auth = sessionStorage.getItem('auth') === 'true';
   if (token && auth) {
     navigate('/posts', { replace: true });
   }
 }, [navigate]);

 const handleSubmit = async (e) => {
   e.preventDefault();
   setIsLoading(true);
   setErrorMessage('');

   try {
     const response = await axios.post('/api/users/login', { email, password });
    
     if (response.data.success) {
       sessionStorage.setItem('auth', 'true');
       addToast('Successfully logged in!', 'success');
       navigate('/posts', { replace: true });
     }
   } catch (error) {
     if (error.response?.data?.message === 'Please verify your email to log in.') {
       try {
         await axios.post('/api/users/resend-verification', { email });
         setShowVerificationForm(true);
         setErrorMessage('Please check your email for a new verification code.');
       } catch (verificationError) {
         setErrorMessage('Failed to send verification code. Please try again.');
       }
     } else {
       setErrorMessage(error.response?.data?.message || 'Login failed');
       addToast(error.response?.data?.message || 'Login failed', 'error');
       // Clear any invalid auth state
       sessionStorage.removeItem('auth');
       document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
     }
   } finally {
     setIsLoading(false);
   }
 };

 const handleVerificationSubmit = async (e) => {
   e.preventDefault();
   setIsLoading(true);
   setErrorMessage('');

   try {
     const response = await axios.post('/api/users/verify-code', {
       email,
       code: verificationCode
     });

     if (response.status === 200) {
       setErrorMessage('Email verified successfully! You can now log in.');
       setTimeout(() => {
         setShowVerificationForm(false);
         setVerificationCode('');
       }, 2000);
     }
   } catch (error) {
     setErrorMessage(error.response?.data?.message || 'Verification failed');
   }
   setIsLoading(false);
 };

 const handleResendCode = async () => {
   setIsLoading(true);
   setErrorMessage('');

   try {
     await axios.post('/api/users/resend-verification', { email });
     setErrorMessage('New verification code sent successfully!');
   } catch (error) {
     setErrorMessage('Failed to resend verification code. Please try again.');
   }
   setIsLoading(false);
 };

 return (
  <div className="min-h-screen bg-slate-900">

    <div className="max-w-md mx-auto px-4 py-12">
      {/* Background gradient blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-cyan-600 opacity-20 blur-3xl"></div>
        <div className="absolute top-60 -left-40 h-96 w-96 rounded-full bg-blue-600 opacity-20 blur-3xl"></div>
      </div>

      <div className="bg-blue-900/30 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-blue-700/50">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {!showVerificationForm ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          {!showVerificationForm ? 'Welcome Back' : 'Verify Your Email'}
        </h2>
        
        {!showVerificationForm ? (
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
                className="w-full px-3 py-2 bg-slate-800/80 border border-blue-700/50 text-white rounded-md 
                          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
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
                className="w-full px-3 py-2 bg-slate-800/80 border border-blue-700/50 text-white rounded-md 
                          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
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
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-4 rounded-md 
                       hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-cyan-500 
                       transition-all duration-200 disabled:opacity-50
                       disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerificationSubmit} className="space-y-6">
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-200 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                className="w-full px-3 py-2 bg-slate-800/80 border border-blue-700/50 text-white rounded-md 
                          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                          placeholder-gray-400"
                disabled={isLoading}
              />
            </div>

            {errorMessage && (
              <div className={`text-sm p-3 rounded ${
                errorMessage.includes('successfully') 
                  ? 'bg-green-900/50 text-green-300 border border-green-700' 
                  : 'bg-red-900/50 text-red-300 border border-red-700'
              }`}>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-4 rounded-md 
                       hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-cyan-500 
                       transition-all duration-200 disabled:opacity-50
                       disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="w-full mt-2 bg-transparent text-cyan-400 hover:text-cyan-300 py-2 px-4
                       focus:outline-none transition-colors duration-200"
            >
              Resend Code
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-300">Don't have an account?</span>
          <Link to="/signup" className="ml-1 text-cyan-400 hover:text-cyan-300 font-medium">
            Sign up
          </Link>
        </div>

        {!showVerificationForm && (
          <div className="mt-2 text-center text-sm">
            <Link to="/forgot-password" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Forgot your password?
            </Link>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default Login;