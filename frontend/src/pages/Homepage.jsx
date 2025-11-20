import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../components/Firebase";
import { toast } from "react-toastify";
// Import Navbar
import heroImage from "../assets/image.png"; // adjust the path if needed

const Homepage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const imageRef = useRef(null); // Reference for the image

  const handleStartSearching = (path) => {
    console.log("Search query:", query);
    if (!user) {
      toast.info("Please log in to connect", { position: "top-right" });
      // give the toast a moment to be noticed, then navigate to signin
      setTimeout(() => navigate("/signin"), 900);
      return;
    }
    navigate(path);
  };

  const handleExplore = () => {
    if (!user) {
      toast.info("Please log in to connect", { position: "top-right" });
      setTimeout(() => navigate("/signin"), 900);
      return;
    }
    navigate("/recommendations");
  };

  const [user, setUser] = React.useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

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



      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-2 flex items-center">
        <div className="grid lg:grid-cols-2 gap-24 items-center w-full">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-normal">
              AI-Powered{" "}
              <span className="text-blue-600">Research</span> Assistant
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
              Find past projects, discover new topics, and improve your research
              ideas with AI-powered recommendations.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 max-w-xl mt-8 mb-6">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for research papers, topics, or keywords..."
                className="flex-1 px-4 py-3 rounded-l-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleStartSearching('/search')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-xl"
              >
                Search
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-6 mt-20">
              <button
                onClick={() => handleStartSearching('/search')}
                className="px-8 py-3 rounded-xl shadow-md bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Searching
              </button>
              <button
                onClick={handleExplore}
                className="px-8 py-3 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50"
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

