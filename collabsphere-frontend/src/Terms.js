import React from 'react';
import { FiFileText, FiUser, FiCode, FiShield, FiAlertCircle, FiCheck } from 'react-icons/fi';

const Terms = () => {
  const sections = [
    {
      title: "Acceptance of Terms",
      icon: FiFileText,
      content: [
        {
          subtitle: "Agreement",
          details: [
            "By accessing or using DolphDive, you agree to be bound by these Terms of Service",
            "If you disagree with any part of these terms, you may not access the service",
            "These terms apply to all users of the platform",
            "We reserve the right to modify these terms at any time"
          ]
        }
      ]
    },
    {
      title: "User Accounts",
      icon: FiUser,
      content: [
        {
          subtitle: "Account Creation",
          details: [
            "You must be at least 13 years old to create an account",
            "Provide accurate and complete information",
            "Maintain the security of your account",
            "You are responsible for all activities under your account"
          ]
        },
        {
          subtitle: "Account Responsibilities",
          details: [
            "Keep your password confidential",
            "Notify us immediately of any security breaches",
            "Don't share your account credentials",
            "Don't create multiple accounts"
          ]
        }
      ]
    },
    {
      title: "Project Guidelines",
      icon: FiCode,
      content: [
        {
          subtitle: "Project Posts",
          details: [
            "Projects must be your own work or properly attributed",
            "No malicious code or harmful content",
            "No spam or self-promotion",
            "Respect intellectual property rights"
          ]
        },
        {
          subtitle: "Collaboration",
          details: [
            "Maintain professional conduct in project discussions",
            "Respect other users' time and contributions",
            "Provide clear project requirements",
            "Communicate openly about project status"
          ]
        }
      ]
    },
    {
      title: "User Conduct",
      icon: FiShield,
      content: [
        {
          subtitle: "Prohibited Activities",
          details: [
            "Harassment or bullying of other users",
            "Posting inappropriate or offensive content",
            "Attempting to breach platform security",
            "Using the platform for illegal purposes"
          ]
        },
        {
          subtitle: "Content Standards",
          details: [
            "No hate speech or discrimination",
            "No false or misleading information",
            "No unauthorized commercial use",
            "No distribution of malware"
          ]
        }
      ]
    },
    {
      title: "Intellectual Property",
      icon: FiAlertCircle,
      content: [
        {
          subtitle: "Your Content",
          details: [
            "You retain rights to your posted content",
            "You grant us license to display your content",
            "You are responsible for your content",
            "You must have rights to post content"
          ]
        },
        {
          subtitle: "Platform Content",
          details: [
            "DolphDive content is protected by copyright",
            "Don't copy or reproduce platform content",
            "Respect our intellectual property",
            "Report copyright violations"
          ]
        }
      ]
    },
    {
      title: "Termination",
      icon: FiCheck,
      content: [
        {
          subtitle: "Account Termination",
          details: [
            "We may terminate accounts for violations",
            "You may delete your account at any time",
            "Some content may remain after deletion",
            "Termination doesn't affect legal obligations"
          ]
        },
        {
          subtitle: "Service Changes",
          details: [
            "We may modify or discontinue services",
            "We'll notify users of significant changes",
            "Some features may be limited or removed",
            "Updates may affect functionality"
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
            Terms of Service
          </h1>
          <p className="text-xl text-gray-300">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-blue-900/30 rounded-xl p-6 border border-blue-700/50 mb-8">
          <p className="text-gray-300">
            Welcome to DolphDive. These Terms of Service govern your use of our platform, 
            which provides a space for developers to showcase projects, seek collaborators, 
            and connect with other developers. By using DolphDive, you agree to these terms 
            and our Privacy Policy.
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

        {/* Disclaimer */}
        <div className="mt-12 bg-blue-900/30 rounded-xl p-6 border border-blue-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">Disclaimer</h2>
          <p className="text-gray-300">
            DolphDive is provided "as is" without any warranties. We are not responsible 
            for any damages arising from your use of our service. We do not guarantee 
            the accuracy, completeness, or usefulness of any content on the platform.
          </p>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-300 mb-4">
            If you have any questions about these Terms of Service, please contact us at:
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

export default Terms; 