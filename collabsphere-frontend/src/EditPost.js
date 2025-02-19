import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './components/Header';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    body: '',
    github: '',
    demo: ''
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`, {
          credentials: 'include'
        });
        
        if (response.status === 401) {
          navigate('/login');
          return;
        }

        const data = await response.json();
        if (!data) {
          setError('Post not found');
          return;
        }

        setFormData({
          title: data.title,
          type: data.type,
          body: data.body,
          github: data.github || '',
          demo: data.demo || ''
        });
      } catch (err) {
        setError('Failed to fetch post');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        navigate('/my-posts');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update post');
      }
    } catch (err) {
      setError('Failed to update post');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600">
          <Header />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600">
        <Header />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Edit Post</h1>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
              Post Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select a type</option>
              <option value="showcase">Showcase</option>
              <option value="seeking-contributors">Seeking Contributors</option>
              <option value="looking-to-join">Looking to Join</option>
            </select>
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-300 mb-2">
              Content
            </label>
            <textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="github" className="block text-sm font-medium text-gray-300 mb-2">
              GitHub URL (optional)
            </label>
            <input
              type="url"
              id="github"
              name="github"
              value={formData.github}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="demo" className="block text-sm font-medium text-gray-300 mb-2">
              Demo URL (optional)
            </label>
            <input
              type="url"
              id="demo"
              name="demo"
              value={formData.demo}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Update Post
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-posts')}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;