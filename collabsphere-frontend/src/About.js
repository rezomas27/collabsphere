import React from "react";
import Header from './components/Header';
import { 
  FiTarget, 
  FiUsers, 
  FiCode, 
  FiArrowRight, 
  FiPackage, 
  FiGitBranch,
  FiBox,
  FiAnchor,
  FiCompass,
  FiLayers,
  FiInfo,
  FiUser
} from 'react-icons/fi';

function About() {
  return (
    <div className="min-h-screen">

      {/* Hero Section - Full Screen */}
      <div className="relative h-screen bg-slate-900 flex items-center">
        <div className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-30">
          <div className="blur-[106px] h-56 bg-gradient-to-br from-cyan-600 to-blue-400"></div>
          <div className="blur-[106px] h-32 bg-gradient-to-r from-blue-600 to-teal-400"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8">
            A Platform for 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 block mt-2">
              Project Collaboration
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Share your projects, gain users, propose ideas, and find the perfect collaborators to bring your vision to life.
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-gradient-to-b from-slate-900 to-blue-900">
        {/* Mission Section */}
        <section className="max-w-7xl mx-auto px-4 py-32">
          <div className="flex items-center justify-center mb-16">
            <FiTarget className="w-10 h-10 text-cyan-400 mr-4" />
            <h2 className="text-4xl font-bold text-white">Our Mission</h2>
          </div>
          <p className="text-gray-300 text-xl leading-relaxed max-w-4xl mx-auto text-center">
            To create a platform where great projects find their audience, developers find their 
            perfect collaborations, and innovative ideas find the talent they need to thrive.
          </p>
        </section>

        {/* DOLPH Acronym Section */}
        <section className="max-w-7xl mx-auto px-4 py-32 border-t border-blue-800/30">
          <div className="flex items-center justify-center mb-16">
            <FiInfo className="w-10 h-10 text-cyan-400 mr-4" />
            <h2 className="text-4xl font-bold text-white">The DOLPH Approach</h2>
          </div>
          
          <div className="grid md:grid-cols-5 gap-6 max-w-4xl mx-auto">
            <div className="bg-blue-900/40 p-6 rounded-xl backdrop-blur-sm border border-blue-700/50 text-center">
              <div className="text-5xl font-bold text-cyan-400 mb-2">D</div>
              <h3 className="text-xl font-semibold text-white mb-2">Develop</h3>
              <p className="text-gray-300">Build and refine your projects</p>
            </div>
            
            <div className="bg-blue-900/40 p-6 rounded-xl backdrop-blur-sm border border-blue-700/50 text-center">
              <div className="text-5xl font-bold text-cyan-400 mb-2">O</div>
              <h3 className="text-xl font-semibold text-white mb-2">Organize</h3>
              <p className="text-gray-300">Structure your workflow and team</p>
            </div>
            
            <div className="bg-blue-900/40 p-6 rounded-xl backdrop-blur-sm border border-blue-700/50 text-center">
              <div className="text-5xl font-bold text-cyan-400 mb-2">L</div>
              <h3 className="text-xl font-semibold text-white mb-2">Link</h3>
              <p className="text-gray-300">Connect with skilled collaborators</p>
            </div>
            
            <div className="bg-blue-900/40 p-6 rounded-xl backdrop-blur-sm border border-blue-700/50 text-center">
              <div className="text-5xl font-bold text-cyan-400 mb-2">P</div>
              <h3 className="text-xl font-semibold text-white mb-2">Propose</h3>
              <p className="text-gray-300">Share your innovative ideas</p>
            </div>
            
            <div className="bg-blue-900/40 p-6 rounded-xl backdrop-blur-sm border border-blue-700/50 text-center">
              <div className="text-5xl font-bold text-cyan-400 mb-2">H</div>
              <h3 className="text-xl font-semibold text-white mb-2">Harmonize</h3>
              <p className="text-gray-300">Work together effectively</p>
            </div>
          </div>
          
          <p className="text-gray-300 text-xl max-w-4xl mx-auto text-center mt-12">
            Our name DolphDive embodies these five principles that guide our platform's design and purpose: 
            to enable developers and creators to bring their ideas to life through meaningful collaboration.
          </p>
        </section>

        {/* Founder's Story Section */}
        <section className="max-w-7xl mx-auto px-4 py-32 border-t border-blue-800/30">
          <div className="flex items-center justify-center mb-16">
            <FiUser className="w-10 h-10 text-cyan-400 mr-4" />
            <h2 className="text-4xl font-bold text-white">Founder's Story</h2>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl mx-auto">
            <div className="w-64 h-64 rounded-full overflow-hidden backdrop-blur-sm border border-blue-700/50 flex-shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
                <span className="text-5xl text-white font-bold">SM</span>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-3xl font-semibold text-white mb-4">Sam Mozer</h3>
              <p className="text-gray-300 text-lg mb-6">
                DolphDive was founded by Sam Mozer, a Computer Science and Data Science student at the University of Wisconsin-Madison.
              </p>
              <p className="text-gray-300 text-lg mb-6">
                As an engineer, Sam noticed a common challenge in the tech community: talented developers wanted to contribute to interesting projects or propose new ideas, but didn't know where to start. Many struggled to find suitable collaborators or platforms to showcase their work.
              </p>
              <p className="text-gray-300 text-lg">
                This observation led to the creation of DolphDive—a dedicated space where developers can share completed projects, propose new ideas, and connect with like-minded collaborators to turn concepts into reality.
              </p>
            </div>
          </div>
        </section>

        {/* Core Principles */}
        <section className="max-w-7xl mx-auto px-4 py-32 border-t border-blue-800/30">
          <div className="flex items-center justify-center mb-16">
            <FiLayers className="w-10 h-10 text-cyan-400 mr-4" />
            <h2 className="text-4xl font-bold text-white">Core Features</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              icon: <FiLayers />,
              title: "Showcase Projects",
              description: "A space for your completed projects to shine and gain the recognition and users they deserve."
            },
            {
              icon: <FiUsers />,
              title: "Connect with Talent",
              description: "Find developers and creators who share your vision and complement your skills."
            },
            {
              icon: <FiGitBranch />,
              title: "Propose & Collaborate",
              description: "Share your ideas and find the perfect team to help transform concepts into reality."
            }
            ].map((value, index) => (
              <div key={index} className="group p-8">
                <div className="text-cyan-400 text-3xl mb-6 group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">{value.title}</h3>
                <p className="text-gray-300 text-lg">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-7xl mx-auto px-4 py-32 border-t border-blue-800/30">
          <div className="flex items-center justify-center mb-16">
            <FiCompass className="w-10 h-10 text-cyan-400 mr-4" />
            <h2 className="text-4xl font-bold text-white">How It Works</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="bg-blue-900/30 p-8 rounded-xl backdrop-blur-sm border border-blue-800/50">
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <span className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">1</span>
                  Create Your Profile
                </h3>
                <p className="text-gray-300">
                  Sign up and build your profile showcasing your skills, experience, and interests.
                </p>
              </div>
              
              <div className="bg-blue-900/30 p-8 rounded-xl backdrop-blur-sm border border-blue-800/50">
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <span className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">2</span>
                  Share Your Project
                </h3>
                <p className="text-gray-300">
                  Showcase your work or post a project idea that you're looking to develop with others.
                </p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-blue-900/30 p-8 rounded-xl backdrop-blur-sm border border-blue-800/50">
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <span className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">3</span>
                  Connect with Others
                </h3>
                <p className="text-gray-300">
                  Browse projects that interest you or find collaborators whose skills complement yours.
                </p>
              </div>
              
              <div className="bg-blue-900/30 p-8 rounded-xl backdrop-blur-sm border border-blue-800/50">
                <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <span className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">4</span>
                  Collaborate & Grow
                </h3>
                <p className="text-gray-300">
                  Work together to create something amazing, build your portfolio, and expand your network.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-3xl mx-auto px-4 py-32">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl p-16 text-center shadow-xl">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-cyan-100 mb-12">
              Join today and become part of a community built for creators and collaborators.
            </p>
            <button className="group px-8 py-4 bg-white text-blue-600 rounded-xl font-medium hover:bg-gray-50 transition-colors inline-flex items-center shadow-lg">
              Sign Up Now
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* Minimal Footer */}
        <footer className="border-t border-blue-800">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center text-gray-300">
              <p className="text-sm">
                © {new Date().getFullYear()} DolphDive. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default About;