import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import { 
  FiEdit2, 
  FiLogOut, 
  FiMail, 
  FiUser, 
  FiShield, 
  FiGithub, 
  FiLinkedin, 
  FiGlobe, 
  FiMapPin, 
  FiSettings 
} from 'react-icons/fi';

// LoadingSpinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    skills: [],
    github: '',
    linkedin: '',
    website: '',
    location: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        website: profile.website || '',
        location: profile.location || ''
      });
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
        setError(''); // Clear any existing errors
        const [profileRes, postsRes] = await Promise.all([
            axios.get('/api/profile/me', { withCredentials: true }),
            axios.get('/api/posts/user/me', { withCredentials: true })
        ]);
        
        console.log('Profile response:', profileRes.data);
        console.log('Posts response:', postsRes.data);

        if (profileRes.data?.data) {
            setProfile({
                ...profileRes.data.data,
                recentPosts: postsRes.data || [] // Use empty array as fallback
            });
        } else {
            setError('No profile data received');
        }
    } catch (error) {
        console.error('Profile fetch error:', error);
        const errorMessage = error.response?.data?.message || 'Failed to load profile';
        setError(errorMessage);
        if (error.response?.status === 401) {
            navigate('/login');
        }
    } finally {
        setLoading(false);
    }
};


  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(''); // Clear any existing errors
    try {
      const response = await axios.put('/api/profile/me', editForm, {
        withCredentials: true
      });
      
      if (response.data?.data) {
        setProfile(response.data.data);
        setIsEditing(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleSkillInput = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      e.preventDefault();
      const newSkill = e.target.value.trim();
      if (newSkill && !editForm.skills.includes(newSkill)) {
        setEditForm(prev => ({
          ...prev,
          skills: [...prev.skills, newSkill]
        }));
      }
      e.target.value = '';
    }
  };

  const removeSkill = (skillToRemove) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      // Clear all auth-related data
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      sessionStorage.removeItem('auth');
      localStorage.removeItem('auth');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
    }
  };

  // Profile Header Component
  const ProfileHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
          <span className="text-3xl text-white font-bold">
            {profile?.firstName?.[0]}{profile?.lastName?.[0]}
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {profile?.firstName} {profile?.lastName}
          </h1>
          <p className="text-gray-400">@{profile?.userName}</p>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
        >
          <FiEdit2 className="mr-2" /> Edit Profile
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
        >
          <FiLogOut className="mr-2" /> Log Out
        </button>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded">
            {error}
          </div>
        )}

        {profile && (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-700/50">
            <ProfileHeader />

            {isEditing ? (
              <form onSubmit={handleUpdate} className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={e => setEditForm({...editForm, firstName: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={e => setEditForm({...editForm, lastName: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={e => setEditForm({...editForm, bio: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    rows="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Skills (Press Enter to add)
                  </label>
                  <input
                    type="text"
                    onKeyDown={handleSkillInput}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mb-2"
                  />
                  <div className="flex flex-wrap gap-2">
                    {editForm.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-full flex items-center"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-white hover:text-red-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      GitHub Profile
                    </label>
                    <input
                      type="text"
                      value={editForm.github}
                      onChange={e => setEditForm({...editForm, github: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      LinkedIn Profile
                    </label>
                    <input
                      type="text"
                      value={editForm.linkedin}
                      onChange={e => setEditForm({...editForm, linkedin: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Website
                    </label>
                    <input
                      type="text"
                      value={editForm.website}
                      onChange={e => setEditForm({...editForm, website: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={e => setEditForm({...editForm, location: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 space-y-6">
                {profile.bio && (
                  <div className="bg-gray-700/20 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">About</h3>
                    <p className="text-gray-300">{profile.bio}</p>
                  </div>
                )}

                {profile.skills?.length > 0 && (
                  <div className="bg-gray-700/20 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-700/20 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Links</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {profile.github && (
                      <a
                        href={profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300"
                      >
                        <FiGithub />
                        <span>GitHub Profile</span>
                      </a>
                    )}
                    {profile.linkedin && (
                      <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300"
                      >
                        <FiLinkedin />
                        <span>LinkedIn Profile</span>
                      </a>
                    )}
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300"
                      >
                        <FiGlobe />
                        <span>Personal Website</span>
                      </a>
                    )}
                  </div>
                </div>


                <div className="bg-gray-700/20 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Activity Stats</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{profile.stats?.posts || 0}</div>
                      <div className="text-gray-400">Projects</div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{profile.stats?.collaborations || 0}</div>
                      <div className="text-gray-400">Collaborations</div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{profile.stats?.contributions || 0}</div>
                      <div className="text-gray-400">Contributions</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Section */}
                <div className="bg-gray-700/20 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
                  {profile.recentPosts?.length > 0 ? (
                    <div className="space-y-4">
                      {profile.recentPosts.map((post) => (
                        <div 
                          key={post._id}
                          className="bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-white font-medium">{post.title}</h4>
                              <p className="text-gray-400 text-sm mt-1">{post.body.substring(0, 100)}...</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              post.type === 'showcase' ? 'bg-purple-600' : 
                              post.type === 'seeking-contributors' ? 'bg-orange-600' : 
                              'bg-green-600'
                            } text-white`}>
                              {post.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No recent activity</p>
                  )}
                </div>

                {/* Location Section */}
                {profile.location && (
                  <div className="bg-gray-700/20 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Location</h3>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <FiMapPin className="text-gray-400" />
                      <span>{profile.location}</span>
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="bg-gray-700/20 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <FiMail className="text-gray-400" />
                      <span className="text-gray-300">{profile.email}</span>
                    </div>
                    {profile.socialLinks?.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300"
                      >
                        <FiGlobe />
                        <span>{link.platform}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Account Settings Link */}
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => navigate('/settings')}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-2"
                  >
                    <FiSettings />
                    <span>Account Settings</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!profile && !error && !loading && (
          <div className="text-center text-gray-400">
            No profile information available
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;