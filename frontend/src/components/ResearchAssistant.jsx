import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

import { db, auth } from "../components/Firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";

const YEARS = ["all", "2024", "2023", "2022", "2021", "2020"];
const TYPES = ["all", "Research", "Capstone", "Community"];

const ResearchAssistant = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({ year: "all", type: "all" });
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const mapTypeForBackend = (uiType) => {
    if (!uiType) return "research";
    const t = String(uiType).toLowerCase();
    if (t === "capstone") return "capstone";
    return "research";
  };

  useEffect(() => {
    const fetchDefault = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/past/default");
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDefault();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const res = await fetch("http://127.0.0.1:5000/past/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, type: mapTypeForBackend(filters.type) }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFilterChange = (field, value) =>
    setFilters((f) => ({ ...f, [field]: value }));

  const filteredResults = results.filter((r) => {
    const matchYear =
      filters.year === "all" || String(r.year) === String(filters.year);
    const matchType =
      filters.type === "all" ||
      (r.type
        ? String(r.type).toLowerCase() === String(filters.type).toLowerCase()
        : true);
    return matchYear && matchType;
  });

  const makeKey = (paper) =>
    encodeURIComponent(`${paper.title}||${paper.year}`);
  const isBookmarked = (paper) => bookmarks.includes(makeKey(paper));

  const toggleBookmark = async (paper) => {
    if (!auth.currentUser) return;

    const key = makeKey(paper);
    const ref = doc(db, "users", auth.currentUser.uid, "bookmarks", key);

    if (bookmarks.includes(key)) {
      await deleteDoc(ref);
      setBookmarks((prev) => prev.filter((k) => k !== key));
    } else {
      await setDoc(ref, paper);
      setBookmarks((prev) => [key, ...prev]);
    }
  };

  const handleShowBookmarks = () => {
    setShowBookmarks((prev) => !prev);
  };

  const bookmarkedResults = results.filter((r) => bookmarks.includes(makeKey(r)));

  return (
    <div className="w-full flex flex-col items-center px-4 md:px-8 py-8"> {/* Adjusted for responsiveness */}
      <div className="w-full max-w-6xl">
        <div className="flex flex-col items-center">
          <main className="w-full text-center">
            <header className="mb-8 text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">
                Explore Past Researches & Project Ideas
              </h1>
              <p className="mt-2 text-base md:text-lg text-slate-600">
                Browse previous research works and innovative project ideas. Use filters or search to find inspiration and details for your next academic or creative endeavor.
              </p>
            </header>

            {/* Search bar */}
            <div className="max-w-3xl mx-auto mb-10">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search research papers, topics, or keywords…"
                  className="rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent w-full px-6 py-4 text-sm md:text-lg transition-all border border-gray-300 shadow-sm outline-none"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <button
                    onClick={handleSearch}
                    className="hover:bg-sky-700 p-2 text-white transition-colors bg-sky-600 rounded-lg"
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
            <div className="max-w-3xl mx-auto mb-8">
              {/* Year Filter */}
              <div className="mb-6 text-left">
                <h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                  Year
                </h3>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {YEARS.map((year) => (
                    <button
                      key={year}
                      onClick={() => handleFilterChange("year", year)}
                      className={`px-4 md:px-5 py-2.5 rounded-lg border transition-all ${
                        filters.year === year
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-600 hover:text-blue-600"
                      }`}
                    >
                      {year === "all" ? "All Years" : year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Type Filter */}
              <div>
                <h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase text-left">
                  Project Type
                </h3>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange("type", type)}
                      className={`px-4 md:px-5 py-2.5 rounded-lg border transition-all ${
                        filters.type === type
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-600 hover:text-blue-600"
                      }`}
                    >
                      {type === "all" ? "All Types" : type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Section */}
            <section className="mt-12 mb-8 bg-white/90 border border-blue-100 rounded-2xl shadow-lg w-full px-2 md:px-6 py-8 text-left">
              <div className="mb-6 flex flex-col md:flex-row items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-blue-700">Results</h2>
                <span className="text-sm text-slate-500">{filteredResults.length} found</span>
              </div>

              {/* Bookmarks Toggle Button */}
              <div className="mb-4 flex justify-center md:justify-end">
                <button
                  onClick={handleShowBookmarks}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {showBookmarks ? "Show All" : "Bookmarks"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(showBookmarks ? bookmarkedResults : filteredResults).length === 0 ? (
                  <div className="col-span-full text-center text-slate-500 py-12 text-lg">No results found. Try adjusting your search or filters.</div>
                ) : (
                  (showBookmarks ? bookmarkedResults : filteredResults).map((result, idx) => (
                    <article
                      key={idx}
                      className="bg-white rounded-2xl p-6 shadow hover:shadow-2xl transition-transform duration-300 ease-out [transform:perspective(1000px)] hover:[transform:perspective(1000px)_translateY(-6px)_rotateX(2deg)_rotateY(-2deg)] relative border border-gray-200"
                    >
                      <button
                        onClick={() => toggleBookmark(result)}
                        className="absolute right-4 top-4 text-slate-400 hover:text-sky-500"
                      >
                        {isBookmarked(result) ? (
                          <FaBookmark className="text-sky-500" />
                        ) : (
                          <FaRegBookmark />
                        )}
                      </button>

                      <h4 className="text-lg font-semibold mb-1">{result.title}</h4>
                      <div className="text-sm text-slate-600 mb-3">
                        {result.authors}
                      </div>
                      <p className="text-sm text-slate-700 mb-4 line-clamp-3">
                        {result.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <div>{result.university || "Unknown University"}</div>
                        <div>{result.year}</div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() =>
                            navigate("/chat", { state: { paper: result, source: "research" } })
                          }
                          className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-sky-400 text-white font-medium shadow hover:scale-[1.01] transition"
                        >
                          Ask AI for Insights
                        </button>
                      </div>
                    </article>
                  )))
                }
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ResearchAssistant;
