import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import ResearchHub from "./ResearchHub";
import { db, auth } from '../components/Firebase';
import { collection, doc, setDoc, deleteDoc } from "firebase/firestore";
import Bookmarks from "./Bookmarks";


const YEARS = ["all", "2024", "2023", "2022", "2021", "2020"];
const TYPES = ["all", "Research", "Capstone", "Community"];

const ResearchAssistant = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({ year: "all", type: "all" });
  const [bookmarks, setBookmarks] = useState([]);

  // Map UI types to backend collection types
  const mapTypeForBackend = (uiType) => {
    if (!uiType) return "research";
    const t = String(uiType).toLowerCase();
    if (t === "capstone") return "capstone";
    // default to research for 'all', 'research', 'community', etc.
    return "research";
  };

  useEffect(() => {
    const fetchDefault = async () => {
      try {
        const type = mapTypeForBackend(filters.type);
        const res = await fetch(`http://127.0.0.1:5000/default?type=${type}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDefault();
  }, [filters.type]);





  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const res = await fetch("http://127.0.0.1:5000/search", {
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

  const handleFilterChange = (field, value) => setFilters((f) => ({ ...f, [field]: value }));

  const filteredResults = results.filter((r) => {
    const matchYear = filters.year === "all" || String(r.year) === String(filters.year);
    // Backend currently doesn't always include a `type` field. If it exists, compare
    // case-insensitively; otherwise assume the backend already returned the
    // correct collection for the selected type.
    const matchType =
      filters.type === "all" ||
      (r.type ? String(r.type).toLowerCase() === String(filters.type).toLowerCase() : true);
    return matchYear && matchType;
  });

  // Use a URL-safe encoded key so Firestore document IDs are safe
  const makeKey = (paper) => encodeURIComponent(`${paper.title}||${paper.year}`);
  const isBookmarked = (paper) => bookmarks.includes(makeKey(paper));

  const toggleBookmark =async (paper) => {
    if (!auth.currentUser) return;

    const key = makeKey(paper);
    const ref=doc(db,"users",auth.currentUser.uid,"bookmarks",key)

    if(bookmarks.includes(key)){
      await deleteDoc(ref)
      setBookmarks(prev => prev.filter(k => k !== key));}
    else{
      await setDoc(ref,paper)
      setBookmarks(prev => [key, ...prev]);
    };
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-white text-slate-900">
      <ResearchHub />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Search for Research Papers</h1>
          <p className="mt-2 text-slate-600">Explore papers, then ask the AI for focused insights on any selected paper.</p>
        </header>

        {/* Search bar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex gap-3 items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search research papers, topics, or keywords…"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-300 text-sm"
            />
            <button
              onClick={handleSearch}
              className="inline-flex items-center px-5 py-3 rounded-xl bg-gradient-to-r from-sky-400 to-sky-300 text-white font-medium shadow-md hover:shadow-lg transition"
            >
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <aside className="lg:col-span-1 bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Filters</h3>

            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Year</div>
              <div className="space-y-2">
                {YEARS.map((y) => (
                  <label key={y} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="year"
                      value={y}
                      checked={filters.year === y}
                      onChange={() => handleFilterChange("year", y)}
                      className="w-4 h-4 rounded-full text-sky-500 focus:ring-sky-300"
                    />
                    <span className="text-sm text-slate-700">{y === "all" ? "All" : y}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Project Type</div>
              <div className="space-y-2">
                {TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      checked={filters.type === t}
                      onChange={() => handleFilterChange("type", t)}
                      className="w-4 h-4 rounded-full text-sky-500 focus:ring-sky-300"
                    />
                    <span className="text-sm text-slate-700">{t === "all" ? "All" : t}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredResults.map((result, idx) => (
                <article key={idx} className="bg-white rounded-2xl p-6 shadow hover:shadow-2xl transition transform hover:-translate-y-1 relative">
                  <button onClick={() => toggleBookmark(result)} className="absolute right-4 top-4 text-slate-400 hover:text-sky-500">
                    {isBookmarked(result) ? <FaBookmark className="text-sky-500" /> : <FaRegBookmark />}
                  </button>

                  <h4 className="text-lg font-semibold mb-1">{result.title}</h4>
                  <div className="text-sm text-slate-600 mb-3">{result.authors}</div>
                  <p className="text-sm text-slate-700 mb-4 line-clamp-3">{result.description}</p>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div>{result.university || "Unknown University"}</div>
                    <div>{result.year}</div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => navigate('/chat', { state: { paper: result } })}
                      className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-sky-400 text-white font-medium shadow hover:scale-[1.01] transition"
                    >
                      Ask AI for Insights
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ResearchAssistant;