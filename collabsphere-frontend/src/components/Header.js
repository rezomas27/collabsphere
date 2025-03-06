import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiPlus, FiMessageSquare, FiGrid, FiHome, FiInfo } from 'react-icons/fi';
import logo from '../assets/logo.png';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Improved auth check
  const isAuthenticated = () => {
    const token = document.cookie.includes('token=') || sessionStorage.getItem('auth');
    return !!token;
  };

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/browse', '/about', '/login', '/signup', 
    '/contact', '/help', '/community-guidelines', '/privacy', '/terms', '/cookies'];

  const handleLogoClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    navigate(isAuthenticated() ? '/posts' : '/');
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children, icon: Icon }) => (
    <Link
      to={to}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
        isActivePath(to)
          ? 'text-cyan-400 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 font-medium'
          : 'text-gray-300 hover:text-cyan-400 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </Link>
  );

  return (
    <header className="bg-gradient-to-r from-slate-900 to-blue-900 border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand name */}
          <div className="flex items-center">
            <a
              href="#"
              onClick={handleLogoClick}
              className="flex items-center group"
            >
              <div className="flex items-center justify-center w-12 h-12 
                            rounded-full bg-white/10 backdrop-blur-sm 
                            ring-2 ring-cyan-500/50 
                            shadow-lg shadow-cyan-500/20 
                            transition-all duration-200 ease-in-out 
                            group-hover:ring-cyan-400 
                            group-hover:scale-105">
                <img
                  src={logo}
                  alt="DolphDive Logo"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <span className="ml-3 text-xl font-bold text-white 
                             transition-colors duration-200 
                             group-hover:text-cyan-400">
                DolphDive
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {isAuthenticated() ? (
              <>
                <NavLink to="/posts" icon={FiGrid}>Dashboard</NavLink>
                <NavLink to="/posts/create" icon={FiPlus}>Create Post</NavLink>
                <NavLink to="/my-posts" icon={FiUser}>My Posts</NavLink>
                <NavLink to="/messages" icon={FiMessageSquare}>Messages</NavLink>
                <NavLink to="/profile" icon={FiUser}>Profile</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/" icon={FiHome}>Home</NavLink>
                <NavLink to="/browse" icon={FiGrid}>Browse Projects</NavLink>
                <NavLink to="/about" icon={FiInfo}>About</NavLink>
                <div className="ml-4 flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-300 hover:text-cyan-400 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
                  >
                    Sign up
                  </Link>
                </div>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-cyan-400 focus:outline-none transition-colors"
          >
            {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-slate-900/95 to-blue-900/95 border-b border-cyan-500/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated() ? (
              <>
                <NavLink to="/posts" icon={FiGrid}>Dashboard</NavLink>
                <NavLink to="/posts/create" icon={FiPlus}>Create Project</NavLink>
                <NavLink to="/my-posts" icon={FiUser}>My Projects</NavLink>
                <NavLink to="/messages" icon={FiMessageSquare}>Messages</NavLink>
                <NavLink to="/profile" icon={FiUser}>Profile</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/" icon={FiHome}>Home</NavLink>
                <NavLink to="/browse" icon={FiGrid}>Browse Projects</NavLink>
                <NavLink to="/about" icon={FiInfo}>About</NavLink>
                <NavLink to="/login" icon={FiUser}>Log in</NavLink>
                <NavLink to="/signup" icon={FiPlus}>Sign up</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;