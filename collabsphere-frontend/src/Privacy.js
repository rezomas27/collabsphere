import React from 'react';
import { FiShield, FiDatabase, FiUser, FiLock, FiShare2, FiTrash2 } from 'react-icons/fi';

const Privacy = () => {
  const sections = [
    {
      title: "Information We Collect",
      icon: FiDatabase,
      content: [
        {
          subtitle: "Account Information",
          details: [
            "Username and email address",
            "Profile information (bio, skills, interests)",
            "Project posts and contributions",
            "Comments and interactions"
          ]
        },
        {
          subtitle: "Technical Data",
          details: [
            "IP address",
            "Browser information",
            "Device type",
            "Usage data (pages visited, time spent)"
          ]
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: FiUser,
      content: [
        {
          subtitle: "Core Functions",
          details: [
            "Creating and managing your account",
            "Displaying your project posts",
            "Enabling collaboration features",
            "Facilitating communication between users"
          ]
        },
        {
          subtitle: "Service Improvement",
          details: [
            "Debugging and fixing issues",
            "Improving user experience",
            "Analyzing usage patterns",
            "Enhancing security"
          ]
        }
      ]
    },
    {
      title: "Data Protection",
      icon: FiShield,
      content: [
        {
          subtitle: "Security Measures",
          details: [
            "Password hashing",
            "Secure data transmission",
            "Regular security updates",
            "Protected user sessions"
          ]
        },
        {
          subtitle: "Data Storage",
          details: [
            "User data stored in secure databases",
            "Project data maintained as long as needed",
            "Comments and interactions preserved",
            "Profile information retained until account deletion"
          ]
        }
      ]
    },
    {
      title: "Your Rights",
      icon: FiLock,
      content: [
        {
          subtitle: "Account Control",
          details: [
            "Edit your profile information",
            "Delete your posts",
            "Remove your comments",
            "Delete your account"
          ]
        },
        {
          subtitle: "Data Access",
          details: [
            "View your posted projects",
            "Access your profile data",
            "Review your interactions",
            "Export your account data"
          ]
        }
      ]
    },
    {
      title: "Data Sharing",
      icon: FiShare2,
      content: [
        {
          subtitle: "Public Information",
          details: [
            "Your project posts are publicly visible",
            "Profile information is viewable by other users",
            "Comments are visible to all users",
            "Username appears with your contributions"
          ]
        },
        {
          subtitle: "Private Information",
          details: [
            "Email address is kept private",
            "Password is never shared",
            "Personal information is protected",
            "Communication between users is private"
          ]
        }
      ]
    },
    {
      title: "Account Deletion",
      icon: FiTrash2,
      content: [
        {
          subtitle: "Deletion Process",
          details: [
            "Request through account settings",
            "Confirmation required",
            "Permanent removal of account",
            "Posts and comments remain unless deleted"
          ]
        },
        {
          subtitle: "Data Retention",
          details: [
            "Account data removed immediately",
            "Posts can be deleted individually",
            "Comments can be removed separately",
            "No recovery after deletion"
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
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-300">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-blue-900/30 rounded-xl p-6 border border-blue-700/50 mb-8">
          <p className="text-gray-300">
            This Privacy Policy describes how DolphDive ("we," "our," or "us") collects, uses, and 
            protects your information when you use our platform. DolphDive is a project collaboration 
            platform that allows users to showcase their projects, seek collaborators, and connect with 
            other developers. By using DolphDive, you agree to the collection and use of information 
            in accordance with this policy.
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

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-300 mb-4">
            If you have any questions about this Privacy Policy or your data, please contact us at:
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

export default Privacy; 