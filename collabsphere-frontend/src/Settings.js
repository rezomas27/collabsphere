import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import { 
  FiLock, 
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiAlertCircle
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const Settings = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    deletePassword: '',
    verificationCode: ''
  });

  useEffect(() => {
    // Fetch user data to check if they're a Google user
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/profile/me', { withCredentials: true });
        setIsGoogleUser(!!response.data.data.googleId);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();

    // Check if we're returning from Google auth for deletion
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('googleAuth') === 'success') {
      handleGoogleDeleteAccount();
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendVerificationCode = async () => {
    try {
      const response = await axios.post('/api/profile/send-password-code', {}, { withCredentials: true });
      setIsVerifying(true);
      setSuccess(response.data.message || 'Verification code sent to your email');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send verification code');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (!isVerifying) {
      await handleSendVerificationCode();
      return;
    }

    try {
      await axios.put('/api/profile/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        verificationCode: formData.verificationCode
      }, { withCredentials: true });

      setSuccess('Password updated successfully');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        verificationCode: ''
      }));
      setIsVerifying(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update password');
    }
  };

  const clearAllAuthData = () => {
    // Clear all cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    // Clear all storage
    sessionStorage.clear();
    localStorage.clear();

    // Clear any auth-related state
    setIsGoogleUser(false);
    setIsDeleting(false);
  };

  const handleGoogleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setError('');
      setSuccess('');

      await axios.delete('/api/profile/delete-account', {
        withCredentials: true
      });

      clearAllAuthData();
      
      setSuccess('Account deleted successfully. Redirecting to homepage...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Delete account error:', error);
      setError(error.response?.data?.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (isGoogleUser) {
      const confirmGoogleAuth = window.confirm(
        'You will be redirected to Google to authenticate. After authentication, your account will be deleted immediately. Continue?'
      );
      
      if (!confirmGoogleAuth) {
        return;
      }

      // For Google users, redirect to Google auth endpoint with delete flag
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      window.location.href = `${apiUrl}/api/users/auth/google?deleteAccount=true`;
      return;
    }

    try {
      setIsDeleting(true);
      await axios.delete('/api/profile/delete-account', {
        data: { password: formData.deletePassword },
        withCredentials: true
      });

      clearAllAuthData();
      
      setSuccess('Account deleted successfully. Redirecting to homepage...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Delete account error:', error);
      setError(error.response?.data?.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-blue-900/30 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-blue-700/50">
          <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-900/50 border border-green-700 text-green-200 rounded">
              {success}
            </div>
          )}

          {/* Password Section - Only show for non-Google users */}
          {!isGoogleUser && (
            <div className="bg-blue-800/20 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FiLock className="mr-2" /> Change Password
              </h2>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-slate-800/80 border border-blue-700/50 rounded-lg text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-slate-800/80 border border-blue-700/50 rounded-lg text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showNewPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-slate-800/80 border border-blue-700/50 rounded-lg text-white"
                  />
                </div>
                {isVerifying && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      name="verificationCode"
                      value={formData.verificationCode}
                      onChange={handleChange}
                      required
                      placeholder="Enter the code sent to your email"
                      className="w-full px-4 py-2 bg-slate-800/80 border border-blue-700/50 rounded-lg text-white"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
                >
                  {isVerifying ? 'Verify and Update Password' : 'Send Verification Code'}
                </button>
              </form>
            </div>
          )}

          {/* Delete Account Section */}
          <div className="bg-red-900/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FiTrash2 className="mr-2" /> Delete Account
            </h2>
            {isGoogleUser ? (
              <div>
                <div className="flex items-start space-x-3 mb-4 p-3 bg-blue-900/30 rounded-lg">
                  <FiAlertCircle className="text-blue-400 mt-1" />
                  <p className="text-gray-300">
                    Since you signed up with Google, you'll need to authenticate with Google again to delete your account.
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className={`flex items-center px-4 py-2 bg-white text-gray-900 rounded-lg transition-colors ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                  }`}
                >
                  <FcGoogle className="mr-2 text-xl" />
                  {isDeleting ? 'Deleting Account...' : 'Authenticate with Google to Delete'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showDeletePassword ? "text" : "password"}
                      name="deletePassword"
                      value={formData.deletePassword}
                      onChange={handleChange}
                      required
                      disabled={isDeleting}
                      className="w-full px-4 py-2 bg-slate-800/80 border border-red-700/50 rounded-lg text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeletePassword(!showDeletePassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showDeletePassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg transition-colors ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500'
                  }`}
                >
                  {isDeleting ? 'Deleting Account...' : 'Delete Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 