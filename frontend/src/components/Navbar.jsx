import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to toggle menu

  return (
    <nav className="backdrop-blur bg-white/80 border-b shadow-lg shadow-slate-300">
      <div className="container mx-auto px-2 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-900">Research Assistant</div>

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
  );
};

export default Navbar;