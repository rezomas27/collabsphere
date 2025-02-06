// components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = document.cookie.includes('token=') || sessionStorage.getItem('auth');

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate('/posts');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a 
            href="#"
            onClick={handleLogoClick}
            className="text-2xl font-bold text-white cursor-pointer"
          >
            Collab<span className="text-indigo-500">Sphere</span>
          </a>
          
          <nav className="hidden md:flex space-x-6">
            {isLoggedIn ? (
              <>
                <Link to="/posts" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Dashboard
                </Link>
                <Link to="/posts/create" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Create Project
                </Link>
                <Link to="/my-projects" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  My Projects
                </Link>
                <Link to="/messages" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Messages
                </Link>
                <Link to="/profile" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/browse" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Browse Projects
                </Link>
                <Link to="/login" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Sign Up
                </Link>
                <Link to="/about" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  About
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;