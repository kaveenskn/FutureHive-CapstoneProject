import React, { useEffect, useMemo, useState } from "react";
import MentorCard from "../components/MentorCard";
import FiltersPanel from "../components/FiltersPanel";

export default function Mentors() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({

    expertise: "all",

    minExperience: 0,
    sort: "relevance",
  });
  const [sampleMentors, setSampleMentors] = useState([]);
  const [selected, setSelected] = useState(null);

  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [showAllExpertise, setShowAllExpertise] = useState(false);


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

    () => ["all", ...Array.from(new Set(sampleMentors.flatMap((m) => m.expertise || [])))],

    [sampleMentors]
  );

  const results = useMemo(() => {
    let items = sampleMentors.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter((m) =>
        (m.name + " " + (m.expertise || []).join(" ") + " " + m.bio)
          .toLowerCase()
          .includes(q)
      );
    }

    if (filters.expertise && filters.expertise !== "all") {

      items = items.filter((m) => m.expertise.includes(filters.expertise));
    }
    if (filters.minExperience) {
      items = items.filter((m) => m.experience >= filters.minExperience);
    }
    if (filters.sort === "experience") {
      items.sort((a, b) => b.experience - a.experience);
    }
    return items;
  }, [query, filters, sampleMentors]);

  useEffect(() => {
    setPage(1);
  }, [query, filters, sampleMentors]);

  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const paginatedResults = useMemo(() => {
    const start = (page - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }, [results, page]);

  function handleViewMore(m) {
    setSelected(m);
  }

  return (

    <div className="min-h-screen w-full bg-gradient-to-b from-blue-100 to-blue-50 flex flex-col items-center px-4 md:px-8 py-8">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col items-center">
          <main className="w-full text-center">
            <header className="mb-8 text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">
                Find a Mentor
              </h1>
              <p className="mt-2 text-base md:text-lg text-slate-600">
                Search mentors by expertise, skill, or topic. Connect directly via email or LinkedIn.
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
              {/* Expertise Filter */}
              <div className="mb-6 text-left">
                <h3 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase">
                  Expertise
                </h3>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {(showAllExpertise ? expertiseOptions : expertiseOptions.slice(0, 5)).map((expertise) => (
                    <button
                      key={expertise}
                      onClick={() => setFilters((f) => ({ ...f, expertise }))}
                      className={`px-4 md:px-5 py-2.5 rounded-lg border transition-all ${
                        filters.expertise === expertise
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-600 hover:text-blue-600"
                      }`}
                    >
                      {expertise === "all" ? "All Expertise" : expertise}
                    </button>
                  ))}
                </div>
                {expertiseOptions.length > 5 && (
                  <button
                    onClick={() => setShowAllExpertise((prev) => !prev)}
                    className="mt-3 text-sm text-blue-600 hover:underline"
                  >
                    {showAllExpertise ? "Show Less" : "Show All"}
                  </button>
                )}
              </div>

            </div>

            {/* Results Section */}
            <section className="mt-12 mb-8 bg-white/90 border border-blue-100 rounded-2xl shadow-lg w-full px-2 md:px-6 py-8 text-left">
              <div className="mb-6 flex flex-col md:flex-row items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-blue-700">Results</h2>
                <span className="text-sm text-slate-500">{results.length} found</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.length === 0 ? (
                  <div className="col-span-full text-center text-slate-500 py-12 text-lg">No results found. Try adjusting your search or filters.</div>
                ) : (
                  paginatedResults.map((mentor, idx) => (
                    <article
                      key={idx}
                      className="bg-white rounded-2xl p-6 shadow-md shadow-blue-200/60 hover:shadow-lg hover:shadow-blue-300/60 transition transform hover:-translate-y-1 relative border border-blue-100 border-t-4 border-t-blue-600"
                    >
                      <h4 className="text-lg font-semibold mb-1 text-blue-700">{mentor.name}</h4>
                      <div className="text-sm text-slate-600 mb-3">
                        {(mentor.expertise || []).join(", ")}
                      </div>
                      <p className="text-sm text-slate-700 mb-4 line-clamp-3">
                        {mentor.bio}
                      </p>

                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <div>{mentor.availability || "Unknown Availability"}</div>
                        <div>{mentor.experience} years</div>
                      </div>

                      <div className="mt-5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <a
                            href={mentor.email ? `mailto:${mentor.email}` : "mailto:"}
                            className="text-sm px-3 py-1.5 bg-sky-50 text-sky-700 rounded-md hover:bg-sky-100"
                          >
                            Email
                          </a>
                          <a
                            href={mentor.linkedin || "https://www.linkedin.com/"}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            LinkedIn
                          </a>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>

              {results.length > 0 && totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 rounded-lg border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="text-sm text-slate-600">
                    Page <span className="font-semibold text-blue-700">{page}</span> of{" "}
                    <span className="font-semibold text-blue-700">{totalPages}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          </main>
        </div>


      </div>
    </div>
  );
}
