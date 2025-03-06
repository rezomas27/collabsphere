import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiSearch, FiUsers, FiCode, FiArrowDown, FiShare2, FiMessageSquare, FiLayers } from 'react-icons/fi';

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
      <div className="relative h-screen bg-slate-900">
        <div className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-30">
          <div className="blur-[106px] h-56 bg-gradient-to-br from-cyan-600 to-blue-400"></div>
          <div className="blur-[106px] h-32 bg-gradient-to-r from-blue-600 to-teal-400"></div>
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">DolphDive</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12">
            A platform to share projects, connect with collaborators, and build amazing things together
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/signup" 
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 flex items-center justify-center group"
            >
              Get Started
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
      <div className="bg-gradient-to-b from-slate-900 to-blue-900">
        {/* Main Features Section */}
        <div className="max-w-7xl mx-auto px-4 py-24">
          <h2 className="text-4xl font-bold text-white text-center mb-20">
            What <span className="text-cyan-400">DolphDive</span> Offers
          </h2>
          <div className="space-y-32">
            <FeatureRow 
              icon={<FiShare2 />}
              title="Showcase Your Projects"
              description="Share your completed projects to gain users, feedback, and recognition from a community of developers and creators."
              illustration={CustomIllustrations.Showcase}
              reverse={false}
            />
            <FeatureRow 
              icon={<FiUsers />}
              title="Find Collaborators"
              description="Connect with talented developers and designers who can help bring your ideas to life through meaningful collaboration."
              illustration={CustomIllustrations.Collaborate}
              reverse={true}
            />
            <FeatureRow 
              icon={<FiLayers />}
              title="Propose & Discover Ideas"
              description="Share your project concepts or discover innovative ideas from others looking for skilled contributors to join their team."
              illustration={CustomIllustrations.Innovate}
              reverse={false}
            />
          </div>
        </div>

        {/* How It Works Section */}
        <div className="max-w-7xl mx-auto px-4 py-24">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Create Your Profile",
                description: "Sign up and showcase your skills, experience, and portfolio to stand out in the community."
              },
              {
                number: "02",
                title: "Share or Browse Projects",
                description: "Post your own projects or explore others' work to find opportunities for collaboration."
              },
              {
                number: "03",
                title: "Connect & Collaborate",
                description: "Message potential collaborators, join projects, and work together to build something amazing."
              }
            ].map((step, index) => (
              <div key={index} className="bg-blue-900/30 backdrop-blur-sm rounded-xl p-8 border border-blue-700/30 hover:border-cyan-500/50 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold mb-6">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave Divider */}
        <div className="relative h-24 overflow-hidden">
          <svg preserveAspectRatio="none" className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#0369a1" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="#0369a1" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#0369a1"></path>
          </svg>
        </div>

        {/* CTA Section */}
        <div className="bg-cyan-700">
          <div className="max-w-7xl mx-auto px-4 py-24">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-16 text-center shadow-xl">
              <h2 className="text-4xl font-bold text-white mb-6">Join Our Community Today</h2>
              <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
                Be part of a growing network where projects and talented people connect
              </p>
              <Link 
                to="/signup" 
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-medium hover:bg-gray-100 transition-colors inline-block shadow-lg"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CustomIllustrations = {
  Showcase: () => (
    <svg className="w-full h-full" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ocean background */}
      <rect width="400" height="300" fill="#0c4a6e" fillOpacity="0.3"/>
      
      {/* Waves pattern */}
      <path d="M0 220 C50 200, 100 240, 150 220 C200 200, 250 240, 300 220 C350 200, 400 240, 450 220" 
        stroke="#0ea5e9" strokeWidth="2" strokeOpacity="0.3" fill="none"/>
      <path d="M0 240 C50 220, 100 260, 150 240 C200 220, 250 260, 300 240 C350 220, 400 260, 450 240" 
        stroke="#0ea5e9" strokeWidth="2" strokeOpacity="0.5" fill="none"/>
      
      {/* Main window/dashboard shape */}
      <rect x="50" y="40" width="300" height="220" rx="8" 
        className="fill-gray-800/50 stroke-cyan-500/20" strokeWidth="2"/>
      
      {/* Project showcase elements */}
      <rect x="70" y="60" width="260" height="60" rx="4" 
        className="fill-blue-500/20 stroke-blue-400/40" strokeWidth="2"/>
        
      <rect x="80" y="80" width="40" height="20" rx="2" 
        className="fill-cyan-500/30"/>
        
      <rect x="140" y="70" width="180" height="8" rx="4" 
        className="fill-cyan-500/20"/>
      <rect x="140" y="90" width="120" height="8" rx="4" 
        className="fill-cyan-500/20"/>
        
      <rect x="70" y="140" width="260" height="60" rx="4" 
        className="fill-blue-500/20 stroke-blue-400/40" strokeWidth="2"/>
        
      <rect x="80" y="160" width="40" height="20" rx="2" 
        className="fill-cyan-500/30"/>
        
      <rect x="140" y="150" width="180" height="8" rx="4" 
        className="fill-cyan-500/20"/>
      <rect x="140" y="170" width="120" height="8" rx="4" 
        className="fill-cyan-500/20"/>
      
      {/* Dolphin icon in corner */}
      <path d="M320 60 C325 50, 335 45, 345 50 C355 55, 360 45, 365 40 C370 35, 375 40, 370 45 C365 50, 355 60, 350 65 C345 70, 335 75, 325 70 C315 65, 315 70, 320 60Z" 
        fill="#22d3ee" fillOpacity="0.8" transform="scale(0.5) translate(450, 20)"/>
    </svg>
  ),

  Collaborate: () => (
    <svg className="w-full h-full" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ocean background */}
      <rect width="400" height="300" fill="#0c4a6e" fillOpacity="0.3"/>
      
      {/* Bubbles */}
      <circle cx="320" cy="80" r="15" fill="#22d3ee" fillOpacity="0.2"/>
      <circle cx="340" cy="50" r="10" fill="#22d3ee" fillOpacity="0.2"/>
      <circle cx="300" cy="60" r="5" fill="#22d3ee" fillOpacity="0.2"/>
      <circle cx="70" cy="230" r="12" fill="#22d3ee" fillOpacity="0.2"/>
      <circle cx="100" cy="250" r="8" fill="#22d3ee" fillOpacity="0.2"/>
      <circle cx="40" cy="210" r="6" fill="#22d3ee" fillOpacity="0.2"/>
      
      {/* Connection lines */}
      <path d="M200 150 C180 130, 140 130, 100 100" 
        className="stroke-cyan-400/50" strokeWidth="2" strokeDasharray="2 4"/>
      <path d="M200 150 C220 130, 260 130, 300 100" 
        className="stroke-cyan-400/50" strokeWidth="2" strokeDasharray="2 4"/>
      <path d="M200 150 C180 170, 140 170, 100 200" 
        className="stroke-cyan-400/50" strokeWidth="2" strokeDasharray="2 4"/>
      <path d="M200 150 C220 170, 260 170, 300 200" 
        className="stroke-cyan-400/50" strokeWidth="2" strokeDasharray="2 4"/>
      
      {/* Central node (person) */}
      <circle cx="200" cy="150" r="25" 
        className="fill-blue-500/30 stroke-cyan-400" strokeWidth="2"/>
      
      {/* Satellite nodes with dolphins */}
      <circle cx="100" cy="100" r="20" 
        className="fill-cyan-500/20 stroke-cyan-400" strokeWidth="2"/>
      <path d="M90 100 C95 90, 105 85, 115 90 C125 95, 130 85, 135 80 C140 75, 145 80, 140 85 C135 90, 125 100, 120 105 C115 110, 105 115, 95 110 C85 105, 85 110, 90 100Z" 
        fill="#22d3ee" fillOpacity="0.7" transform="scale(0.4) translate(125, 125)"/>
      
      <circle cx="300" cy="100" r="20" 
        className="fill-cyan-500/20 stroke-cyan-400" strokeWidth="2"/>
      <path d="M290 100 C295 90, 305 85, 315 90 C325 95, 330 85, 335 80 C340 75, 345 80, 340 85 C335 90, 325 100, 320 105 C315 110, 305 115, 295 110 C285 105, 285 110, 290 100Z" 
        fill="#22d3ee" fillOpacity="0.7" transform="scale(0.4) translate(550, 125)"/>
      
      <circle cx="100" cy="200" r="20" 
        className="fill-cyan-500/20 stroke-cyan-400" strokeWidth="2"/>
      <path d="M90 200 C95 190, 105 185, 115 190 C125 195, 130 185, 135 180 C140 175, 145 180, 140 185 C135 190, 125 200, 120 205 C115 210, 105 215, 95 210 C85 205, 85 210, 90 200Z" 
        fill="#22d3ee" fillOpacity="0.7" transform="scale(0.4) translate(125, 350)"/>
      
      <circle cx="300" cy="200" r="20" 
        className="fill-cyan-500/20 stroke-cyan-400" strokeWidth="2"/>
      <path d="M290 200 C295 190, 305 185, 315 190 C325 195, 330 185, 335 180 C340 175, 345 180, 340 185 C335 190, 325 200, 320 205 C315 210, 305 215, 295 210 C285 205, 285 210, 290 200Z" 
        fill="#22d3ee" fillOpacity="0.7" transform="scale(0.4) translate(550, 350)"/>
      
      {/* Simple person silhouette in center node */}
      <circle cx="200" cy="140" r="7" fill="#fff" fillOpacity="0.8"/>
      <path d="M200 148 L200 165 M190 155 L200 155 L210 155 M192 170 L200 165 L208 170" 
        stroke="#fff" strokeWidth="2" strokeOpacity="0.8" strokeLinecap="round"/>
    </svg>
  ),

  Innovate: () => (
    <svg className="w-full h-full" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ocean background */}
      <rect width="400" height="300" fill="#0c4a6e" fillOpacity="0.3"/>
      
      {/* Bubbles in the background */}
      <circle cx="320" cy="70" r="8" fill="#22d3ee" fillOpacity="0.2"/>
      <circle cx="350" cy="100" r="5" fill="#22d3ee" fillOpacity="0.2"/>
      <circle cx="330" cy="130" r="10" fill="#22d3ee" fillOpacity="0.2"/>
      <circle cx="60" cy="60" r="7" fill="#22d3ee" fillOpacity="0.2"/>
      <circle cx="80" cy="90" r="4" fill="#22d3ee" fillOpacity="0.2"/>
      <circle cx="40" cy="120" r="6" fill="#22d3ee" fillOpacity="0.2"/>
      
      {/* Project board */}
      <rect x="50" y="40" width="300" height="220" rx="8" 
        className="fill-gray-800/50 stroke-cyan-500/20" strokeWidth="2"/>
      
      {/* Header */}
      <rect x="70" y="60" width="260" height="30" rx="4" 
        className="fill-cyan-500/20"/>
      <rect x="85" y="72" width="120" height="6" rx="3" 
        className="fill-white/60"/>
      
      {/* Project cards */}
      <rect x="70" y="100" width="80" height="100" rx="4" 
        className="fill-blue-500/20 stroke-blue-400/30" strokeWidth="1"/>
      <rect x="80" y="110" width="60" height="6" rx="3" 
        className="fill-white/60"/>
      <rect x="80" y="122" width="40" height="4" rx="2" 
        className="fill-white/40"/>
      
      <rect x="160" y="100" width="80" height="100" rx="4" 
        className="fill-blue-500/20 stroke-blue-400/30" strokeWidth="1"/>
      <rect x="170" y="110" width="60" height="6" rx="3" 
        className="fill-white/60"/>
      <rect x="170" y="122" width="40" height="4" rx="2" 
        className="fill-white/40"/>
      
      <rect x="250" y="100" width="80" height="100" rx="4" 
        className="fill-blue-500/20 stroke-blue-400/30" strokeWidth="1"/>
      <rect x="260" y="110" width="60" height="6" rx="3" 
        className="fill-white/60"/>
      <rect x="260" y="122" width="40" height="4" rx="2" 
        className="fill-white/40"/>
      
      {/* Dolphin jumping between project cards */}
      <path d="M200 160 C205 150, 215 145, 225 150 C235 155, 240 145, 245 140 C250 135, 255 140, 250 145 C245 150, 235 160, 230 165 C225 170, 215 175, 205 170 C195 165, 195 170, 200 160Z" 
        fill="#22d3ee" fillOpacity="0.8" transform="scale(0.6) translate(180, 110)"/>
    </svg>
  )
};

// Feature Row Component
const FeatureRow = ({ icon, title, description, illustration: Illustration, reverse }) => (
  <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}>
    <div className="flex-1 space-y-4">
      <div className="text-cyan-400 text-3xl">{icon}</div>
      <h3 className="text-3xl font-semibold text-white">{title}</h3>
      <p className="text-xl text-gray-300">{description}</p>
    </div>
    <div className="flex-1">
      <div className="bg-blue-900/30 backdrop-blur-sm rounded-xl aspect-video overflow-hidden group hover:border-cyan-500/50 border border-blue-700/50 transition-all duration-300 shadow-lg">
        <Illustration />
      </div>
    </div>
  </div>
);

export default HomePage;