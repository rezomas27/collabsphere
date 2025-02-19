import React from 'react';
import { Link } from 'react-router-dom';
import Header from './components/Header';
import { FiArrowRight, FiSearch, FiUsers, FiCode, FiArrowDown } from 'react-icons/fi';

function HomePage() {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Screen */}
      <div className="relative h-screen bg-gray-900">
        <Header />
        
        <div className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-30">
          <div className="blur-[106px] h-56 bg-gradient-to-br from-blue-600 to-indigo-400"></div>
          <div className="blur-[106px] h-32 bg-gradient-to-r from-indigo-600 to-blue-400"></div>
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Projects</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12">
            Where great projects rise through meaningful collaboration
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/signup" 
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 flex items-center justify-center group"
            >
              Launch Your Project
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <button 
            onClick={scrollToContent}
            className="absolute bottom-12 animate-bounce p-2 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <FiArrowDown className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-gradient-to-b from-gray-900 to-indigo-900">
        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Projects Elevated', value: '1,000+' },
              { label: 'Active Creators', value: '50,000+' },
              { label: 'Success Stories', value: '120+' },
              { label: 'Global Connections', value: '5,000+' },
            ].map((stat, index) => (
              <div key={index} className="group hover:bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 transition-all duration-300">
                <div className="text-4xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 py-24">
          <h2 className="text-4xl font-bold text-white text-center mb-20">
            Your Path to <span className="text-blue-400">Excellence</span>
          </h2>
          <div className="space-y-32">
            <FeatureRow 
              icon={<FiSearch />}
              title="Showcase & Grow"
              description="Launch your completed projects to an engaged audience and watch your user base grow through meaningful exposure."
              illustration={CustomIllustrations.Showcase}
              reverse={false}
            />
            <FeatureRow 
              icon={<FiUsers />}
              title="Connect & Collaborate"
              description="Find the perfect collaborators or join exciting projects that match your interests and expertise."
              illustration={CustomIllustrations.Collaborate}
              reverse={true}
            />
            <FeatureRow 
              icon={<FiCode />}
              title="Innovate & Build"
              description="Transform your ideas into reality with a supportive community of skilled developers ready to contribute."
              illustration={CustomIllustrations.Innovate}
              reverse={false}
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-16 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Elevate?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join a community dedicated to taking projects to new heights.
            </p>
            <Link 
              to="/signup" 
              className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-medium hover:bg-gray-100 transition-colors inline-block"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 mb-4 md:mb-0">
                © {new Date().getFullYear()} Elevara. All rights reserved.
              </div>
              <div className="flex space-x-6">
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

const CustomIllustrations = {
  Showcase: () => (
    <svg className="w-full h-full" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background elements */}
      <rect width="400" height="300" fill="#1E293B" fillOpacity="0.3"/>
      
      {/* Main window/dashboard shape */}
      <rect x="50" y="40" width="300" height="220" rx="8" 
        className="fill-gray-800/50 stroke-blue-500/20" strokeWidth="2"/>
      
      {/* Graph/Stats visualization */}
      <path d="M75 200 L125 150 L175 180 L225 120 L275 140 L325 90" 
        className="stroke-blue-400" strokeWidth="3" fill="none"/>
      
      {/* Floating elements */}
      <rect x="90" y="80" width="80" height="40" rx="4" 
        className="fill-indigo-500/20 stroke-indigo-400/40" strokeWidth="2"/>
      <rect x="230" y="160" width="80" height="40" rx="4" 
        className="fill-blue-500/20 stroke-blue-400/40" strokeWidth="2"/>
      
      {/* Decorative dots */}
      <circle cx="125" cy="150" r="4" className="fill-blue-400"/>
      <circle cx="175" cy="180" r="4" className="fill-blue-400"/>
      <circle cx="225" cy="120" r="4" className="fill-blue-400"/>
      <circle cx="275" cy="140" r="4" className="fill-blue-400"/>
    </svg>
  ),

  Collaborate: () => (
    <svg className="w-full h-full" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background elements */}
      <rect width="400" height="300" fill="#1E293B" fillOpacity="0.3"/>
      
      {/* Connection lines */}
      <path d="M200 150 L100 100 M200 150 L300 100 M200 150 L100 200 M200 150 L300 200" 
        className="stroke-blue-400/30" strokeWidth="2"/>
      
      {/* Central node */}
      <circle cx="200" cy="150" r="30" 
        className="fill-blue-500/20 stroke-blue-400" strokeWidth="2"/>
      
      {/* Satellite nodes */}
      <circle cx="100" cy="100" r="20" 
        className="fill-indigo-500/20 stroke-indigo-400" strokeWidth="2"/>
      <circle cx="300" cy="100" r="20" 
        className="fill-indigo-500/20 stroke-indigo-400" strokeWidth="2"/>
      <circle cx="100" cy="200" r="20" 
        className="fill-indigo-500/20 stroke-indigo-400" strokeWidth="2"/>
      <circle cx="300" cy="200" r="20" 
        className="fill-indigo-500/20 stroke-indigo-400" strokeWidth="2"/>
      
      {/* Animated pulse effect */}
      <circle cx="200" cy="150" r="40" 
        className="fill-blue-400/0 stroke-blue-400/20 animate-ping" strokeWidth="2"/>
    </svg>
  ),

  Innovate: () => (
    <svg className="w-full h-full" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background elements */}
      <rect width="400" height="300" fill="#1E293B" fillOpacity="0.3"/>
      
      {/* Code window frame */}
      <rect x="50" y="40" width="300" height="220" rx="8" 
        className="fill-gray-800/50 stroke-blue-500/20" strokeWidth="2"/>
      
      {/* Window controls */}
      <circle cx="80" cy="60" r="6" className="fill-red-400/40"/>
      <circle cx="100" cy="60" r="6" className="fill-yellow-400/40"/>
      <circle cx="120" cy="60" r="6" className="fill-green-400/40"/>
      
      {/* Code lines */}
      <rect x="70" y="100" width="140" height="8" rx="4" 
        className="fill-blue-500/20"/>
      <rect x="70" y="120" width="200" height="8" rx="4" 
        className="fill-indigo-500/20"/>
      <rect x="70" y="140" width="160" height="8" rx="4" 
        className="fill-blue-500/20"/>
      <rect x="70" y="160" width="180" height="8" rx="4" 
        className="fill-indigo-500/20"/>
      <rect x="70" y="180" width="120" height="8" rx="4" 
        className="fill-blue-500/20"/>
      
      {/* Floating elements */}
      <rect x="260" y="110" width="60" height="60" rx="8" 
        className="fill-blue-500/10 stroke-blue-400/30" strokeWidth="2"/>
      <path d="M280 140 L300 130 L300 150 Z" className="fill-blue-400/40"/>
    </svg>
  )
};

// Feature Row Component
const FeatureRow = ({ icon, title, description, illustration: Illustration, reverse }) => (
  <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}>
    <div className="flex-1 space-y-4">
      <div className="text-blue-400 text-3xl">{icon}</div>
      <h3 className="text-3xl font-semibold text-white">{title}</h3>
      <p className="text-xl text-gray-300">{description}</p>
    </div>
    <div className="flex-1">
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl aspect-video overflow-hidden group hover:border-blue-500/50 border border-gray-700/50 transition-all duration-300">
        <Illustration />
      </div>
    </div>
  </div>
);

export default HomePage;
