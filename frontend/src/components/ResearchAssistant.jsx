import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

import { db, auth } from "../components/Firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";

const YEARS = ["all", "2024", "2023", "2022", "2021", "2020"];
const TYPES = ["all", "Research", "Capstone", "Community"];

const DEFAULT_RESULTS_CACHE_KEY = "futurehive:pastResearch:defaultResults:v1";
const DEFAULT_RESULTS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const ResearchAssistant = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({ year: "all", type: "all" });
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [page, setPage] = useState(1);

  const pageSize = 10;

  const mapTypeForBackend = (uiType) => {
    if (!uiType) return "research";
    const t = String(uiType).toLowerCase();
    if (t === "all") return "all";
    if (t === "capstone") return "capstone";
    if (t === "research") return "research";
    return "research";
  };

  useEffect(() => {
    const controller = new AbortController();

    const readCache = () => {
      try {
        const raw = sessionStorage.getItem(DEFAULT_RESULTS_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.results) || typeof parsed.ts !== "number") {
          return null;
        }
        if (Date.now() - parsed.ts > DEFAULT_RESULTS_CACHE_TTL_MS) return null;
        return parsed.results;
      } catch {
        return null;
      }
    };

    const writeCache = (nextResults) => {
      try {
        sessionStorage.setItem(
          DEFAULT_RESULTS_CACHE_KEY,
          JSON.stringify({ ts: Date.now(), results: nextResults })
        );
      } catch {
        // Ignore storage failures
      }
    };

    const cached = readCache();
    if (cached) {
      setResults(cached);
      return () => controller.abort();
    }

    const fetchDefault = async () => {
      try {
        const res = await fetch(
          "http://127.0.0.1:5000/past/default?limit=1000&type=all",
          { signal: controller.signal }
        );

        if (res.ok) {
          const data = await res.json();
          const next = data.results || [];
          setResults(next);
          writeCache(next);
        }
      } catch (e) {
        if (e?.name === "AbortError") return;
        console.error(e);
      }
    };

    fetchDefault();
    return () => controller.abort();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const res = await fetch("http://127.0.0.1:5000/past/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          type: mapTypeForBackend(filters.type),
          limit: 100,
        }),
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
        ? String(r.type).toLowerCase() ===
          String(filters.type).toLowerCase()
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

  const bookmarkedResults = results.filter((r) =>
    bookmarks.includes(makeKey(r))
  );

  const activeResults = showBookmarks
    ? bookmarkedResults
    : filteredResults;

  useEffect(() => {
    setPage(1);
  }, [query, filters, results, showBookmarks]);

  const totalPages = Math.max(
    1,
    Math.ceil(activeResults.length / pageSize)
  );

  const paginatedResults = activeResults.slice(
    (page - 1) * pageSize,
    (page - 1) * pageSize + pageSize
  );

  return (
    <div className="w-full flex flex-col items-center px-4 md:px-8 py-8">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col items-center">
          <main className="w-full text-center">

            <header className="mb-8 text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">
                Explore Past Researches & Project Ideas
              </h1>
              <p className="mt-2 text-base md:text-lg text-slate-600">
                Browse previous research works and innovative project ideas.
              </p>
            </header>

            {/* Search */}
            <div className="max-w-3xl mx-auto mb-10">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search research papers..."
                  className="rounded-2xl w-full px-6 py-4 border shadow-sm outline-none"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <button
                    onClick={handleSearch}
                    className="bg-sky-600 text-white p-2 rounded-lg"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            <section className="mt-12 mb-8 bg-white border rounded-2xl shadow-lg px-6 py-8 text-left">
              <div className="mb-6 flex justify-between">
                <h2 className="text-xl font-bold text-blue-700">
                  Results
                </h2>
                <span className="text-sm text-slate-500">
                  {activeResults.length} found
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedResults.length === 0 ? (
                  <div className="col-span-full text-center text-slate-500 py-12">
                    No results found.
                  </div>
                ) : (
                  paginatedResults.map((result, idx) => (
                    <article
                      key={idx}
                      className="bg-white rounded-2xl p-6 shadow relative border"
                    >
                      <button
                        onClick={() => toggleBookmark(result)}
                        className="absolute right-4 top-4"
                      >
                        {isBookmarked(result) ? (
                          <FaBookmark className="text-sky-500" />
                        ) : (
                          <FaRegBookmark />
                        )}
                      </button>

                      <h4 className="text-lg font-semibold mb-1">
                        {result.title}
                      </h4>
                      <div className="text-sm text-slate-600 mb-3">
                        {result.authors}
                      </div>
                      <p className="text-sm text-slate-700 mb-4">
                        {result.description}
                      </p>

                      <div className="flex justify-between text-sm text-slate-500">
                        <div>Sabaragamuwa University Of SriLanka</div>
                        <div>{result.year}</div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() =>
                            navigate("/chat", {
                              state: {
                                paper: result,
                                source: "research",
                              },
                            })
                          }
                          className="px-5 py-2 rounded-lg bg-sky-500 text-white"
                        >
                          Ask AI for Insights
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
};

export default ResearchAssistant;