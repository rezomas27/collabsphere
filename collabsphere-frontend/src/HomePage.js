// HomePage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-white">
              Collab<span className="text-yellow-300">Sphere</span>
            </h1>
            
            <nav className="hidden md:flex space-x-4">
              <Link to="/browse" className="text-white hover:text-yellow-300">
                Browse Projects
              </Link>
              <Link to="/login" className="text-white hover:text-yellow-300">
                Login
              </Link>
              <Link to="/signup" className="text-white hover:text-yellow-300">
                Sign Up
              </Link>
              <Link to="/about" className="text-white hover:text-yellow-300">
                About
              </Link>
            </nav>
          </div>
        </div>
        
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-4xl font-bold text-white md:text-6xl">
          Where ideas take flight
        </h2>
        <p className="mt-4 text-xl text-indigo-100">
          Join our community of innovators, creators, and problem-solvers.
        </p>
        <Link 
          to="/signup" 
          className="mt-8 px-8 py-3 bg-white text-indigo-600 rounded-md font-medium hover:bg-indigo-50 inline-block"
        >
          Get Started
        </Link>
      </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900">Discover Projects</h3>
            <p className="mt-2 text-gray-500">Browse through innovative ideas and find projects that inspire you to contribute and grow.</p>
            <p className="mt-4 text-sm font-medium text-indigo-600">1,000+ Active Projects</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900">Share and Collaborate</h3>
            <p className="mt-2 text-gray-500">Share your projects to gain users and find others who want to contribute </p>
            <p className="mt-4 text-sm font-medium text-indigo-600">5,000+ Collaborators</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900">Learn and Build</h3>
            <p className="mt-2 text-gray-500">Join projects to gain hands-on experience and expand your skills.</p>
            <p className="mt-4 text-sm font-medium text-indigo-600">200+ Learning Paths</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p>&copy; {new Date().getFullYear()} CollabSphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;