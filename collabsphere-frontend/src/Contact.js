import React from 'react';
import { FiMail, FiMessageSquare } from 'react-icons/fi';

const Contact = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-300">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Options */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-blue-900/30 rounded-xl p-8 border border-blue-700/50 hover:border-cyan-500/50 transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <FiMail className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Email Us</h2>
                <p className="text-gray-300 mb-4">
                  For any inquiries, support, or collaboration opportunities, please reach out to us at:
                </p>
                <a 
                  href="mailto:sam@dolphdive.com"
                  className="text-cyan-400 hover:text-cyan-300 text-lg font-medium transition-colors"
                >
                  sam@dolphdive.com
                </a>
              </div>

              <div className="w-full border-t border-blue-700/50 my-6"></div>

              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Response Time</h2>
                <p className="text-gray-300">
                  We typically respond to all inquiries within 24-48 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 