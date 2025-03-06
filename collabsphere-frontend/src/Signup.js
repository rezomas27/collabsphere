import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from './components/Header';

const Signup = () => {
 const [formData, setFormData] = useState({
   firstName: '',
   lastName: '',
   Email: '',
   userName: '',
   Password: '',
   confirmPassword: '',
 });

 const [verificationData, setVerificationData] = useState({
   email: '',
   code: '',
 });

 const [showVerificationForm, setShowVerificationForm] = useState(false);
 const [errorMessage, setErrorMessage] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const navigate = useNavigate();

 const handleChange = (e) => {
   const { name, value } = e.target;
   setFormData({
     ...formData,
     [name]: value,
   });
 };

 const handleVerificationChange = (e) => {
   const { name, value } = e.target;
   setVerificationData({
     ...verificationData,
     [name]: value,
   });
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   setErrorMessage('');
   setIsLoading(true);

   if (formData.Password !== formData.confirmPassword) {
     setErrorMessage('Passwords do not match.');
     setIsLoading(false);
     return;
   }

   try {
     const response = await fetch('/api/users/signup', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(formData),
     });

     const data = await response.json();

     if (!response.ok) {
       throw new Error(data.message || 'Signup failed');
     }

     setVerificationData({ email: data.email, code: '' });
     setShowVerificationForm(true);
     setErrorMessage('Please check your email for the verification code.');
   } catch (err) {
     console.error('Signup error:', err);
     setErrorMessage(err.message || 'An error occurred during signup');
   } finally {
     setIsLoading(false);
   }
 };

 const handleVerificationSubmit = async (e) => {
   e.preventDefault();
   setErrorMessage('');
   setIsLoading(true);

   try {
     const response = await axios.post('/api/users/verify-code', verificationData);

     if (response.status === 200) {
       setErrorMessage('Email verified successfully!');
       setTimeout(() => {
         navigate('/login');
       }, 2000);
     }
   } catch (error) {
     if (error.response && error.response.data) {
       setErrorMessage(error.response.data.message);
     } else {
       setErrorMessage('Verification failed. Please try again.');
     }
   } finally {
     setIsLoading(false);
   }
 };

 const handleResendCode = async () => {
   setIsLoading(true);
   setErrorMessage('');

   try {
     const response = await axios.post('/api/users/resend-verification', {
       email: verificationData.email
     });

     if (response.status === 200) {
       setErrorMessage('New verification code sent successfully!');
     }
   } catch (error) {
     setErrorMessage('Failed to resend verification code. Please try again.');
   } finally {
     setIsLoading(false);
   }
 };

 return (
  <div className="min-h-screen bg-slate-900">

    {/* Background gradient blobs */}
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-cyan-600 opacity-20 blur-3xl"></div>
      <div className="absolute top-60 -left-40 h-96 w-96 rounded-full bg-blue-600 opacity-20 blur-3xl"></div>
    </div>

    {/* Signup/Verification Form */}
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-blue-900/30 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-blue-700/50">
        {!showVerificationForm ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Create Your Account
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-slate-800/80 border border-blue-700/50 text-white rounded-md 
                              focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                              placeholder-gray-400"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-slate-800/80 border border-blue-700/50 text-white rounded-md 
                              focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                              placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="Email" className="block text-sm font-medium text-gray-200 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="Email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-slate-800/80 border border-blue-700/50 text-white rounded-md 
                            focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                            placeholder-gray-400"
                />
              </div>

              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-200 mb-1">
                  Username
                </label>
                <input
                  type="userName"
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-slate-800/80 border border-blue-700/50 text-white rounded-md 
                            focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                            placeholder-gray-400"
                />
              </div>


              <div>
                <label htmlFor="Password" className="block text-sm font-medium text-gray-200 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="Password"
                  name="Password"
                  value={formData.Password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-slate-800/80 border border-blue-700/50 text-white rounded-md 
                            focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                            placeholder-gray-400"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Must contain at least 8 characters, 1 uppercase letter and 1 number
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-slate-800/80 border border-blue-700/50 text-white rounded-md 
                            focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                            placeholder-gray-400"
                />
              </div>

              {errorMessage && (
                <div className={`text-sm p-3 rounded ${
                  errorMessage.includes('successful') 
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
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-300">Already have an account?</span>
              <Link to="/login" className="ml-1 text-cyan-400 hover:text-cyan-300 font-medium">
                Sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Verify Your Email
            </h2>
            
            <form onSubmit={handleVerificationSubmit} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-200 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={verificationData.code}
                  onChange={handleVerificationChange}
                  placeholder="Enter 6-digit code"
                  required
                  className="w-full px-3 py-2 bg-slate-800/80 border border-blue-700/50 text-white rounded-md 
                            focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                            placeholder-gray-400"
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
          </>
        )}
      </div>
    </div>
  </div>
);
};

export default Signup;