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
     const response = await axios.post('/api/users/signup', formData);

     if (response.status === 200) {
       setFormData({
         firstName: '',
         lastName: '',
         Email: '',
         userName: '',
         Password: '',
         confirmPassword: '',
       });
       setErrorMessage('Signup successful! Please check your email for the verification link.');
     }
   } catch (error) {
     if (error.response && error.response.data) {
       setErrorMessage(error.response.data.message);
     } else {
       setErrorMessage('Something went wrong. Please try again.');
     }
   } finally {
     setIsLoading(false);
   }
 };

 return (
  <div className="min-h-screen bg-gray-900">
    <div className="bg-gray-900 border-b border-gray-800">
      <Header />
    </div>

    {/* Signup Form */}
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
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
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md 
                          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
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
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md 
                          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
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
              value={formData.userName  }
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                        placeholder-gray-400"
            />
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
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
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md 
                     hover:bg-indigo-500 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-indigo-500 
                     transition-colors duration-200 disabled:opacity-50
                     disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-400">Already have an account?</span>
          <Link to="/login" className="ml-1 text-indigo-400 hover:text-indigo-300 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  </div>
);
};

export default Signup;