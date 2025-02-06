import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';

const Create = () => {
 const navigate = useNavigate();
 const [formData, setFormData] = useState({
   title: '',
   type: 'showcase',
   body: '',
   github: '',
   demo: ''
 });
 
 const [error, setError] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);

 const postTypes = [
   { value: 'showcase', label: '🎨 Project Showcase - Share your completed project' },
   { value: 'seeking-contributors', label: '🤝 Seeking Contributors - Looking for team members' },
   { value: 'looking-to-join', label: '🔍 Looking to Join - Want to contribute to projects' },
   { value: 'in-development', label: '🚧 In Development - Project in progress, feedback welcome' },
   { value: 'hackathon', label: '🏃 Hackathon Project - Speed-built project' },
   { value: 'learning-project', label: '📚 Learning Project - Educational project seeking feedback' },
   { value: 'open-source', label: '🌟 Open Source - Contributing to open source' }
 ];

 const handleChange = (e) => {
   const { name, value } = e.target;
   setFormData(prev => ({
     ...prev,
     [name]: value
   }));
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   setError('');
   setIsSubmitting(true);

   try {
     const response = await fetch('/api/posts', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       credentials: 'include',
       body: JSON.stringify(formData),
     });

     const data = await response.json();
     
     if (!response.ok) {
       throw new Error(data.message || 'Failed to create post');
     }

     navigate('/posts');
   } catch (err) {
     setError(err.message || 'Error creating post');
   } finally {
     setIsSubmitting(false);
   }
 };

 return (
  <div className="min-h-screen bg-gray-900">
    <div className="bg-gray-900 border-b border-gray-800">
      <Header />
    </div>

    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-6">Create New Post</h1>

        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-md mb-6 border border-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-200">
              Project Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-200">
              Post Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {postTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="github" className="block text-sm font-medium text-gray-200">
              GitHub Repository URL (optional)
            </label>
            <input
              type="url"
              id="github"
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="https://github.com/username/repository"
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="demo" className="block text-sm font-medium text-gray-200">
              Live Demo URL (optional)
            </label>
            <input
              type="url"
              id="demo"
              name="demo"
              value={formData.demo}
              onChange={handleChange}
              placeholder="https://your-project-demo.com"
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-200">
              Project Description
            </label>
            <div className="mt-1 text-sm text-gray-400">
              Include key details like:
              {formData.type === 'seeking-contributors' && " technologies used, team size needed, project timeline, and required skills."}
              {formData.type === 'looking-to-join' && " your skills, availability, and type of projects you're interested in."}
              {formData.type === 'showcase' && " technologies used, key features, and challenges overcome."}
            </div>
            <textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleChange}
              rows="8"
              className="mt-2 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-md text-white font-medium text-lg
                ${isSubmitting 
                  ? 'bg-indigo-400/50 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 transition-colors'
                }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);
};

export default Create;