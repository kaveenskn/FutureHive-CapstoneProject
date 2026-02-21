import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const TopicSparkBody = () => {
  const TRENDING_PAGE_SIZE = 10;
  const SEARCH_PAGE_SIZE = 12;
  const MIN_FILTER_RESULTS = 9;
  const AUTO_FILL_MAX_ATTEMPTS = 3;

  const TRENDING_CACHE_PREFIX = "futurehive:topicspark:trending:v1:";
  const SEARCH_CACHE_PREFIX = "futurehive:topicspark:search:v1:";
  const CACHE_TTL_MS = 10 * 60 * 1000;

  const [selectedType, setSelectedType] = useState("all");
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [mode, setMode] = useState("trending");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedById, setExpandedById] = useState({});

  const navigate = useNavigate();
  const autoFillRef = useRef({ key: "", attempts: 0, inFlight: false });
  const requestRef = useRef({ id: 0, controller: null });

  /* ---------------------- CACHE HELPERS ---------------------- */

  const readCache = (key) => {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.ts !== "number") return null;
      if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const writeCache = (key, projects, hasMore) => {
    try {
      sessionStorage.setItem(
        key,
        JSON.stringify({ ts: Date.now(), projects, hasMore })
      );
    } catch {
      // ignore
    }
  };

  /* ---------------------- REQUEST CONTROL ---------------------- */

  const beginRequest = () => {
    try {
      requestRef.current.controller?.abort();
    } catch {}

    const controller = new AbortController();
    const id = requestRef.current.id + 1;
    requestRef.current = { id, controller };
    return { id, signal: controller.signal };
  };

  /* ---------------------- HELPERS ---------------------- */

  const stripIdeaPrefix = (title = "") =>
    String(title)
      .replace(
        /^\s*(research project idea|software project idea)\s*:\s*/i,
        ""
      )
      .trim();

  const mapTopics = (topics = [], pageNumber = 1) =>
    topics.map((t, idx) => ({
      id:
        t.id ||
        encodeURIComponent((t.title || "") + "-" + pageNumber + "-" + idx),
      title: stripIdeaPrefix(t.title) || "Untitled",
      description: t.description || "",
      type: t.type
        ? t.type.charAt(0).toUpperCase() + t.type.slice(1)
        : "Research",
      tags: t.tags || [],
      isHot: t.isHot || false,
    }));

  /* ---------------------- FETCH TRENDING ---------------------- */

  const fetchTopics = async (
    pageNumber = 1,
    append = false,
    typeOverride = null,
    options = {}
  ) => {
    const { id, signal } = beginRequest();
    const silent = !!options.silent;
    if (!silent) setLoading(true);

    try {
      const effectiveType =
        typeOverride && typeOverride !== "all"
          ? typeOverride.toLowerCase()
          : "";

      const cacheKey = `${TRENDING_CACHE_PREFIX}${effectiveType || "all"}`;

      const typeParam = effectiveType
        ? `&type=${encodeURIComponent(effectiveType)}`
        : "";

      const res = await fetch(
        `http://127.0.0.1:8000/topicspark?page=${pageNumber}&limit=${TRENDING_PAGE_SIZE}${typeParam}`,
        { signal }
      );

      const data = await res.json();
      const mapped = mapTopics(data.topics || data, pageNumber);

      if (requestRef.current.id !== id || signal.aborted) return;

      setHasMore(mapped.length >= TRENDING_PAGE_SIZE);
      setProjects((prev) => (append ? [...prev, ...mapped] : mapped));

      if (pageNumber === 1 && !append) {
        writeCache(cacheKey, mapped, mapped.length >= TRENDING_PAGE_SIZE);
      }
    } catch (e) {
      if (e?.name === "AbortError") return;
      console.error(e);
      setHasMore(false);
    } finally {
      if (requestRef.current.id === id) setLoading(false);
    }
  };

  /* ---------------------- FETCH SEARCH ---------------------- */

  const fetchSearch = async (
    pageNumber = 1,
    append = false,
    q = "",
    typeOverride = null,
    options = {}
  ) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    const { id, signal } = beginRequest();
    const silent = !!options.silent;
    if (!silent) setLoading(true);

    try {
      const effectiveType =
        typeOverride && typeOverride !== "all"
          ? typeOverride.toLowerCase()
          : "";

      const cacheKey = `${SEARCH_CACHE_PREFIX}${encodeURIComponent(
        trimmed
      )}|${effectiveType || "all"}`;

      const res = await fetch(
        "http://127.0.0.1:8000/topicspark/search",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          signal,
          body: JSON.stringify({
            query: trimmed,
            page: pageNumber,
            limit: SEARCH_PAGE_SIZE,
            type: effectiveType || undefined,
          }),
        }
      );

      const data = await res.json();
      const mapped = mapTopics(data.topics || data, pageNumber);

      if (requestRef.current.id !== id || signal.aborted) return;

      setHasMore(mapped.length >= SEARCH_PAGE_SIZE);
      setProjects((prev) => (append ? [...prev, ...mapped] : mapped));

      if (pageNumber === 1 && !append) {
        writeCache(cacheKey, mapped, mapped.length >= SEARCH_PAGE_SIZE);
      }
    } catch (e) {
      if (e?.name === "AbortError") return;
      console.error(e);
      setHasMore(false);
    } finally {
      if (requestRef.current.id === id) setLoading(false);
    }
  };

  /* ---------------------- INITIAL LOAD ---------------------- */

  useEffect(() => {
    fetchTopics(1);
    return () => requestRef.current.controller?.abort();
  }, []);

  /* ---------------------- SEARCH HANDLER ---------------------- */

  const handleSearch = async () => {
    if (!query.trim()) return;

    const trimmed = query.trim();
    setActiveQuery(trimmed);
    setMode("search");
    setPage(1);
    setHasMore(true);

    await fetchSearch(1, false, trimmed, selectedType);
  };

  /* ---------------------- UI HELPERS ---------------------- */

  const filteredProjects =
    selectedType === "all"
      ? projects
      : projects.filter(
          (p) =>
            p.type.toLowerCase() === selectedType.toLowerCase()
        );

  const navigateToChatbot = (project) => {
    navigate("/chat", {
      state: { paper: project, source: "topicspark" },
    });
  };

  const isLongDescription = (text) =>
    String(text).length > 160;

  const toggleExpanded = (id) => {
    setExpandedById((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* ---------------------- JSX ---------------------- */

  return (
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Explore Trending Topics in
          </h1>
          <h1 className="text-4xl md:text-5xl font-bold text-blue-600">
            FutureHive
          </h1>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <input
            type="text"
            placeholder="Search research topics..."
            className="w-full px-6 py-4 border rounded-2xl"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleSearch()
            }
          />
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-10">
            Loading topics...
          </div>
        )}

        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-10">
            No topics found.
          </div>
        )}

        {!loading && filteredProjects.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                className="p-6 bg-white rounded-2xl shadow"
              >
                <h3 className="font-semibold mb-2">
                  {project.title}
                </h3>

                <p
                  className={
                    expandedById[project.id]
                      ? ""
                      : "line-clamp-3"
                  }
                >
                  {project.description}
                </p>

                {isLongDescription(project.description) && (
                  <button
                    onClick={() =>
                      toggleExpanded(project.id)
                    }
                    className="text-blue-600 text-sm mt-2"
                  >
                    {expandedById[project.id]
                      ? "Show less"
                      : "Show more"}
                  </button>
                )}

                <button
                  onClick={() =>
                    navigateToChatbot(project)
                  }
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Explore Project
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default TopicSparkBody;