import React from 'react';
import { FiShield, FiSettings, FiInfo, FiDatabase } from 'react-icons/fi';

const Cookies = () => {
  const sections = [
    {
      title: "What Are Cookies",
      icon: FiDatabase,
      content: [
        {
          subtitle: "Definition",
          details: [
            "Small text files stored on your device",
            "Used to enhance your browsing experience",
            "Help us understand how you use our site",
            "Essential for certain features to work"
          ]
        }
      ]
    },
    {
      title: "Cookies We Use",
      icon: FiInfo,
      content: [
        {
          subtitle: "Essential Cookies",
          details: [
            "Authentication cookies (for login)",
            "Session management",
            "Security features",
            "Cannot be disabled"
          ]
        },
        {
          subtitle: "Functional Cookies",
          details: [
            "User preferences",
            "Language settings",
            "Theme preferences",
            "Can be disabled"
          ]
        },
        {
          subtitle: "Analytics Cookies",
          details: [
            "Page visit tracking",
            "Feature usage statistics",
            "Error reporting",
            "Performance monitoring"
          ]
        }
      ]
    },
    {
      title: "How We Use Cookies",
      icon: FiSettings,
      content: [
        {
          subtitle: "Primary Uses",
          details: [
            "Keep you logged in",
            "Remember your preferences",
            "Improve site performance",
            "Enhance security"
          ]
        },
        {
          subtitle: "Secondary Uses",
          details: [
            "Analyze site usage",
            "Debug technical issues",
            "Improve user experience",
            "Prevent fraud"
          ]
        }
      ]
    },
    {
      title: "Cookie Management",
      icon: FiShield,
      content: [
        {
          subtitle: "Browser Settings",
          details: [
            "Control cookie settings in your browser",
            "Delete cookies at any time",
            "Block certain types of cookies",
            "Manage cookie preferences"
          ]
        },
        {
          subtitle: "Platform Settings",
          details: [
            "Update preferences in your account",
            "Opt out of non-essential cookies",
            "Clear site data",
            "Manage privacy settings"
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Cookie Policy
          </h1>
          <p className="text-xl text-gray-300">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-blue-900/30 rounded-xl p-6 border border-blue-700/50 mb-8">
          <p className="text-gray-300">
            This Cookie Policy explains how DolphDive uses cookies and similar technologies 
            to recognize you when you visit our platform. It explains what these technologies 
            are and why we use them, as well as your rights to control our use of them.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div 
              key={index}
              className="bg-blue-900/30 rounded-xl p-6 border border-blue-700/50 hover:border-cyan-500/50 transition-all duration-200"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  {section.title}
                </h2>
              </div>
              
              <div className="space-y-6">
                {section.content.map((item, idx) => (
                  <div key={idx} className="ml-16">
                    <h3 className="text-lg font-medium text-cyan-400 mb-3">
                      {item.subtitle}
                    </h3>
                    <ul className="space-y-2">
                      {item.details.map((detail, detailIdx) => (
                        <li key={detailIdx} className="flex items-center text-gray-300">
                          <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Cookie Duration */}
        <div className="mt-8 bg-blue-900/30 rounded-xl p-6 border border-blue-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">Cookie Duration</h2>
          <p className="text-gray-300">
            The cookies we use typically last for the duration of your session or for a 
            limited period after you close your browser. Some cookies may persist longer 
            if you choose to stay logged in or if required for security purposes.
          </p>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-300 mb-4">
            If you have any questions about our use of cookies, please contact us at:
          </p>
          <a 
            href="mailto:sam@dolphdive.com"
            className="text-cyan-400 hover:text-cyan-300 text-lg font-medium transition-colors"
          >
            sam@dolphdive.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default Cookies; 