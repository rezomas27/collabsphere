import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">CollabSphere</Link>
      </div>
      <div className="navbar-links">
        <Link to="/browse" className="navbar-link">Browse Projects</Link>
        <Link to="/login" className="navbar-link">Login</Link>
        <Link to="/signup" className="navbar-link">Sign Up</Link>
        <Link to="/about" className="navbar-link">About</Link>
      </div>
    </nav>
  );
}

export default Navbar;