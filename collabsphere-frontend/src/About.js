import React from "react";
import Header from './components/Header';
import { 
  FiTarget, 
  FiUsers, 
  FiCode, 
  FiArrowRight, 
  FiPackage, 
  FiGitBranch,
  FiBox
} from 'react-icons/fi';

function About() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section - Full Screen */}
      <div className="relative h-screen bg-gray-900 flex items-center">
        <div className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-30">
          <div className="blur-[106px] h-56 bg-gradient-to-br from-blue-600 to-indigo-400"></div>
          <div className="blur-[106px] h-32 bg-gradient-to-r from-indigo-600 to-blue-400"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8">
            Elevating 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 block mt-2">
              Digital Innovation
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            A platform where creators showcase their work, innovators find collaborators, 
            and great ideas become reality.
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-gradient-to-b from-gray-900 to-indigo-900">
        {/* Mission Section */}
        <section className="max-w-7xl mx-auto px-4 py-32">
          <div className="flex items-center justify-center mb-16">
            <FiTarget className="w-10 h-10 text-blue-400 mr-4" />
            <h2 className="text-4xl font-bold text-white">Our Mission</h2>
          </div>
          <p className="text-gray-300 text-xl leading-relaxed max-w-4xl mx-auto text-center">
            To create an ecosystem where great projects find their audience, developers find their 
            perfect collaborations, and innovative ideas find the talent they need to thrive.
          </p>
        </section>

        {/* Core Principles */}
        <section className="max-w-7xl mx-auto px-4 py-32">
          <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              icon: <FiBox />, // Changed from FiLayers
              title: "Project Showcase",
              description: "A space for completed projects to shine and gain the recognition they deserve."
            },
            {
              icon: <FiUsers />,
              title: "Meaningful Connections",
              description: "Connect with developers who share your vision and complement your skills."
            },
            {
              icon: <FiGitBranch />, // Changed from FiGitPull
              title: "Idea Acceleration",
              description: "Transform concepts into reality by finding the perfect collaboration match."
            }
            ].map((value, index) => (
              <div key={index} className="group p-8">
                <div className="text-blue-400 text-3xl mb-6 group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">{value.title}</h3>
                <p className="text-gray-300 text-lg">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Impact Section */}
        <section className="max-w-7xl mx-auto px-4 py-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { number: "1K+", label: "Projects Launched" },
              { number: "5K+", label: "Active Creators" },
              { number: "500+", label: "Collaborations" },
              { number: "200+", label: "Success Stories" }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-3xl mx-auto px-4 py-32">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-16 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Elevate?</h2>
            <p className="text-xl text-blue-100 mb-12">
              Join a community dedicated to taking projects to new heights.
            </p>
            <button className="group px-8 py-4 bg-white text-indigo-600 rounded-xl font-medium hover:bg-gray-50 transition-colors inline-flex items-center">
              Get Started
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* Minimal Footer */}
        <footer className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center text-gray-400">
              <p className="text-sm">
                © {new Date().getFullYear()} Elevara. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default About;
