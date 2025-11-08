import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TopicSparkBody = () => {
  const [selectedType, setSelectedType] = useState("all");
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const types = [
    { id: "all", label: "All Types" },
    { id: "research", label: "Research" },
    { id: "capstone", label: "Capstone" },
  ];

  // ⚙️ Helper function to map topic data
  const mapTopics = (topics = []) =>
    topics.map((t, idx) => ({
      id: t.id || encodeURIComponent((t.title || "") + "-" + idx),
      title: t.title || "Untitled",
      description: t.description || "",
      type: t.type
        ? String(t.type).charAt(0).toUpperCase() + String(t.type).slice(1)
        : "Research",
      tags: t.tags || [],
      isHot: t.isHot || false,
    }));

  // ✅ Fetch all topics (with pagination)
  const fetchTopics = async (pageNumber = 1, append = false) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/topicspark?page=${pageNumber}&limit=6`
      );
      const data = await res.json();
      const topics = data.topics || data;
      const mapped = mapTopics(topics);

      if (mapped.length === 0) setHasMore(false);
      setProjects((prev) => (append ? [...prev, ...mapped] : mapped));
    } catch (e) {
      console.error("Error fetching topics:", e);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // ✅ Handle search (with backend)
  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/topicspark/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        const data = await res.json();
        const topics = data.topics || data;
        const mapped = mapTopics(topics);
        setProjects(mapped);
        setHasMore(false);
      }
    } catch (e) {
      console.error("Error searching topics:", e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter by project type
  const filteredProjects =
    selectedType === "all"
      ? projects
      : projects.filter(
          (p) => p.type.toLowerCase() === selectedType.toLowerCase()
        );

  const navigateToChatbot = (project) => {
    navigate("/chat", { state: { paper: project } });
  };

  return (
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="md:text-5xl mb-4 text-4xl font-bold text-gray-900">
            Explore Trending Topics in
          </h1>
          <h1 className="md:text-5xl mb-6 text-4xl font-bold text-blue-600">
            FutureHive
          </h1>
          <p className="max-w-3xl mx-auto mb-8 text-xl text-gray-600">
            Discover what's hot in AI, Blockchain, Sustainability, and more.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search research topics and capstone projects..."
              className="rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full px-6 py-4 text-lg transition-all border border-gray-300 shadow-sm outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <div className="right-3 top-1/2 absolute transform -translate-y-1/2">
              <button
                className="hover:bg-blue-700 p-2 text-white transition-colors bg-blue-600 rounded-lg"
                onClick={handleSearch}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="mb-6">
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-500 uppercase">
              Project Type
            </h3>
            <div className="flex flex-wrap gap-3">
              {types.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-6 py-3 rounded-lg border transition-all ${
                    selectedType === type.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-600 hover:text-blue-600"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Showing {filteredProjects.length} results
          </h2>
        </div>

        {/* ⚡ Loading Animation */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 text-lg font-medium">
              Fetching latest topics...
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && filteredProjects.length > 0 && (
          <div className="md:grid-cols-3 grid grid-cols-1 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col justify-between rounded-xl hover:shadow-md p-6 transition-all duration-300 bg-white border border-gray-200 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        project.type === "Research"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {project.type}
                    </span>
                    {project.isHot && (
                      <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                        HOT
                      </span>
                    )}
                  </div>
                  {project.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium text-orange-600 bg-orange-100 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  {project.title}
                </h3>
                <p className="mb-6 leading-relaxed text-gray-600">
                  {project.description}
                </p>

                <button
                  onClick={() => navigateToChatbot(project)}
                  className="bg-blue-600 hover:bg-blue-700 hover:scale-105 w-full px-4 py-3 font-semibold text-white transition-all duration-300 transform rounded-lg shadow-md mb-0"
                >
                  Explore Project
                </button>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && filteredProjects.length === 0 && (
          <div className="text-center text-gray-500 text-lg py-10">
            No topics found.
          </div>
        )}

        {/* Load More */}
        {!loading && hasMore && (
          <div className="mt-12 text-center">
            <button
              className="hover:bg-blue-50 px-8 py-3 font-semibold text-blue-600 transition-colors bg-white border border-blue-600 rounded-lg shadow-md"
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchTopics(nextPage, true);
              }}
            >
              Load More Projects
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default TopicSparkBody;
