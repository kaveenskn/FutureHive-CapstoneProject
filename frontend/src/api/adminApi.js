// src/api/adminApi.js
// API helper functions for connecting to the Admin Panel backend

const BASE_URL = "http://localhost:5000/api/admin";

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// ==================
// USER API CALLS
// ==================

export const userApi = {
  // Get all users with pagination and search
  getUsers: (searchQuery = "", page = 1, perPage = 5) => {
    return apiCall(
      `/users?search=${searchQuery}&page=${page}&per_page=${perPage}`
    );
  },

  // Get user by ID
  getUserById: (userId) => {
    return apiCall(`/users/${userId}`);
  },

  // Create new user
  createUser: (userData) => {
    return apiCall("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Update existing user
  updateUser: (userId, userData) => {
    return apiCall(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  // Delete user
  deleteUser: (userId) => {
    return apiCall(`/users/${userId}`, {
      method: "DELETE",
    });
  },
};

// ==================
// RESEARCH API CALLS
// ==================

export const researchApi = {
  // Get all research entries with pagination
  getResearch: (page = 1, perPage = 10) => {
    return apiCall(`/research?page=${page}&per_page=${perPage}`);
  },

  // Get research entry by ID
  getResearchById: (researchId) => {
    return apiCall(`/research/${researchId}`);
  },

  // Create new research entry
  createResearch: (researchData) => {
    return apiCall("/research", {
      method: "POST",
      body: JSON.stringify(researchData),
    });
  },

  // Update research entry
  updateResearch: (researchId, researchData) => {
    return apiCall(`/research/${researchId}`, {
      method: "PUT",
      body: JSON.stringify(researchData),
    });
  },

  // Delete research entry
  deleteResearch: (researchId) => {
    return apiCall(`/research/${researchId}`, {
      method: "DELETE",
    });
  },

  // Bulk upload research entries from Excel file
  bulkUpload: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BASE_URL}/research/bulk-upload`, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      });

      return await response.json();
    } catch (error) {
      console.error("Upload Error:", error);
      throw error;
    }
  },
};

// ==================
// DASHBOARD API CALLS
// ==================

export const dashboardApi = {
  // Get dashboard statistics
  getStats: () => {
    return apiCall("/dashboard/stats");
  },
};

// Default export with all APIs
export default {
  users: userApi,
  research: researchApi,
  dashboard: dashboardApi,
};
