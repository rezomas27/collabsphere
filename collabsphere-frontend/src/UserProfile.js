import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './components/Header';

const ProfileStats = ({ label, value }) => (
  <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg">
    <span className="text-2xl font-bold text-white">{value}</span>
    <span className="text-sm text-gray-400">{label}</span>
  </div>
);

const UserProfile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile data
        const userResponse = await fetch(`/api/users/${username}`, {
          credentials: 'include'
        });
        const userData = await userResponse.json();
        setUser(userData);

        // Fetch user's posts
        const postsResponse = await fetch(`/api/posts/user/${userData._id}`, {
          credentials: 'include'
        });
        const postsData = await postsResponse.json();
        setUserPosts(postsData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-center pt-20">
        <p className="text-gray-400">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{user.userName}</h1>
                <p className="text-gray-400">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Message
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <ProfileStats label="Posts" value={userPosts.length} />
              <ProfileStats label="Comments" value={user.commentCount || 0} />
              <ProfileStats label="Projects" value={user.projectCount || 0} />
            </div>
          </div>

          {/* Recent Posts */}
          <div className="border-t border-gray-700 p-8">
            <h2 className="text-xl font-bold text-white mb-6">Recent Posts</h2>
            {userPosts.length > 0 ? (
              <div className="space-y-6">
                {userPosts.map(post => (
                  <div key={post._id} className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 text-sm rounded-full bg-indigo-600 text-white">
                        {post.type}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
                    <p className="text-gray-400 line-clamp-2">{post.body}</p>
                    <Link 
                      to={`/posts/${post._id}`}
                      className="inline-flex items-center mt-4 text-indigo-400 hover:text-indigo-300"
                    >
                      Read More
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center">No posts yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;