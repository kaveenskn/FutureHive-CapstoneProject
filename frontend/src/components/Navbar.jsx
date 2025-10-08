import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../components/Firebase";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to toggle menu
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  return (
    <nav className="backdrop-blur bg-white/80 border-b shadow-lg shadow-slate-300">
      <div className="container mx-auto px-2 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-900">Research <span className="text-blue-600">Assistant</span></div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <button
            className="px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold"
            onClick={() => navigate("/research")}
          >
            Search
          </button>
          <button
            className="px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold"
            onClick={() => navigate("/recommendations")}
          >
            Recommendations
          </button>
          {!user ? (
            <button
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div
                title={user.displayName || user.email}
                onClick={() => navigate('/')} 
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold cursor-pointer"
              >
                {((user.displayName || user.email || "")[0] || "").toUpperCase()}
              </div>
              <button onClick={handleSignOut} className="px-3 py-1 border rounded text-sm">Sign out</button>
            </div>
          )}
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