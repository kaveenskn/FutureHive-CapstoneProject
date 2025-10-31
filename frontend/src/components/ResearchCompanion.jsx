import React from "react";

const ResearchCompanion = () => {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="container px-4 py-8 mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-800">
            Research Companion
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            AI-powered research assistant to help you analyze, organize, and
            accelerate your academic work
          </p>
        </header>

        <main className="max-w-6xl mx-auto">
          <div className="rounded-2xl p-6 mb-8 bg-white shadow-lg">
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="What would you like to research? (e.g., 'machine learning applications in healthcare')"
                  className="focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                />
                <button className="hover:bg-blue-700 px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg">
                  Analyze
                </button>
              </div>

              <div className="md:grid-cols-4 grid grid-cols-2 gap-4">
                {[
                  "Academic Paper",
                  "Literature Review",
                  "Data Analysis",
                  "Research Summary",
                ].map((type) => (
                  <button
                    key={type}
                    className="hover:bg-gray-50 px-3 py-2 text-sm transition-colors border border-gray-300 rounded-lg"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResearchCompanion;
