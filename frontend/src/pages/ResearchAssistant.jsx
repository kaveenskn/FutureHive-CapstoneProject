import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ResearchAssistant = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(""); // State to store the search query
  const [results, setResults] = useState([]); // State to store the search results
  const [filters, setFilters] = useState({
    year: "all",
    type: "all",
  });

  useEffect(() => {
    // Fetch default values when the component mounts
    const fetchDefaultResults = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/default", {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Default results:", data.results); // Debugging
          setResults(data.results); // Set default results
        } else {
          console.error("Error fetching default results:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchDefaultResults();
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters({ ...filters, [filterType]: value });
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      alert("Please enter a search query.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }), // Send the search query to the backend
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Search results:", data.results); // Debugging
        setResults(data.results); // Update the results state
      } else {
        console.error("Error fetching search results:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const filteredResults = results.filter((result) => {
    const matchesYear =
      filters.year === "all" || result.year === parseInt(filters.year);
    const matchesType =
      filters.type === "all" || result.type === filters.type;
    return matchesYear && matchesType;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Search Bar Section */}
      <div className="bg-white p-6 shadow-md">
        <h1 className="text-2xl font-bold mb-4">Search for Research Papers</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search research papers, topics, or keywords…"
            className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-1/4 bg-white p-4 shadow-md">
          <h2 className="text-xl font-bold mb-4">Filters</h2>

          {/* Year Filter */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Year</h3>
            {["all", "2023", "2022", "2021", "2020"].map((year) => (
              <label key={year} className="block mb-1">
                <input
                  type="radio"
                  name="year"
                  value={year}
                  checked={filters.year === year}
                  onChange={(e) => handleFilterChange("year", e.target.value)}
                  className="mr-2"
                />
                {year === "all" ? "All" : year}
              </label>
            ))}
          </div>

          {/* Project Type Filter */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Project Type</h3>
            {["all", "Research", "Capstone", "Community"].map((type) => (
              <label key={type} className="block mb-1">
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={filters.type === type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="mr-2"
                />
                {type === "all" ? "All" : type}
              </label>
            ))}
          </div>
        </aside>

        {/* Research Papers */}
        <main className="flex-1 p-6">
          <div className="space-y-6">
            {filteredResults.map((result, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md w-full">
                <h3 className="text-lg font-bold mb-2">{result.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{result.authors}</p>
                <p className="text-sm text-gray-700 mb-4">{result.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{result.university || "Unknown University"}</span>
                  <span>{result.year}</span>
                </div>
                <div className="flex flex-col lg:flex-row gap-4">
                  <button className="bg-blue-600 flex-1 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    View Full Paper
                  </button>
                  <button onClick={() => navigate('/chat', { state: { paper: result } })} className="border border-blue-600 flex-1 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50">
                    Ask AI for Insights
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResearchAssistant;