import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import heroImage from "./assets/image.png"; // adjust the path if needed

const Homepage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to toggle menu
  const imageRef = useRef(null); // Reference for the image

  const handleStartSearching = () => {
    console.log("Search query:", query);
    navigate("/search");
  };

  useEffect(() => {
    // GSAP animation for the image
    gsap.to(imageRef.current, {
      y: 20, // Move 20px up and down
      duration: 2, // Duration of the animation
      repeat: -1, // Infinite repeat
      yoyo: true, // Reverse the animation
      ease: "power1.inOut", // Smooth easing
    });
  }, []);

  return (
    <div className="h-screen bg-gradient-to-b from-blue-100 to-blue-50 flex flex-col">
      {/* Navigation */}
      <nav className="backdrop-blur bg-white/80 border-b shadow-lg shadow-slate-300">
        <div className="container mx-auto px-2 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            Research Assistant
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              className="px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold"
              onClick={() => navigate("/search")}
            >
              Search
            </button>
            <button
              className="px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold"
              onClick={() => navigate("/recommendations")}
            >
              Recommendations
            </button>
            <button
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="flex flex-col items-center gap-4 py-4">
              <button
                className="px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold"
                onClick={() => {
                  navigate("/search");
                  setIsMenuOpen(false);
                }}
              >
                Search
              </button>
              <button
                className="px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold"
                onClick={() => {
                  navigate("/recommendations");
                  setIsMenuOpen(false);
                }}
              >
                Recommendations
              </button>
              <button
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
                onClick={() => {
                  navigate("/auth");
                  setIsMenuOpen(false);
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-2 flex items-center">
        <div className="grid lg:grid-cols-2 gap-24 items-center w-full">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              AI-Powered{" "}
              <span className="text-blue-600">Research</span> Assistant
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
              Find past projects, discover new topics, and improve your research
              ideas with AI-powered recommendations.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 max-w-xl mt-8">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for research papers, topics, or keywords..."
                className="flex-1 px-4 py-3 rounded-l-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleStartSearching}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-xl"
              >
                Search
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleStartSearching}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-md"
              >
                Start Searching
              </button>
              <button
                onClick={() => navigate("/recommendations")}
                className="border border-blue-600 text-blue-600 px-8 py-3 rounded-xl hover:bg-blue-50"
              >
                Explore Recommendations
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="hidden lg:block">
            <img
              ref={imageRef} // Attach the ref to the image
              src={heroImage}
              alt="Research Illustration"
              className="rounded-2xl shadow-xl shadow-blue-300"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Homepage;
