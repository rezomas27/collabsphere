import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from './contexts/ToastContext';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-600 border-t-transparent"></div>
  </div>
);

const BrowseProjects = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const { addToast } = useToast();

  const postTypes = [
    { value: '', label: 'All Projects' },
    { value: 'showcase', label: 'Showcase' },
    { value: 'seeking-contributors', label: 'Seeking Contributors' },
    { value: 'looking-to-join', label: 'Looking to Join' }
  ];

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const fetchPosts = async () => {
      try {
        console.log('Starting to fetch posts...');
        setError(null);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        console.log('Using API URL:', apiUrl);
        
        const response = await fetch(`${apiUrl}/api/posts/browse`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
          console.error('Error response:', errorData);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Received data:', result);
        
        if (isMounted) {
          if (!result.success) {
            throw new Error(result.message || 'Failed to fetch posts');
          }

          // Fetch comment counts for each post
          const postsWithCounts = await Promise.all(
            result.data.map(async post => {
              try {
                const commentResponse = await fetch(`${apiUrl}/api/comments/post/${post._id}`, {
                  credentials: 'include'
                });
                const comments = await commentResponse.json();
                return {
                  ...post,
                  commentCount: Array.isArray(comments) ? comments.length : 0,
                  likeCount: post.likes?.length || 0
                };
              } catch (error) {
                console.error(`Error fetching comments for post ${post._id}:`, error);
                return {
                  ...post,
                  commentCount: 0,
                  likeCount: post.likes?.length || 0
                };
              }
            })
          );
          
          console.log('Processed posts:', postsWithCounts);
          setPosts(postsWithCounts);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        if (isMounted) {
          setError(error.message || 'Failed to load projects. Please try again later.');
          addToast(error.message || 'Failed to load projects', 'error');
          setLoading(false);
        }
      }
    };

    fetchPosts();
    
    // Set up polling with a longer interval
    intervalId = setInterval(fetchPosts, 60000); // Poll every minute instead of every 30 seconds

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [addToast]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              window.location.reload();
            }}
            className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Filter posts based on search query and selected type
  const filteredPosts = posts.filter(post => {
    const matchesSearch = (
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.body?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesType = selectedType ? post.type === selectedType : true;
    return matchesSearch && matchesType;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Explore Projects</h1>
          <div className="flex items-center gap-4">
            <div className="bg-blue-900/50 rounded-lg p-1 flex">
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
              to="/login"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
            >
              <span>Sign in to Create Project</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-blue-900/30 border border-blue-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
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

          <div className="flex flex-wrap gap-2">
            {postTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedType === type.value
                    ? 'bg-cyan-600 text-white'
                    : 'bg-blue-900/50 text-gray-300 hover:bg-blue-800/50'
                  }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid/List */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No projects found matching your criteria</p>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 gap-6' 
              : 'flex flex-col space-y-4'
          }`}>
            {filteredPosts.map((post) => (
              <div key={post._id} 
                className="bg-blue-900/30 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1 border border-blue-800/50 backdrop-blur-sm">
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
                    <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
                    <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                      post.type === 'showcase' ? 'bg-teal-600' : 
                      post.type === 'seeking-contributors' ? 'bg-cyan-600' : 
                      post.type === 'looking-to-join' ? 'bg-blue-600' : 
                      'bg-cyan-600'
                    } text-white`}>
                      {post.type}
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 mb-4 line-clamp-3">{post.body}</p>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-800/50">
                  <div className="flex gap-4">
                    {post.github && (
                      <a 
                        href={post.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
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
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Live Demo
                      </a>
                    )}
                    {post.projectUrl && (
                      <a 
                        href={post.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Project URL
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

                    <div className="flex items-center text-gray-300">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-sm">{post.likeCount}</span>
                    </div>
                    
                    <Link 
                      to="/login"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 gap-2"
                    >
                      Sign in to Learn More
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
  
export default BrowseProjects;