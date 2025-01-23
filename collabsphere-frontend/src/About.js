import React from "react";
import "./App.css";

function About() {
  return (
    <div className="about-page">
      <header className="about-header">
        <h1>About CollabSphere</h1>
        <p>
          CollabSphere is a platform designed to bring creators, innovators, and
          collaborators together. Whether you have an idea that needs support or
          are looking to join a groundbreaking project, CollabSphere is your
          launchpad for success.
        </p>
      </header>
      <main className="about-main">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            To empower individuals by providing a space where ideas meet action.
            We strive to foster innovation and collaboration across a diverse
            range of projects and disciplines.
          </p>
        </section>
        <section className="about-section">
          <h2>Why CollabSphere?</h2>
          <ul>
            <li>Connect with passionate individuals worldwide.</li>
            <li>Gain hands-on experience by contributing to real projects.</li>
            <li>Turn your ideas into reality with the help of collaborators.</li>
          </ul>
        </section>
      </main>
      <footer className="about-footer">
        <p>&copy; {new Date().getFullYear()} CollabSphere. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default About;
