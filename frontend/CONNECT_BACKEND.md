# How to Connect Frontend to Backend

## ✅ Backend is Running

Your backend server is now running at:

- **Base URL**: `http://localhost:5000`
- **Admin API**: `http://localhost:5000/api/admin`

## 📝 Step-by-Step Integration

### Option 1: Using Fetch API (Recommended)

Create a new file: `src/api/adminApi.js`

```javascript
// src/api/adminApi.js

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
  // Get all users
  getUsers: (searchQuery = "", page = 1, perPage = 5) => {
    return apiCall(
      `/users?search=${searchQuery}&page=${page}&per_page=${perPage}`
    );
  },

  // Get user by ID
  getUserById: (userId) => {
    return apiCall(`/users/${userId}`);
  },

  // Create user
  createUser: (userData) => {
    return apiCall("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Update user
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
  // Get all research entries
  getResearch: (page = 1, perPage = 10) => {
    return apiCall(`/research?page=${page}&per_page=${perPage}`);
  },

  // Get research by ID
  getResearchById: (researchId) => {
    return apiCall(`/research/${researchId}`);
  },

  // Create research entry
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

  // Bulk upload from Excel
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

export default {
  users: userApi,
  research: researchApi,
  dashboard: dashboardApi,
};
```

### Option 2: Update Your ResearchAdminPanel.jsx

Replace the mock data in your `ResearchAdminPanel.jsx` with real API calls:

```javascript
import React, { useState, useEffect } from "react";
import { userApi, researchApi, dashboardApi } from "../api/adminApi";

const AdminPanel = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [researchEntries, setResearchEntries] = useState([]);
  const [stats, setStats] = useState({
    total_users: 0,
    total_research: 0,
    unsupervised_accounts: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 5;
  const [activeSection, setActiveSection] = useState("users");

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userApi.getUsers(searchQuery, currentPage, usersPerPage);

      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.total_pages);
      } else {
        console.error('Error fetching users:', data.error);
        alert('Failed to fetch users: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to server. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch research entries
  const fetchResearchEntries = async () => {
    try {
      const data = await researchApi.getResearch(1, 10);

      if (data.success) {
        setResearchEntries(data.entries);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const data = await dashboardApi.getStats();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
    fetchResearchEntries();
    fetchDashboardStats();
  }, [currentPage, searchQuery]);

  // Handle view user
  const handleView = (user) => {
    console.log("Viewing user:", user);
    alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\nStatus: ${user.status}`);
  };

  // Handle edit user
  const handleEdit = async (user) => {
    const newName = prompt('Enter new name:', user.name);
    if (!newName) return;

    try {
      const data = await userApi.updateUser(user._id, { name: newName });

      if (data.success) {
        alert('User updated successfully!');
        fetchUsers(); // Refresh list
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update user');
    }
  };

  // Handle delete user
  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) return;

    try {
      const data = await userApi.deleteUser(user._id);

      if (data.success) {
        alert('User deleted successfully!');
        fetchUsers(); // Refresh list
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete user');
    }
  };

  // Handle edit research
  const handleEditResearch = async (entry) => {
    const newTitle = prompt('Enter new title:', entry.title);
    if (!newTitle) return;

    try {
      const data = await researchApi.updateResearch(entry._id, { title: newTitle });

      if (data.success) {
        alert('Research entry updated successfully!');
        fetchResearchEntries(); // Refresh list
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update research entry');
    }
  };

  // Handle delete research
  const handleDeleteResearch = async (entry) => {
    if (!window.confirm(`Delete research entry: ${entry.title}?`)) return;

    try {
      const data = await researchApi.deleteResearch(entry._id);

      if (data.success) {
        alert('Research entry deleted successfully!');
        fetchResearchEntries(); // Refresh list
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete research entry');
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Please upload an Excel file (.xlsx or .xls)');
      e.target.value = null;
      return;
    }

    try {
      const data = await researchApi.bulkUpload(file);

      if (data.success) {
        alert(`Successfully uploaded ${data.count} research entries!`);
        fetchResearchEntries(); // Refresh list
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to upload file');
    }

    e.target.value = null;
  };

  // Rest of your component JSX remains the same...
  // Just use the stats from state:
  // - stats.total_users
  // - stats.total_research
  // - stats.unsupervised_accounts

  return (
    // Your existing JSX with the updated handlers
  );
};
```

## 🧪 Testing the Connection

### Test 1: Health Check

Open your browser and visit:

```
http://localhost:5000/health
```

You should see:

```json
{
  "status": "healthy",
  "service": "admin-panel"
}
```

### Test 2: Get Dashboard Stats

In browser console or new terminal:

```javascript
// In browser console
fetch("http://localhost:5000/api/admin/dashboard/stats")
  .then((r) => r.json())
  .then(console.log);
```

Or in PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/dashboard/stats"
```

### Test 3: Create a Test User

```javascript
// In browser console
fetch("http://localhost:5000/api/admin/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Test User",
    email: "test@example.com",
    role: "User",
    status: "Active",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

## 🔧 Troubleshooting

### Issue: CORS Error

**Solution**: CORS is already configured in the backend. Make sure you're using `http://localhost:5000` (not https).

### Issue: Connection Refused

**Solution**: Make sure the backend server is running:

```powershell
cd d:\Project\FutureHive-CapstoneProject\Backend
python admin_server.py
```

### Issue: 404 Not Found

**Solution**: Check the endpoint URL. All admin endpoints start with `/api/admin/`

### Issue: Backend not starting

**Solution**: Check if port 5000 is already in use:

```powershell
netstat -ano | findstr :5000
# If port is in use, kill the process or change port in admin_server.py
```

## 📚 API Reference Quick Guide

### Users

```javascript
// Get all users (with pagination & search)
GET /api/admin/users?search=john&page=1&per_page=5

// Get specific user
GET /api/admin/users/{userId}

// Create user
POST /api/admin/users
Body: { name, email, role, status }

// Update user
PUT /api/admin/users/{userId}
Body: { name, email, role, status }

// Delete user
DELETE /api/admin/users/{userId}
```

### Research

```javascript
// Get all research entries
GET /api/admin/research?page=1&per_page=10

// Create research entry
POST /api/admin/research
Body: { title, abstract, author, year }

// Bulk upload
POST /api/admin/research/bulk-upload
Body: FormData with Excel file
```

### Dashboard

```javascript
// Get statistics
GET / api / admin / dashboard / stats;
```

## ✅ Summary

1. **Backend is running** at `http://localhost:5000`
2. **Create `src/api/adminApi.js`** with the API helper functions
3. **Import and use** in your components
4. **Test the connection** using browser console or API client

Your backend is ready and waiting for connections! 🚀
