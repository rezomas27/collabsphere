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
   { value: 'in-development', label: '🚧 In Development - Looking for feedback' },
   { value: 'project-idea', label: '💡 Project Idea - Having an idea of a project' },
   { value: 'other', label: '✨ Other - Other project-related posts' }
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
  <div className="min-h-screen bg-slate-900">
    
    {/* Background gradient blobs */}
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-cyan-600 opacity-20 blur-3xl"></div>
      <div className="absolute top-60 -left-40 h-96 w-96 rounded-full bg-blue-600 opacity-20 blur-3xl"></div>
    </div>

    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-blue-700/50">
        <div className="flex items-center mb-6">
          <div className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mr-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Create New Project</h1>
        </div>

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
              className="mt-1 block w-full rounded-md bg-slate-800/80 border-blue-700/50 text-white shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
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
              className="mt-1 block w-full rounded-md bg-slate-800/80 border-blue-700/50 text-white shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
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
              className="mt-1 block w-full rounded-md bg-slate-800/80 border-blue-700/50 text-white placeholder-gray-400 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
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
              className="mt-1 block w-full rounded-md bg-slate-800/80 border-blue-700/50 text-white placeholder-gray-400 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-200">
              Project Description
            </label>
            <div className="mt-1 text-sm text-gray-300">
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
              className="mt-2 block w-full rounded-md bg-slate-800/80 border-blue-700/50 text-white shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-md text-white font-medium text-lg
                ${isSubmitting 
                  ? 'bg-cyan-500/50 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all'
                }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </div>
              ) : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);
};

export default Create;