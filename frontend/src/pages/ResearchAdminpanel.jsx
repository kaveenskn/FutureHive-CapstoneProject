import React, { useState } from "react";

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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

  return (
    <div className="bg-gray-50 min-h-screen">
      {renderPage()}
      {showDeleteModal && (
        <DeleteConfirmationModal
          user={userToDelete}
          onConfirm={() => {
            console.log("Deleting user:", userToDelete);
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
          onCancel={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
        />
      )}
    </div>
  );
};

const AIResearchAssistant = ({ onAccessAdmin }) => {
  return (
    <div className="bg-gradient-to-b from-blue-100 to-blue-50 flex items-center justify-center min-h-screen p-4">
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
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "Admin",
      status: "Active",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@example.com",
      role: "User",
      status: "Active",
    },
    {
      id: 3,
      name: "Carol White",
      email: "carol@example.com",
      role: "Moderator",
      status: "Active",
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const [activeSection, setActiveSection] = useState("users");
  const [researchEntries, setResearchEntries] = useState([
    {
      id: 1,
      title: "Machine Learning in Healthcare",
      description: "Exploring AI applications in medical diagnosis...",
      author: "Dr. Sarah Chen",
      year: 2023,
    },
    {
      id: 2,
      title: "Quantum Computing Advances",
      description: "Recent breakthroughs in quantum algorithms...",
      author: "Prof. Michael Kumar",
      year: 2024,
    },
  ]);

  const handleEditResearch = (entry) => {
    console.log("Edit research:", entry);
    alert(`Edit research: ${entry.title} (coming soon)`);
  };

  const handleDeleteResearch = (entry) => {
    if (window.confirm(`Delete research entry: ${entry.title}?`)) {
      setResearchEntries((prev) => prev.filter((r) => r.id !== entry.id));
    }
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    alert(`Uploaded file: ${file.name} (bulk import not implemented)`);
    e.target.value = null;
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleView = (user) => {
    console.log("Viewing user:", user);
    alert(`Viewing details for ${user.name}`);
  };

  const handleEdit = (user) => {
    console.log("Editing user:", user);
    alert(`Edit functionality for ${user.name} - Coming soon!`);
  };

  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      setUsers(users.filter((u) => u.id !== user.id));
      console.log("Deleted user:", user);
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-100 to-blue-50 min-h-screen">
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

        <div className="md:flex-row flex flex-col gap-8">
          <div className="md:w-64 h-fit w-full p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Management
            </h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveSection("users")}
                  className={`w-full text-left flex items-center px-4 py-2 rounded-lg transition-colors ${
                    activeSection === "users"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-3"
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
                  User Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection("research")}
                  className={`w-full text-left flex items-center px-4 py-2 rounded-lg transition-colors ${
                    activeSection === "research"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-3"
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
                  Research Management
                </button>
              </li>
            </ul>
          </div>

          {activeSection === "users" ? (
            <div className="flex-1 overflow-hidden bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Manage Users
                    </h2>
                    <p className="mt-1 text-gray-600">
                      View and manage all platform users
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Total: {filteredUsers.length} user
                    {filteredUsers.length !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg"
                  />
                  <svg
                    className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Role
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin w-8 h-8 border-b-2 border-blue-600 rounded-full"></div>
                            <span className="ml-3 text-gray-600">
                              Loading users...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : currentUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <svg
                            className="w-12 h-12 mx-auto text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No users found
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {searchQuery
                              ? "Try adjusting your search"
                              : "Get started by adding a new user"}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      currentUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === "Admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : user.role === "Moderator"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                              {user.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleView(user)}
                                className="hover:text-blue-900 text-blue-600 transition-colors"
                                title="View"
                                aria-label={`View ${user.name}`}
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleEdit(user)}
                                className="hover:text-green-900 text-green-600 transition-colors"
                                title="Edit"
                                aria-label={`Edit ${user.name}`}
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(user)}
                                className="hover:text-red-900 text-red-600 transition-colors"
                                title="Delete"
                                aria-label={`Delete ${user.name}`}
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {!isLoading && filteredUsers.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{indexOfFirstUser + 1}</span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastUser, filteredUsers.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredUsers.length}</span>{" "}
                    results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-lg border transition-colors ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      Previous
                    </button>
                    <div className="flex space-x-1">
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            currentPage === index + 1
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100 border"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-lg border transition-colors ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Research Database
                </h2>
                <p className="mt-1 text-gray-600">
                  Manage research entries and publications
                </p>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  {researchEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-6 bg-white rounded-lg shadow"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {entry.title}
                        </h3>
                        <p className="mt-1 text-gray-500">
                          {entry.description}
                        </p>
                        <div className="mt-3 text-sm">
                          <span className="font-medium text-blue-600">
                            {entry.author}
                          </span>
                          <span className="ml-4 text-gray-400">
                            {entry.year}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEditResearch(entry)}
                          className="hover:bg-gray-100 p-2 rounded-md"
                          title="Edit"
                        >
                          <svg
                            className="w-5 h-5 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteResearch(entry)}
                          className="hover:bg-gray-100 p-2 rounded-md"
                          title="Delete"
                        >
                          <svg
                            className="w-5 h-5 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-white rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Bulk Upload via Excel
                  </h3>
                  <p className="mt-1 text-gray-500">
                    Upload an Excel file to insert multiple research entries at
                    once
                  </p>

                  <div className="flex flex-col items-center py-12 mt-6 border-2 border-gray-200 border-dashed rounded-lg">
                    <input
                      id="bulk-upload-input"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleBulkUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="bulk-upload-input"
                      className="bg-blue-50 inline-flex items-center px-6 py-3 text-blue-600 rounded-full cursor-pointer"
                    >
                      <svg
                        className="w-6 h-6 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v9M8 16l4-4 4 4"
                        />
                      </svg>
                      Upload Excel File
                    </label>
                    <p className="mt-4 text-sm text-gray-500">
                      Or drag and drop your .xlsx/.xls file here (drag/drop not
                      implemented)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ user, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md mx-4 overflow-hidden bg-white rounded-lg shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-center text-gray-900">
            Delete User
          </h3>
          <p className="mt-2 text-sm text-center text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{user?.name}</span>? This action
            cannot be undone.
          </p>
        </div>
        <div className="bg-gray-50 flex px-6 py-4 space-x-3">
          <button
            onClick={onCancel}
            className="hover:bg-gray-50 flex-1 px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="hover:bg-red-700 flex-1 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
