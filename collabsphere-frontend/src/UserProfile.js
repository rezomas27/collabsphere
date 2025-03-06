import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import { 
  FiMail, 
  FiGithub, 
  FiLinkedin, 
  FiGlobe, 
  FiMapPin,
  FiMessageSquare 
} from 'react-icons/fi';

const ProfileStats = ({ label, value }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg">
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-gray-400">{label}</div>
  </div>
);

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user')); // Get current user

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetch(`/api/profile/user/${username}`, {
          credentials: 'include'
        });
        const userData = await userResponse.json();
        
        if (userData.success && userData.data) {
          const userId = userData.data._id;
          
          // Fetch posts and stats
          const [postsRes, statsRes] = await Promise.all([
            fetch(`/api/posts/user/${userId}`, { credentials: 'include' }),
            fetch(`/api/posts/stats/${userId}`, { credentials: 'include' })
          ]);
          
          const [postsData, statsData] = await Promise.all([
            postsRes.json(),
            statsRes.json()
          ]);
          
          setUser({
            ...userData.data,
            recentPosts: Array.isArray(postsData) ? postsData : [],
            stats: statsData
          });
        } else {
          setError('User not found');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  const handleMessageClick = () => {
    if (!document.cookie.includes('token=') && !sessionStorage.getItem('auth')) {
      navigate('/login');
      return;
    }
    navigate(`/messages/${user._id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-gray-400">{error || 'User not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-700/50">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl text-white font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-400">@{user.userName}</p>
              </div>
            </div>
            
            {document.cookie.includes('token=') || sessionStorage.getItem('auth') ? (
              <button
                onClick={handleMessageClick}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
              >
                <FiMessageSquare className="mr-2" /> Message
              </button>
            ) : null}
          </div>

          {/* About Section */}
          {user.bio && (
            <div className="bg-gray-700/20 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">About</h3>
              <p className="text-gray-300">{user.bio}</p>
            </div>
          )}

          {/* Skills Section */}
          {user.skills?.length > 0 && (
            <div className="bg-gray-700/20 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
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

          {/* Links Section */}
          <div className="bg-gray-700/20 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Links</h3>
            <div className="grid grid-cols-2 gap-4">
              {user.github && (
                <a
                  href={user.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300"
                >
                  <FiGithub />
                  <span>GitHub Profile</span>
                </a>
              )}
              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300"
                >
                  <FiLinkedin />
                  <span>LinkedIn Profile</span>
                </a>
              )}
              {user.website && (
                <a
                  href={user.website}
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

          {/* Activity Stats */}
          <div className="bg-gray-700/20 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Activity Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{user.stats?.posts || 0}</div>
                <div className="text-gray-300">Projects</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{user.stats?.collaborations || 0}</div>
                <div className="text-gray-300">Collaborations</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{user.stats?.contributions || 0}</div>
                <div className="text-gray-300">Contributions</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-700/20 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
            {user.recentPosts?.length > 0 ? (
              <div className="space-y-4">
                {user.recentPosts.map((post) => (
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
                    <Link 
                      to={`/posts/${post._id}`}
                      className="inline-flex items-center mt-4 text-indigo-400 hover:text-indigo-300"
                    >
                      View Details
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No recent activity</p>
            )}
          </div>

          {/* Location Section */}
          {user.location && (
            <div className="bg-gray-700/20 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Location</h3>
              <div className="flex items-center space-x-2 text-gray-300">
                <FiMapPin className="text-gray-400" />
                <span>{user.location}</span>
              </div>
            </div>
          )}

          {/* Join Date */}
          <div className="text-center text-gray-400 mt-8">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
