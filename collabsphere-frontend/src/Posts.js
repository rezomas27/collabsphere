import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './components/Header';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-600 border-t-transparent"></div>
  </div>
);

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent'); 
  const [error, setError] = useState(null);


  const postTypes = [
    { value: '', label: 'All Posts' },
    { value: 'showcase', label: 'Showcase' },
    { value: 'seeking-contributors', label: 'Seeking Contributors' },
    { value: 'looking-to-join', label: 'Looking to Join' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'likes', label: 'Most Liked' }
  ];

  const sortPosts = (posts, sortBy) => {
    return [...posts].sort((a, b) => {
      if (sortBy === 'likes') {
        return (b.likeCount || 0) - (a.likeCount || 0);
      }
      // Sort by recent (using createdAt timestamp)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const handleLike = async (postId) => {
    try {
        const response = await fetch(`/api/posts/${postId}/like`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        likes: post.likes || [],
                        likeCount: data.likes
                    };
                }
                return post;
            }));

            setLikedPosts(prev => {
                const newLikedPosts = new Set(prev);
                if (data.isLiked) {
                    newLikedPosts.add(postId);
                } else {
                    newLikedPosts.delete(postId);
                }
                return newLikedPosts;
            });
        }
    } catch (error) {
        console.error('Error liking post:', error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/users/me', {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setCurrentUserId(userData._id);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts/browse', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch posts');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch posts');
      }

      const data = result.data;
      if (!Array.isArray(data)) {
        setError('Invalid response format');
        setPosts([]);
        return;
      }

      const postsWithComments = await Promise.all(
        data.map(async (post) => {
          try {
            const commentsResponse = await fetch(`/api/comments/post/${post._id}`, {
              credentials: 'include'
            });
            const comments = await commentsResponse.json();
            return { 
              ...post, 
              commentCount: Array.isArray(comments) ? comments.length : 0,
              likeCount: post.likes ? post.likes.length : 0
            };
          } catch {
            return { ...post, commentCount: 0, likeCount: 0 };
          }
        })
      );
      setPosts(postsWithComments);
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    
    fetchPosts();
    
    const interval = setInterval(fetchPosts, 30000);
    return () => clearInterval(interval);
  }, [currentUserId]);

// Replace existing filteredPosts declaration with:
  const filteredPosts = sortPosts(
    posts.filter(post => {
      const matchesSearch = (
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.user?.userName || '').toLowerCase().includes(searchQuery.toLowerCase())
      );

      const matchesType = selectedType ? post.type === selectedType : true;

      return matchesSearch && matchesType;
    }),
    sortBy
  );


  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Explore Projects</h1>
          <div className="flex items-center gap-4">
            <div className="bg-blue-900/40 backdrop-blur-sm rounded-lg p-1 flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-cyan-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-cyan-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <Link 
              to="/posts/create"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 flex items-center space-x-2"
            >
              <span>Create New Post</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-blue-900/30 backdrop-blur-sm border border-blue-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
            <svg 
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filters and Sort Options Container */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Post Type Filters */}
            <div className="flex flex-wrap gap-2">
              {postTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${selectedType === type.value
                      ? 'bg-cyan-600 text-white'
                      : 'bg-blue-900/40 backdrop-blur-sm text-gray-300 hover:bg-blue-800/40'
                    }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Vertical Divider */}
            <div className="h-8 w-px bg-blue-700/50"></div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-gray-300">Sort by:</span>
              <div className="flex gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${sortBy === option.value
                        ? 'bg-cyan-600 text-white'
                        : 'bg-blue-900/40 backdrop-blur-sm text-gray-300 hover:bg-blue-800/40'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      {option.value === 'recent' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                      {option.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No posts found matching your criteria</p>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 gap-6' 
              : 'flex flex-col space-y-4'
          }`}>
            {filteredPosts.map((post) => (
              <div 
                key={post._id}
                className={`bg-blue-900/30 backdrop-blur-sm rounded-xl p-6 
                  border border-blue-700/50 
                  ${viewMode === 'grid' 
                    ? 'hover:shadow-xl transition-all duration-300 hover:-translate-y-1' 
                    : 'hover:shadow-xl transition-all duration-300'
                  }
                  relative
                `}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-300">Posted by</span>
                      <Link 
                        to={`/profile/${post.user?.userName}`}
                        className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
                      >
                        {post.user ? post.user.userName : 'Unknown User'}
                      </Link>
                    </div>
                    <h2 className="text-xl font-bold text-white">{post.title}</h2>
                    <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                      post.type === 'showcase' ? 'bg-teal-600' : 
                      post.type === 'seeking-contributors' ? 'bg-cyan-600' : 
                      post.type === 'looking-to-join' ? 'bg-blue-600' : 'bg-cyan-600'
                    } text-white mt-2`}>
                      {post.type}
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 mb-4 line-clamp-3">{post.body}</p>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-700/50">
                  <div className="flex gap-4">
                    {post.github && (
                      <a 
                        href={post.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        GitHub
                      </a>
                    )}
                    {post.demo && (
                      <a 
                        href={post.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Live Demo
                      </a>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-gray-300">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-sm">
                        {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLike(post._id);
                      }}
                      className={`flex items-center space-x-1 ${
                        likedPosts.has(post._id) ? 'text-red-500' : 'text-gray-300'
                      } hover:text-red-500 transition-colors z-10`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill={likedPosts.has(post._id) ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>{post.likeCount || 0}</span>
                    </button>

                    <Link 
                      to={`/posts/${post._id}`}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 gap-2 z-10"
                      onClick={e => e.stopPropagation()}
                    >
                      Read More
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;