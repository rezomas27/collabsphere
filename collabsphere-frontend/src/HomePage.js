// HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import Header from './components/Header';

function HomePage() {
 return (
   <div className="min-h-screen bg-gray-900">
     <div className="bg-gray-900 border-b border-gray-800">
       <Header />
       
       {/* Hero Section */}
       <div className="max-w-7xl mx-auto px-4 py-24 text-center">
         <h2 className="text-4xl font-bold text-white md:text-6xl">
           Where ideas take flight
         </h2>
         <p className="mt-4 text-xl text-gray-300">
           Join our community of innovators, creators, and problem-solvers.
         </p>
         <Link 
           to="/signup" 
           className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-500 transition-colors inline-block"
         >
           Get Started
         </Link>
       </div>
     </div>

     {/* Main Content */}
     <main className="max-w-7xl mx-auto px-4 py-12">
       <div className="grid gap-8 md:grid-cols-3">
         <div className="bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1 border border-gray-700">
           <h3 className="text-xl font-semibold text-white">Discover Projects</h3>
           <p className="mt-2 text-gray-300">Browse through innovative ideas and find projects that inspire you to contribute and grow.</p>
           <p className="mt-4 text-sm font-medium text-indigo-400">1,000+ Active Projects</p>
         </div>

         <div className="bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1 border border-gray-700">
           <h3 className="text-xl font-semibold text-white">Share and Collaborate</h3>
           <p className="mt-2 text-gray-300">Share your projects to gain users and find others who want to contribute</p>
           <p className="mt-4 text-sm font-medium text-indigo-400">5,000+ Collaborators</p>
         </div>

         <div className="bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1 border border-gray-700">
           <h3 className="text-xl font-semibold text-white">Learn and Build</h3>
           <p className="mt-2 text-gray-300">Join projects to gain hands-on experience and expand your skills.</p>
           <p className="mt-4 text-sm font-medium text-indigo-400">200+ Learning Paths</p>
         </div>
       </div>
     </main>

     {/* Footer */}
     <footer className="bg-gray-800 text-gray-300 mt-12 border-t border-gray-700">
       <div className="max-w-7xl mx-auto px-4 py-6 text-center">
         <p>&copy; {new Date().getFullYear()} CollabSphere. All rights reserved.</p>
       </div>
     </footer>
   </div>
 );
}

export default HomePage;