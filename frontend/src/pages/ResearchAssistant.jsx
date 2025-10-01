import React, { useState } from 'react';

const ResearchAssistant = () => {
  const [filters, setFilters] = useState({
    year: 'all', // Default to "all" to show all papers
  });

  const [papers, setPapers] = useState([
    {
      id: 1,
      title: 'Advancements in Machine Learning',
      authors: 'John Doe, Jane Smith',
      description: 'A comprehensive study on the latest advancements in machine learning.',
      university: 'MIT',
      year: 2023,
      tags: ['Machine Learning'],
    },
    {
      id: 2,
      title: 'Quantum Computing Breakthroughs',
      authors: 'Alice Johnson, Bob Brown',
      description: 'Exploring the recent breakthroughs in quantum computing.',
      university: 'Stanford University',
      year: 2022,
      tags: ['Quantum Computing'],
    },
    {
      id: 3,
      title: 'Nanotechnology in Medicine',
      authors: 'Emily White, Michael Green',
      description: 'The role of nanotechnology in advancing medical treatments.',
      university: 'Harvard University',
      year: 2021,
      tags: ['Nanotechnology'],
    },
    {
      id: 4,
      title: 'Artificial Intelligence and Climate Change',
      authors: 'Sarah Blue, David Black',
      description: 'How AI is being used to combat climate change.',
      university: 'University of Cambridge',
      year: 2020,
      tags: ['Artificial Intelligence', 'Climate Change'],
    },
  ]);

  const handleFilterChange = (filterType, value) => {
    setFilters({ ...filters, [filterType]: value });
  };

  const filteredPapers = papers.filter((paper) => {
    const matchesYear = filters.year === 'all' || paper.year === parseInt(filters.year);
    return matchesYear;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/4 bg-white p-4 shadow-md">
        <h2 className="text-xl font-bold mb-4">Filters</h2>

        {/* Year Filter */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Year</h3>
          {['all', '2023', '2022', '2021', '2020'].map((year) => (
            <label key={year} className="block mb-1">
              <input
                type="radio"
                name="year"
                value={year}
                checked={filters.year === year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="mr-2"
              />
              {year === 'all' ? 'All' : year}
            </label>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Search Bar */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Search research papers, topics, or keywords…"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700">
            Search
          </button>
        </div>

        {/* Research Papers */}
        <div className="space-y-6">
          {filteredPapers.map((paper) => (
            <div key={paper.id} className="bg-white p-6 rounded-lg shadow-md w-full">
              <h3 className="text-lg font-bold mb-2">{paper.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{paper.authors}</p>
              <p className="text-sm text-gray-700 mb-4">{paper.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{paper.university}</span>
                <span className='font-semibold'>{paper.year}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {paper.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-col lg:flex-row gap-4">
                <button className="bg-blue-600 flex-1 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  View Full Paper
                </button>
                <button className="border border-blue-600 flex-1 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50">
                  Get Recommendations
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ResearchAssistant;