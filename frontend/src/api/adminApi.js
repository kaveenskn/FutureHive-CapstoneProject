// src/api/adminApi.js
// API helper functions for connecting to the Admin Panel backend(s)

// Flask Admin API (research + legacy admin endpoints)
const ADMIN_BASE_URL =
  import.meta.env.VITE_ADMIN_API_BASE_URL || "http://localhost:5000/api/admin";

// Firebase API Server (Firestore via firebase-admin)
const FIREBASE_BASE_URL =
  import.meta.env.VITE_FIREBASE_API_BASE_URL || "http://localhost:5001/api";

const apiCall = async (baseUrl, endpoint, options = {}) => {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  // Keep old behavior (return parsed payload), but throw on HTTP errors
  if (!response.ok) {
    const message =
      (data && typeof data === "object" && data.error) ||
      `Request failed (HTTP ${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// ==================
// USER API CALLS (Firestore)
// ==================

export const userApi = {
  getUsers: (searchQuery = "", page = 1, perPage = 5) => {
    return apiCall(
      FIREBASE_BASE_URL,
      `/users?search=${encodeURIComponent(searchQuery)}&page=${page}&limit=${perPage}`
    );
  },

  getUserById: (userId) => {
    return apiCall(FIREBASE_BASE_URL, `/users/${userId}`);
  },

  createUser: (userData) => {
    return apiCall(FIREBASE_BASE_URL, "/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  updateUser: (userId, userData) => {
    return apiCall(FIREBASE_BASE_URL, `/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  deleteUser: (userId) => {
    return apiCall(FIREBASE_BASE_URL, `/users/${userId}`, {
      method: "DELETE",
    });
  },
};

// ==================
// RESEARCH API CALLS (Flask Admin)
// ==================

export const researchApi = {
  getResearch: (page = 1, perPage = 10) => {
    return apiCall(ADMIN_BASE_URL, `/research?page=${page}&per_page=${perPage}`);
  },

  getResearchById: (researchId) => {
    return apiCall(ADMIN_BASE_URL, `/research/${researchId}`);
  },

  createResearch: (researchData) => {
    return apiCall(ADMIN_BASE_URL, "/research", {
      method: "POST",
      body: JSON.stringify(researchData),
    });
  },

  updateResearch: (researchId, researchData) => {
    return apiCall(ADMIN_BASE_URL, `/research/${researchId}`, {
      method: "PUT",
      body: JSON.stringify(researchData),
    });
  },

  deleteResearch: (researchId) => {
    return apiCall(ADMIN_BASE_URL, `/research/${researchId}`, {
      method: "DELETE",
    });
  },

  bulkUpload: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${ADMIN_BASE_URL}/research/bulk-upload`, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary
    });

    return await response.json();
  },
};

// ==================
// DASHBOARD API CALLS (Firestore)
// ==================

export const dashboardApi = {
  getStats: () => {
    return apiCall(FIREBASE_BASE_URL, "/dashboard/stats");
  },
};

export default {
  users: userApi,
  research: researchApi,
  dashboard: dashboardApi,
};
