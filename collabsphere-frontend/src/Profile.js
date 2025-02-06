import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    console.log('Fetching profile...');
    try {
      const response = await axios.get('/api/profile/me', {
        withCredentials: true
      });
      
      console.log('Profile response:', response.data);
      
      if (response.data && response.data.data) {
        setProfile(response.data.data);
      } else {
        setError('No profile data received');
      }
    } catch (error) {
      console.error('Profile fetch error:', error.response || error);
      setError(error.response?.data?.message || 'Failed to load profile');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear the cookie by setting it to expire
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // Clear session storage
      sessionStorage.removeItem('auth');
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-900 border-b border-gray-800">
        <Header />
      </div>
 
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">My Profile</h2>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors"
            >
              Log Out
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded">
              {error}
            </div>
          )}
 
          {!profile && !error && !loading && (
            <div className="text-center text-gray-400">
              No profile information available
            </div>
          )}
 
          {profile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">First Name</p>
                  <p className="text-white">{profile.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Last Name</p>
                  <p className="text-white">{profile.lastName}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{profile.Email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Username</p>
                <p className="text-white">{profile.userName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email Verification Status</p>
                <p className="text-white">
                  {profile.isVerified ? (
                    <span className="text-green-400">Verified</span>
                  ) : (
                    <span className="text-yellow-400">Not Verified</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
 };

export default Profile;