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
import PrivateRoute from "./components/PrivateRoute";

import "./App.css";

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
        <Route 
          path="/posts" 
          element={
            <PrivateRoute>
              <Posts />
            </PrivateRoute>
          } 
        />
      </Routes>
    </div>
  );
};

export default App;