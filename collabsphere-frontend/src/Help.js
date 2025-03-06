import React, { useState } from 'react';
import { FiSearch, FiBook, FiMessageSquare, FiMail, FiGithub, FiCode, FiUsers, FiUserPlus } from 'react-icons/fi';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: FiUserPlus },
    { id: 'projects', name: 'Projects', icon: FiCode },
    { id: 'collaboration', name: 'Collaboration', icon: FiUsers },
    { id: 'account', name: 'Account', icon: FiBook },
    { id: 'contact', name: 'Contact', icon: FiMessageSquare }
  ];

  const faqs = [
    {
      category: 'getting-started',
      question: 'How do I create an account?',
      answer: 'Click the "Sign Up" button in the top right corner. You\'ll need to provide your email, username, and password. After signing up, you\'ll need to verify your email address.'
    },
    {
      category: 'getting-started',
      question: 'How do I verify my email?',
      answer: 'After signing up, check your email for a verification link. Click the link to verify your account. If you don\'t see the email, check your spam folder.'
    },
    {
      category: 'projects',
      question: 'How do I create a new project?',
      answer: 'Click the "Create Post" button in the navigation bar. Choose your project type (Showcase, Seeking Contributors, or Looking to Join), fill in the details, and submit.'
    },
    {
      category: 'projects',
      question: 'What types of projects can I post?',
      answer: 'You can post three types of projects: Showcase (completed projects), Seeking Contributors (projects looking for collaborators), and Looking to Join (individuals looking for projects to join).'
    },
    {
      category: 'collaboration',
      question: 'How do I collaborate with others?',
      answer: 'Browse projects in your interest area, connect with project owners through the messaging system, and discuss collaboration opportunities.'
    },
    {
      category: 'account',
      question: 'How do I update my profile?',
      answer: 'Go to your profile page, click the edit button, and update your information, skills, and portfolio.'
    },
    {
      category: 'contact',
      question: 'How do I contact support?',
      answer: 'You can reach our support team by emailing sam@dolphdive.com'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Find answers to common questions and learn how to use DolphDive
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-blue-900/30 border border-blue-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
            <FiSearch className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-blue-900/30 text-gray-300 hover:bg-blue-800/30'
              }`}
            >
              <category.icon className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="bg-blue-900/30 rounded-lg p-6 border border-blue-700/50 hover:border-cyan-500/50 transition-all duration-200"
            >
              <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-gray-300">{faq.answer}</p>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Still need help?</h2>
          <p className="text-gray-300 mb-8">
            Our support team is here to assist you
          </p>
          <a
            href="mailto:sam@dolphdive.com"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200"
          >
            <FiMail className="w-5 h-5" />
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default Help;
