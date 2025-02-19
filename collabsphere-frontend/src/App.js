// App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
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


const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/browse" element={<BrowseProjects />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/verify-email" element={<VerifyInstruction />} />
        <Route path="/posts" element={<PrivateRoute><Posts /></PrivateRoute>}/>
        <Route path="/posts/create" element={<PrivateRoute><Create /></PrivateRoute>}/>
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>}/>
        <Route path="/posts/:id" element={<PrivateRoute><PostDetail /></PrivateRoute>} />
        <Route path="/my-posts" element={<PrivateRoute><MyPosts/></PrivateRoute>}/>
        <Route path="/posts/edit/:id" element={<PrivateRoute><EditPost/></PrivateRoute>}/>
        <Route path="/profile/:username" element={<UserProfile />} />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
      </Routes>
    </div>
  );
};

export default App;