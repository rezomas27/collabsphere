import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './components/Header';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-600 border-t-transparent"></div>
  </div>
);

const postTypes = [
  { value: 'showcase', label: '🎨 Project Showcase - Share your completed project' },
  { value: 'seeking-contributors', label: '🤝 Seeking Contributors - Looking for team members' },
  { value: 'looking-to-join', label: '🔍 Looking to Join - Want to contribute to projects' },
  { value: 'in-development', label: '🚧 In Development - Project in progress, feedback welcome' },
  { value: 'hackathon', label: '🏃 Hackathon Project - Speed-built project' },
  { value: 'learning-project', label: '📚 Learning Project - Educational project seeking feedback' },
  { value: 'open-source', label: '🌟 Open Source - Contributing to open source' }
];

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [error, setError] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');
  const [urlErrors, setUrlErrors] = useState({
    github: '',
    demo: '',
    projectUrl: ''
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const userResponse = await fetch('/api/profile/me', {
          credentials: 'include'
        });
        
        if (userResponse.status === 401) {
          window.location.href = '/login';
          return;
        }

        const userData = await userResponse.json();
        const postsResponse = await fetch(`/api/posts/user/${userData.data._id}`, {
          credentials: 'include'
        });

        const postsData = await postsResponse.json();
        const postsWithComments = await Promise.all(
          postsData.map(async (post) => {
            try {
              const commentsResponse = await fetch(`/api/comments/post/${post._id}`, {
                credentials: 'include'
              });
              const comments = await commentsResponse.json();
              const likesResponse = await fetch(`/api/posts/${post._id}/likes`, {
                credentials: 'include'
              });
              const likesData = await likesResponse.json();
              return { 
                ...post, 
                commentCount: Array.isArray(comments) ? comments.length : 0,
                likes: likesData.likes,
                likeCount: likesData.likeCount,
                isLiked: likesData.isLiked
              };
            } catch {
              return { 
                ...post, 
                commentCount: 0,
                likes: [],
                likeCount: 0,
                isLiked: false 
              };
            }
          })
        );
        
        setPosts(postsWithComments);
      } catch (error) {
        console.error('Error:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.redirect) {
        setPosts(posts.filter(post => post._id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const validateUrl = (url, field) => {
    if (!url) return true; // Empty URLs are valid
    try {
      new URL(url);
      setUrlErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    } catch (e) {
      setUrlErrors(prev => ({ ...prev, [field]: 'Please enter a valid URL (including http:// or https://)' }));
      return false;
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingPost(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate URLs on change
    if (['github', 'demo', 'projectUrl'].includes(name)) {
      validateUrl(value, name);
    }
  };

  const handleUpdate = async (postId) => {
    // Validate all URLs before submission
    const urlsValid = ['github', 'demo', 'projectUrl'].every(field => 
      validateUrl(editingPost[field], field)
    );

    if (!urlsValid) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title: editingPost.title,
          body: editingPost.body,
          type: editingPost.type,
          github: editingPost.github,
          demo: editingPost.demo,
          projectUrl: editingPost.projectUrl
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      const updatedPost = await response.json();
      setPosts(posts.map(post => 
        post._id === postId ? updatedPost : post
      ));
      setEditingPost(null);
      setUrlErrors({
        github: '',
        demo: '',
        projectUrl: ''
      });
    } catch (error) {
      setError(error.message || 'Failed to update post');
    }
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

  const startEditing = (post) => {
    setEditingPost({...post});
  };

  const renderUrlInput = (name, label, placeholder) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-200 mb-1">
        {label}
      </label>
      <input
        type="url"
        id={name}
        name={name}
        value={editingPost[name] || ''}
        onChange={handleEditChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-slate-800/80 border ${
          urlErrors[name] ? 'border-red-500' : 'border-blue-700/50'
        } text-white rounded-md focus:border-cyan-500 focus:ring-cyan-500`}
      />
      {urlErrors[name] && (
        <p className="mt-1 text-sm text-red-400">{urlErrors[name]}</p>
      )}
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-900">

      {/* Background gradient blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-cyan-600 opacity-20 blur-3xl"></div>
        <div className="absolute top-60 -left-40 h-96 w-96 rounded-full bg-blue-600 opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">My Posts</h1>
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
              <span>Create New Project</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-6 border border-red-700">
            {error}
          </div>
        )}
        
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-blue-900/30 backdrop-blur-sm rounded-xl border border-blue-700/50 p-8">
            <svg className="w-16 h-16 mx-auto text-cyan-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-300 text-lg mb-6">You haven't created any projects yet</p>
            <Link 
              to="/posts/create"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all duration-200"
            >
              Create Your First Project
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 gap-6' 
              : 'flex flex-col space-y-4'
          }`}>
            {posts.map((post) => (
              <div key={post._id} 
                className="bg-blue-900/30 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-700/50"
              >
                {editingPost && editingPost._id === post._id ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <input
                        type="text"
                        value={editingPost.title}
                        onChange={handleEditChange}
                        name="title"
                        maxLength={100}
                        className="text-xl font-bold bg-slate-800/80 border border-blue-700/50 text-white px-3 py-2 rounded-md w-full focus:border-cyan-500 focus:ring-cyan-500"
                      />
                      <div className="flex gap-2 ml-4">
                        <button 
                          onClick={() => handleUpdate(post._id)}
                          className="text-green-400 hover:text-green-300 transition-colors p-2 rounded-full hover:bg-blue-800/50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => {
                            setEditingPost(null);
                            setUrlErrors({
                              github: '',
                              demo: '',
                              projectUrl: ''
                            });
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-blue-800/50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <select
                      value={editingPost.type}
                      onChange={handleEditChange}
                      name="type"
                      className="w-full px-3 py-2 bg-slate-800/80 border border-blue-700/50 text-white rounded-md focus:border-cyan-500 focus:ring-cyan-500"
                    >
                      {postTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {renderUrlInput('github', 'GitHub Repository URL', 'https://github.com/username/repository')}
                      {renderUrlInput('demo', 'Live Demo URL', 'https://your-project-demo.com')}
                    </div>

                    {renderUrlInput('projectUrl', 'Project Website URL', 'https://your-project.com')}

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        Project Description
                      </label>
                      <textarea
                        value={editingPost.body}
                        onChange={handleEditChange}
                        name="body"
                        rows="6"
                        maxLength={5000}
                        className="w-full bg-slate-800/80 border border-blue-700/50 text-white px-3 py-2 rounded-md focus:border-cyan-500 focus:ring-cyan-500"
                      />
                      <p className="mt-1 text-sm text-gray-400 text-right">
                        {editingPost.body.length}/5000 characters
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-white">{post.title}</h2>
                        <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                          post.type === 'showcase' ? 'bg-teal-600' : 
                          post.type === 'seeking-contributors' ? 'bg-cyan-600' : 
                          post.type === 'looking-to-join' ? 'bg-blue-600' :
                          post.type === 'in-development' ? 'bg-yellow-600' :
                          post.type === 'hackathon' ? 'bg-pink-600' :
                          post.type === 'learning-project' ? 'bg-purple-600' :
                          'bg-green-600'
                        } text-white mt-2`}>
                          {post.type}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEditing(post)}
                          className="text-gray-300 hover:text-white transition-colors p-1 rounded-full hover:bg-blue-800/50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(post._id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-blue-800/50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 gap-2"
                        >
                          Read More
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;