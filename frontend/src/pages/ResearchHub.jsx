import React from "react";

const ResearchHub = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <div className="rounded-2xl md:p-12 lg:p-16 p-8 bg-white shadow-xl">
          <div className="mb-12 text-center">
            <h1 className="md:text-5xl lg:text-6xl mb-6 text-4xl font-bold leading-tight text-gray-800">
              Discover, Explore, and
              <br />
              <span className="text-blue-600">Innovate</span> with FutureHive
              <br />
            </h1>

            <p className="md:text-xl max-w-3xl mx-auto text-lg leading-relaxed text-gray-600">
              Access past university projects, explore trending topics, and find
              inspiration for your next research idea.
            </p>
          </div>

          <div className="sm:flex-row flex flex-col items-center justify-center gap-4">
            <button className="hover:bg-blue-700 hover:scale-105 hover:shadow-xl sm:w-auto w-full px-8 py-4 text-lg font-semibold text-white transition-all duration-300 transform bg-blue-600 rounded-lg shadow-lg">
              View Past Researches
            </button>

            <button className="hover:bg-blue-600 hover:text-white hover:scale-105 sm:w-auto w-full px-8 py-4 text-lg font-semibold text-blue-600 transition-all duration-300 transform border-2 border-blue-600 rounded-lg">
              Explore Trending Topics
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Join thousands of students and researchers in our growing community
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResearchHub;
