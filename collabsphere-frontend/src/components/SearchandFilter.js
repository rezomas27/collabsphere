import React from 'react';

const SearchAndFilter = ({ searchQuery, setSearchQuery, selectedType, setSelectedType }) => {
  const postTypes = [
    { value: '', label: 'All Posts' },
    { value: 'showcase', label: 'Showcase' },
    { value: 'seeking-contributors', label: 'Seeking Contributors' },
    { value: 'looking-to-join', label: 'Looking to Join' }
  ];

  return (
    <div className="mb-8 space-y-4">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
        />
        <svg 
          className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {postTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${selectedType === type.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchAndFilter;