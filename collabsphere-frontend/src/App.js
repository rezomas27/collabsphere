// App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./HomePage";
import About from "./About";
import BrowseProjects from "./BrowseProjects.js";
import Login from "./Login";
import Signup from "./Signup";
import VerifyEmail from "./VerifyEmail";
import VerifyInstruction from './VerifyInstruction';
import Posts from "./Posts";
import Create from "./Create";
import Profile from "./Profile";
import PrivateRoute from "./components/PrivateRoute";
import Header from "./components/Header";
import PostDetail from './PostDetail';
import UserProfile from './UserProfile';
import MyPosts from './MyPosts';
import EditPost from "./EditPost.js";
import Messages from "./Messages";
import Layout from './components/Layout';
import Help from "./Help";
import Contact from './Contact';
import CommunityGuidelines from './CommunityGuidelines';
import Privacy from './Privacy';
import Terms from './Terms';
import Cookies from './Cookies';
import Settings from './Settings';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';

const App = () => {
  useEffect(() => {
    const checkTokenExpiration = async () => {
      try {
        const tokenExp = sessionStorage.getItem('tokenExp');
        if (tokenExp && Date.now() >= parseInt(tokenExp)) {
          sessionStorage.clear();
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          window.location.replace('/login');
        }
      } catch (error) {
        console.error('Token check error:', error);
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<About />} />
              <Route path="/browse" element={<BrowseProjects />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/verify-email" element={<VerifyInstruction />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/community-guidelines" element={<CommunityGuidelines />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/help" element={<Help />} />

              {/* Protected Routes */}
              <Route path="/posts" element={<PrivateRoute><Posts /></PrivateRoute>} />
              <Route path="/posts/create" element={<PrivateRoute><Create /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/posts/:id" element={<PrivateRoute><PostDetail /></PrivateRoute>} />
              <Route path="/my-posts" element={<PrivateRoute><MyPosts /></PrivateRoute>} />
              <Route path="/posts/edit/:id" element={<PrivateRoute><EditPost /></PrivateRoute>} />
              <Route path="/profile/:username" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
              <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
              <Route path="/messages/:userId?" element={<PrivateRoute><Messages /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            </Routes>
          </Layout>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;