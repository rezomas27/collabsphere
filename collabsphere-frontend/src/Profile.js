import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from './utils/axios';
import { debounce } from 'lodash';
import { 
  FiEdit2, 
  FiLogOut, 
  FiGithub, 
  FiLinkedin, 
  FiGlobe, 
  FiMapPin, 
  FiSettings,
  FiCamera
} from 'react-icons/fi';

// LoadingSpinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
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
    location: '',
    profilePicture: '',
    email: '',
    socialLinks: []
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
        location: profile.location || '',
        profilePicture: profile.profilePicture || '',
        email: profile.email || '',
        socialLinks: profile.socialLinks || []
      });
    }
  }, [profile]);

  const fetchProfile = useCallback(async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 2000;

    try {
      setError('');
      const profileRes = await fetch('/api/profile/me', { 
        credentials: 'include'
      });

      if (!profileRes.ok) {
        if (profileRes.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileRes.json();
      
      // Fetch user's posts
      const postsRes = await fetch('/api/posts/user/me', { 
        credentials: 'include'
      });

      if (!postsRes.ok) {
        throw new Error('Failed to fetch user posts');
      }

      const postsData = await postsRes.json();

      if (profileData?.data) {
        setProfile({
          ...profileData.data,
          recentPosts: postsData || []
        });
        setError('');
      } else {
        throw new Error('Invalid profile data received');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      if (error.message === 'Failed to fetch' && retryCount < maxRetries) {
        console.log(`Network error. Retrying in ${retryDelay}ms...`);
        setTimeout(() => fetchProfile(retryCount + 1), retryDelay * (retryCount + 1));
        return;
      }
      setError(error.message || 'Failed to load profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Debounce the fetch function
  const debouncedFetchProfile = useCallback(
    debounce(() => fetchProfile(), 1000),
    [fetchProfile]
  );

  useEffect(() => {
    debouncedFetchProfile();
    return () => debouncedFetchProfile.cancel();
  }, [debouncedFetchProfile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const updateData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        bio: editForm.bio,
        skills: editForm.skills,
        github: editForm.github,
        linkedin: editForm.linkedin,
        website: editForm.website,
        location: editForm.location,
        email: editForm.email,
        socialLinks: editForm.socialLinks,
        profilePicture: editForm.profilePicture
      };
      
      const response = await fetch('http://localhost:3000/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await response.json();
      
      if (data?.data) {
        setProfile(prevProfile => ({
          ...prevProfile,
          ...data.data
        }));
        setIsEditing(false);
        setError('Profile updated successfully!');
      } else {
        throw new Error('Invalid response data format');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
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
        const response = await fetch('http://localhost:3000/api/users/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // Clear all client-side storage
            sessionStorage.clear();
            localStorage.clear();

            // Clear any auth-related cookies from the client side
            document.cookie.split(';').forEach(cookie => {
                const [name] = cookie.split('=');
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            });

            // Force a complete page reload to clear React state
            window.location.href = '/login';
        } else {
            throw new Error('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        addToast('Failed to logout. Please try again.', 'error');
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('profilePicture', file);

        const response = await axios.post('/api/profile/upload-picture', formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data?.url) {
          setEditForm(prev => ({
            ...prev,
            profilePicture: response.data.url
          }));
        }
      } catch (error) {
        setError('Failed to upload profile picture');
      }
    }
  };

  const handleSocialLinkChange = (index, field, value) => {
    setEditForm(prev => {
      const newSocialLinks = [...prev.socialLinks];
      newSocialLinks[index] = { ...newSocialLinks[index], [field]: value };
      return { ...prev, socialLinks: newSocialLinks };
    });
  };

  const addSocialLink = () => {
    setEditForm(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: '', url: '' }]
    }));
  };

  const removeSocialLink = (index) => {
    setEditForm(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  // Profile Header Component
  const ProfileHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
            {profile?.profilePicture ? (
              <img 
                src={profile.profilePicture} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl text-white font-bold">
                {profile?.firstName?.[0]}{profile?.lastName?.[0]}
              </span>
            )}
          </div>
          {isEditing && (
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-cyan-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
              />
              <FiCamera className="text-white" />
            </label>
          )}
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
          className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-900">
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className={`mb-4 p-3 ${
            error.includes('successfully') 
              ? 'bg-green-900/50 border border-green-700 text-green-200' 
              : 'bg-red-900/50 border border-red-700 text-red-200'
          } rounded`}>
            {error}
          </div>
        )}

        {profile && (
          <div className="bg-blue-900/30 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-blue-700/50">
            <ProfileHeader />

            {isEditing ? (
              <form onSubmit={handleUpdate} className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={e => setEditForm({...editForm, firstName: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800/80 border border-blue-700/50 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={e => setEditForm({...editForm, lastName: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800/80 border border-blue-700/50 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={e => setEditForm({...editForm, bio: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-800/80 border border-blue-700/50 rounded-lg text-white"
                    rows="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Skills (Press Enter to add)
                  </label>
                  <input
                    type="text"
                    onKeyDown={handleSkillInput}
                    className="w-full px-4 py-2 bg-slate-800/80 border border-blue-700/50 rounded-lg text-white mb-2"
                  />
                  <div className="flex flex-wrap gap-2">
                    {editForm.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-cyan-600 text-white rounded-full flex items-center"
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      GitHub Profile
                    </label>
                    <input
                      type="text"
                      value={editForm.github}
                      onChange={e => setEditForm({...editForm, github: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800/80 border border-blue-700/50 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      LinkedIn Profile
                    </label>
                    <input
                      type="text"
                      value={editForm.linkedin}
                      onChange={e => setEditForm({...editForm, linkedin: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800/80 border border-blue-700/50 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Website
                    </label>
                    <input
                      type="text"
                      value={editForm.website}
                      onChange={e => setEditForm({...editForm, website: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800/80 border border-blue-700/50 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={e => setEditForm({...editForm, location: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800/80 border border-blue-700/50 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Social Links</label>
                      {editForm.socialLinks.map((link, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Platform (e.g., Twitter)"
                            value={link.platform}
                            onChange={e => handleSocialLinkChange(index, 'platform', e.target.value)}
                            className="flex-1 px-4 py-2 bg-slate-800/80 border border-blue-700/50 rounded-lg text-white"
                          />
                          <input
                            type="url"
                            placeholder="URL"
                            value={link.url}
                            onChange={e => handleSocialLinkChange(index, 'url', e.target.value)}
                            className="flex-1 px-4 py-2 bg-slate-800/80 border border-blue-700/50 rounded-lg text-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeSocialLink(index)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addSocialLink}
                        className="mt-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500"
                      >
                        Add Social Link
                      </button>
                    </div>
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
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 space-y-6">
                {profile.bio && (
                  <div className="bg-blue-800/20 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">About</h3>
                    <p className="text-gray-300">{profile.bio}</p>
                  </div>
                )}

                {profile.skills?.length > 0 && (
                  <div className="bg-blue-800/20 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-cyan-600 text-white rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-800/20 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Links</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {profile.github && (
                      <a
                        href={profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300"
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
                        className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300"
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
                        className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300"
                      >
                        <FiGlobe />
                        <span>Personal Website</span>
                      </a>
                    )}
                  </div>
                </div>


                <div className="bg-blue-800/20 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Activity Stats</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{profile.stats?.posts || 0}</div>
                      <div className="text-gray-300">Projects</div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{profile.stats?.collaborations || 0}</div>
                      <div className="text-gray-300">Collaborations</div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{profile.stats?.contributions || 0}</div>
                      <div className="text-gray-300">Contributions</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Section */}
                <div className="bg-blue-800/20 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
                  {profile.recentPosts?.length > 0 ? (
                    <div className="space-y-4">
                      {profile.recentPosts.map((post) => (
                        <div 
                          key={post._id}
                          className="bg-slate-800/50 p-4 rounded-lg hover:bg-slate-800/80 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-white font-medium">{post.title}</h4>
                              <p className="text-gray-300 text-sm mt-1">{post.body.substring(0, 100)}...</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              post.type === 'showcase' ? 'bg-teal-600' : 
                              post.type === 'seeking-contributors' ? 'bg-cyan-600' : 
                              'bg-blue-600'
                            } text-white`}>
                              {post.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-300">No recent activity</p>
                  )}
                </div>

                {/* Location Section */}
                {profile.location && (
                  <div className="bg-blue-800/20 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Location</h3>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <FiMapPin className="text-gray-400" />
                      <span>{profile.location}</span>
                    </div>
                  </div>
                )}

                

                {/* Account Settings Link */}
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => navigate('/settings')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-2"
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