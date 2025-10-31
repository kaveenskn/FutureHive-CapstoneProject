import React from "react";

const AIResearchAssistant = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center min-h-screen p-4">
      <div className="rounded-2xl w-full max-w-md overflow-hidden bg-white shadow-xl">
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center w-16 h-16 rounded-full">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-center text-gray-800">
            AI Research Assistant
          </h1>

          <p className="mb-8 text-lg text-center text-gray-600">
            Empowering research with intelligent data management and analytics
          </p>

          <div className="mt-8">
            <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Access Admin Panel
            </button>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            Secure • Intelligent • Efficient
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIResearchAssistant;
