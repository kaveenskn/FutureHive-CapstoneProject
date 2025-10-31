import React from "react";

const ResearchDashboard = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-blue-900 min-h-screen">
      <div className="container px-4 py-16 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="mb-6 text-5xl font-bold text-white">
            AI Research Assistant
          </h1>
          <p className="mb-12 text-xl leading-relaxed text-gray-300">
            Empowering research with intelligent data management and analytics
          </p>

          <button className="hover:bg-blue-700 hover:scale-105 px-12 py-4 text-lg font-semibold text-white transition-all duration-200 transform bg-blue-600 rounded-lg shadow-2xl">
            Access Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResearchDashboard;
