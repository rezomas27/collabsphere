import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import { 
  FiLock, 
  FiTrash2,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';

const Settings = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    deletePassword: '',
    verificationCode: ''
  });

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

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete('/api/profile/delete-account', {
        data: { password: formData.deletePassword },
        withCredentials: true
      });

      // Clear all auth data
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      sessionStorage.removeItem('auth');
      localStorage.removeItem('auth');
      
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete account');
    }
  };

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

          {/* Update Password Section */}
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

          {/* Delete Account Section */}
          <div className="bg-red-900/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FiTrash2 className="mr-2" /> Delete Account
            </h2>
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
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
              >
                Delete Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 