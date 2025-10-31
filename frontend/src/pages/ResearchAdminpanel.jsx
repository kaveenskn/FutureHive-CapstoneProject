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

      <div className="max-w-7xl sm:px-6 lg:px-8 px-4 py-8 mx-auto">
        <div className="md:grid-cols-3 grid grid-cols-1 gap-6 mb-8">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">9,247</h3>
                <p className="text-gray-600">Total Users</p>
                <p className="mt-1 text-sm text-green-600">+1,247</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">8,492</h3>
                <p className="text-gray-600">Research Entries</p>
                <p className="mt-1 text-sm text-green-600">+12</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">10</h3>
                <p className="text-gray-600">Unsupervised Account</p>
                <p className="mt-1 text-sm text-green-600">+12</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
