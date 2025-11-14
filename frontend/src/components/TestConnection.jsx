import React, { useState, useEffect } from "react";
import { userApi, researchApi, dashboardApi } from "../api/adminApi";

const TestConnection = () => {
  const [status, setStatus] = useState("Testing connection...");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Test 1: Health check
      setStatus("Testing health check...");
      const healthResponse = await fetch("http://localhost:5000/health");
      const healthData = await healthResponse.json();

      if (healthData.status === "healthy") {
        setStatus("✅ Backend is connected!");

        // Test 2: Get dashboard stats
        const statsData = await dashboardApi.getStats();
        if (statsData.success) {
          setStats(statsData.stats);
        }

        // Test 3: Get users
        const usersData = await userApi.getUsers("", 1, 5);
        if (usersData.success) {
          setUsers(usersData.users);
        }
      }
    } catch (err) {
      setError(err.message);
      setStatus("❌ Connection failed");
      console.error("Connection test failed:", err);
    }
  };

  const createTestUser = async () => {
    try {
      const userData = {
        name: "Test User " + Date.now(),
        email: `test${Date.now()}@example.com`,
        role: "User",
        status: "Active",
      };

      const result = await userApi.createUser(userData);

      if (result.success) {
        alert("User created successfully!");
        testConnection(); // Refresh data
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      alert("Failed to create user: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Backend Connection Test
          </h1>

          <div className="mb-6">
            <div
              className={`text-lg font-semibold ${
                status.includes("✅")
                  ? "text-green-600"
                  : status.includes("❌")
                  ? "text-red-600"
                  : "text-blue-600"
              }`}
            >
              {status}
            </div>

            {error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                <strong>Error:</strong> {error}
                <div className="mt-2 text-sm">
                  Make sure the backend server is running at
                  http://localhost:5000
                </div>
              </div>
            )}
          </div>

          {stats && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                Dashboard Statistics
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.total_users}
                  </div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.total_research}
                  </div>
                  <div className="text-sm text-gray-600">Research Entries</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.unsupervised_accounts}
                  </div>
                  <div className="text-sm text-gray-600">Unsupervised</div>
                </div>
              </div>
            </div>
          )}

          {users.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                Users ({users.length})
              </h2>
              <div className="space-y-2">
                {users.map((user, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-3 rounded flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {user.role}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {user.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={testConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              🔄 Refresh
            </button>
            <button
              onClick={createTestUser}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              ➕ Create Test User
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold text-gray-700 mb-2">API Endpoints:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Base URL: http://localhost:5000</li>
              <li>• Health: http://localhost:5000/health</li>
              <li>• Admin API: http://localhost:5000/api/admin</li>
              <li>• Users: http://localhost:5000/api/admin/users</li>
              <li>• Research: http://localhost:5000/api/admin/research</li>
              <li>• Stats: http://localhost:5000/api/admin/dashboard/stats</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestConnection;
