import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiPlus, FiMessageSquare, FiGrid, FiHome, FiInfo } from 'react-icons/fi';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isLoggedIn = document.cookie.includes('token=') || sessionStorage.getItem('auth');

  const handleLogoClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (isLoggedIn) {
      navigate('/posts');
    } else {
      navigate('/');
    }
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
          ? 'text-blue-400 bg-gray-800/50 font-medium'
          : 'text-gray-300 hover:text-blue-400 hover:bg-gray-800/30'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="#"
            onClick={handleLogoClick}
            className="flex items-center space-x-2 text-2xl font-bold text-white cursor-pointer group"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-bold transform group-hover:rotate-6 transition-transform">
              E
            </div>
            <span>
              Ele<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">vara</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {isLoggedIn ? (
              <>
                <NavLink to="/posts" icon={FiGrid}>Dashboard</NavLink>
                <NavLink to="/posts/create" icon={FiPlus}>Create Project</NavLink>
                <NavLink to="/my-posts" icon={FiUser}>My Projects</NavLink>
                <NavLink to="/messages" icon={FiMessageSquare}>Messages</NavLink>
                <NavLink to="/profile" icon={FiUser}>Profile</NavLink>
                <Link
                  to="/posts/create"
                  className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 flex items-center space-x-2"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>New Project</span>
                </Link>
              </>
            ) : (
              <>
                <NavLink to="/browse" icon={FiGrid}>Browse Projects</NavLink>
                <NavLink to="/about" icon={FiInfo}>About</NavLink>
                <div className="ml-4 flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
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
            className="md:hidden p-2 text-gray-400 hover:text-white focus:outline-none"
          >
            {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isLoggedIn ? (
              <>
                <NavLink to="/posts" icon={FiGrid}>Dashboard</NavLink>
                <NavLink to="/posts/create" icon={FiPlus}>Create Project</NavLink>
                <NavLink to="/my-posts" icon={FiUser}>My Projects</NavLink>
                <NavLink to="/messages" icon={FiMessageSquare}>Messages</NavLink>
                <NavLink to="/profile" icon={FiUser}>Profile</NavLink>
              </>
            ) : (
              <>
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
