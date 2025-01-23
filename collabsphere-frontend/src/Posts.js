import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Loader2 } from 'lucide-react';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/posts', { withCredentials: true });
        setPosts(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to fetch posts');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold text-white">
              Collab<span className="text-yellow-300">Sphere</span>
            </Link>
            
            <nav className="hidden md:flex space-x-4">
              <Link to="/posts/create" className="text-white hover:text-yellow-300">
                Create Post
              </Link>
              <Link to="/myAccount" className="text-white hover:text-yellow-300">
                My Account
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Recent Posts</h1>
          <Link
            to="/posts/create"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create Post
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {post.title}
                  </h2>
                  {post.user && (
                    <p className="text-sm text-gray-500 mt-1">
                      Posted by {post.user.firstName} {post.user.lastName}
                    </p>
                  )}
                </div>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  {post.type}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">
                {post.body.length > 200 
                  ? `${post.body.substring(0, 200)}...` 
                  : post.body}
              </p>
              
              <Link
                to={`/posts/${post._id}`}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Read more →
              </Link>
            </div>
          ))}

          {posts.length === 0 && !error && (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">No posts yet. Be the first to create one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Posts;