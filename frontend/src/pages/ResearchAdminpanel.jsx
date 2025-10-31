import React, { useState } from "react";

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "admin":
        return <AdminPanel onBack={() => setCurrentPage("home")} />;
      default:
        return (
          <AIResearchAssistant onAccessAdmin={() => setCurrentPage("admin")} />
        );
    }
  };

  return <div className="bg-gray-50 min-h-screen">{renderPage()}</div>;
};

const AIResearchAssistant = ({ onAccessAdmin }) => {
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
            <button
              onClick={onAccessAdmin}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
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
const AdminPanel = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl sm:px-6 lg:px-8 flex items-center justify-between px-4 py-4 mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={onBack}
            className="hover:bg-blue-700 px-4 py-2 text-white transition duration-200 bg-blue-600 rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </header>

      <div className="max-w-7xl sm:px-6 lg:px-8 px-4 py-8 mx-auto"></div>
    </div>
  );
};

export default App;
