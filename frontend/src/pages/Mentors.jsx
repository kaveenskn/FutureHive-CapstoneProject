import React, { useEffect, useMemo, useState } from "react";
import MentorCard from "../components/MentorCard";
import FiltersPanel from "../components/FiltersPanel";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

const YEARS = ["all", "2024", "2023", "2022", "2021", "2020"];
const TYPES = ["all", "Technical", "Management", "Creative"];

export default function Mentors() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    year: "all",
    type: "all",
    expertise: "",
    minExperience: 0,
    availability: "",
    sort: "relevance",
  });
  const [sampleMentors, setSampleMentors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);

  useEffect(() => {
    const fetchDefault = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/mentors/default", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const data = await response.json();
          setSampleMentors(data);
        } else {
          console.error("Failed to fetch mentors");
        }
      } catch (error) {
        console.error("Error fetching mentors:", error);
      }
    };

    fetchDefault();
  }, []);

  const expertiseOptions = useMemo(
    () => Array.from(new Set(sampleMentors.flatMap((m) => m.expertise || []))),
    [sampleMentors]
  );

  const filteredResults = sampleMentors.filter((m) => {
    const matchYear =
      filters.year === "all" || String(m.year) === String(filters.year);
    const matchType =
      filters.type === "all" ||
      (m.type
        ? String(m.type).toLowerCase() === String(filters.type).toLowerCase()
        : true);
    const matchExpertise =
      !filters.expertise || m.expertise.includes(filters.expertise);
    const matchExperience =
      !filters.minExperience || m.experience >= filters.minExperience;
    const matchAvailability =
      !filters.availability || m.availability === filters.availability;

    return (
      matchYear &&
      matchType &&
      matchExpertise &&
      matchExperience &&
      matchAvailability
    );
  });

  const makeKey = (mentor) => encodeURIComponent(`${mentor.name}||${mentor.id}`);
  const isBookmarked = (mentor) => bookmarks.includes(makeKey(mentor));

  const toggleBookmark = (mentor) => {
    const key = makeKey(mentor);
    if (bookmarks.includes(key)) {
      setBookmarks((prev) => prev.filter((k) => k !== key));
    } else {
      setBookmarks((prev) => [key, ...prev]);
    }
  };

  const handleShowBookmarks = () => {
    setShowBookmarks((prev) => !prev);
  };

  const bookmarkedResults = sampleMentors.filter((m) => bookmarks.includes(makeKey(m)));

  return (
    <div className="w-full flex flex-col items-center px-4 md:px-8 py-8">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col items-center">
          <main className="w-full text-center">
            <header className="mb-8 text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">
                Find a Mentor
              </h1>
              <p className="mt-2 text-base md:text-lg text-slate-600">
                Search mentors by expertise, skill, or topic. Use filters or search to find the perfect mentor for your needs.
              </p>
            </header>

            {/* Search bar */}
            <div className="max-w-3xl mx-auto mb-10">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search mentors, e.g. 'Machine Learning', 'Data Mining'"
                  className="rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent w-full px-6 py-4 text-sm md:text-lg transition-all border border-gray-300 shadow-sm outline-none"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <button
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
                      onClick={() => setFilters((f) => ({ ...f, year }))}
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

              {/* Type Filter */}
              <div>
                <h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase text-left">
                  Mentor Type
                </h3>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilters((f) => ({ ...f, type }))}
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
                  (showBookmarks ? bookmarkedResults : filteredResults).map((mentor, idx) => (
                    <article
                      key={idx}
                      className="bg-white rounded-2xl p-6 shadow hover:shadow-2xl transition transform hover:-translate-y-1 relative border border-slate-100"
                    >
                      <button
                        onClick={() => toggleBookmark(mentor)}
                        className="absolute right-4 top-4 text-slate-400 hover:text-sky-500"
                      >
                        {isBookmarked(mentor) ? (
                          <FaBookmark className="text-sky-500" />
                        ) : (
                          <FaRegBookmark />
                        )}
                      </button>

                      <h4 className="text-lg font-semibold mb-1">{mentor.name}</h4>
                      <div className="text-sm text-slate-600 mb-3">
                        {mentor.expertise.join(", ")}
                      </div>
                      <p className="text-sm text-slate-700 mb-4 line-clamp-3">
                        {mentor.bio}
                      </p>

                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <div>{mentor.availability || "Unknown Availability"}</div>
                        <div>{mentor.year || "N/A"}</div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-sky-400 text-white font-medium shadow hover:scale-[1.01] transition"
                        >
                          View Profile
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
}
