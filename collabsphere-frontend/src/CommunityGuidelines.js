import React from 'react';
import { FiUsers, FiShield, FiMessageSquare, FiCode, FiUserX } from 'react-icons/fi';

const CommunityGuidelines = () => {
  const guidelines = [
    {
      title: "Respectful Communication",
      icon: FiMessageSquare,
      description: "Maintain professional and respectful communication with all members. Avoid harassment, hate speech, or discriminatory language.",
      details: [
        "Use inclusive language",
        "Be constructive in feedback",
        "Avoid personal attacks",
        "Respect different perspectives"
      ]
    },
    {
      title: "Project Collaboration",
      icon: FiCode,
      description: "Follow best practices when collaborating on projects and interacting with other developers.",
      details: [
        "Clearly communicate project requirements",
        "Set realistic timelines",
        "Provide regular updates",
        "Give credit where due"
      ]
    },
    {
      title: "Content Guidelines",
      icon: FiShield,
      description: "Ensure all content posted is appropriate and follows our standards.",
      details: [
        "No spam or self-promotion",
        "No malicious code or links",
        "No copyrighted material",
        "No inappropriate content"
      ]
    },
    {
      title: "Account Behavior",
      icon: FiUsers,
      description: "Maintain professional conduct in all interactions on the platform.",
      details: [
        "Use authentic information",
        "Maintain one account per person",
        "Report suspicious activity",
        "Follow platform rules"
      ]
    },
    {
      title: "Consequences",
      icon: FiUserX,
      description: "Understand the potential consequences of violating these guidelines.",
      details: [
        "Warning system for minor violations",
        "Temporary suspension for repeated violations",
        "Permanent ban for severe violations",
        "Appeal process available"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Community Guidelines
          </h1>
          <p className="text-xl text-gray-300">
            Help us maintain a positive and productive environment for all members
          </p>
        </div>

        {/* Guidelines */}
        <div className="space-y-8">
          {guidelines.map((guideline, index) => (
            <div 
              key={index}
              className="bg-blue-900/30 rounded-xl p-6 border border-blue-700/50 hover:border-cyan-500/50 transition-all duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <guideline.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-3">
                    {guideline.title}
                  </h2>
                  <p className="text-gray-300 mb-4">
                    {guideline.description}
                  </p>
                  <ul className="space-y-2">
                    {guideline.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center text-gray-300">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-300 mb-4">
            If you have questions about these guidelines or need to report a violation, please contact us at:
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

export default CommunityGuidelines; 