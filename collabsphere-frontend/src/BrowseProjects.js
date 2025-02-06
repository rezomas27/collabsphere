import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './components/Header';

const LoadingSpinner = () => (
 <div className="flex items-center justify-center min-h-screen">
   <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
 </div>
);

const BrowseProjects = () => {
 const [posts, setPosts] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
   const fetchPosts = async () => {
     try {
       const response = await fetch('/api/posts/browse');
       const data = await response.json();
       setPosts(data);
     } finally {
       setLoading(false);
     }
   };
   fetchPosts();
 }, []);

 if (loading) return <LoadingSpinner />;

 return (
   <div className="min-h-screen bg-gray-900">
     <div className="bg-gray-900 border-b border-gray-800">
       <Header />
     </div>

     <div className="max-w-6xl mx-auto px-4 py-8">
       <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-bold text-white">Browse Projects</h1>
         <Link 
           to="/login"
           className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all duration-200 flex items-center space-x-2"
         >
           Sign in to Create Project
         </Link>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {posts.map((post) => (
           <div key={post._id} 
             className="bg-gray-800 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 hover:transform hover:-translate-y-1 border border-gray-700">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
                 <span className="inline-block px-3 py-1 text-sm rounded-full bg-indigo-600 text-white">
                   {post.type}
                 </span>
               </div>
             </div>

             <p className="text-gray-300 mb-4 line-clamp-3">{post.body}</p>
             
             <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
               <div className="flex gap-4">
                 {post.github && (
                   <a 
                     href={post.github}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
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
                     className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                     </svg>
                     Live Demo
                   </a>
                 )}
               </div>
               
               <Link 
                 to="/login"
                 className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors gap-2"
               >
                 Sign in to Learn More
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
               </Link>
             </div>
           </div>
         ))}
       </div>
     </div>
   </div>
 );
};

export default BrowseProjects;