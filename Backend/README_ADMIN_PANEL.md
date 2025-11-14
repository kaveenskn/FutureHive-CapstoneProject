# Research Admin Panel Backend - Quick Start Guide

##  What You've Got

I've created a complete backend system for your ResearchAdminPanel with the following features:

###  New Files Created:

1. **`routes/admin_route.py`** - All API endpoints for admin panel
2. **`controller/admin_controller.py`** - Business logic for user & research management
3. **`ADMIN_PANEL_SETUP.md`** - Complete documentation
4. **`test_admin_api.py`** - Testing script
5. **`create_sample_excel.py`** - Excel template generator

### Modified Files:

1. **`PastResearches.py`** - Added admin routes registration

---

##  Quick Start (3 Steps)

### Step 1: Install Dependencies

```powershell
cd d:\Project\FutureHive-CapstoneProject\Backend
pip install flask flask-cors pymongo python-dotenv pandas openpyxl
```

### Step 2: Start the Backend

```powershell
python main.py
```

The server will run on `http://localhost:5000`

### Step 3: Test the API

```powershell
python test_admin_api.py
```

---

## Available API Endpoints

### Base URL: `http://localhost:5000/api/admin`

### User Management

- `GET /users` - Get all users (with search & pagination)
- `GET /users/<id>` - Get specific user
- `POST /users` - Create user
- `PUT /users/<id>` - Update user
- `DELETE /users/<id>` - Delete user

### Research Management

- `GET /research` - Get all research entries
- `GET /research/<id>` - Get specific entry
- `POST /research` - Create entry
- `PUT /research/<id>` - Update entry
- `DELETE /research/<id>` - Delete entry
- `POST /research/bulk-upload` - Upload Excel file

### Dashboard

- `GET /dashboard/stats` - Get statistics

---

##  How to Integrate with Frontend

### Update Your ResearchAdminPanel.jsx

Replace the mock data with actual API calls:

```javascript
import { useState, useEffect } from "react";

const BASE_URL = "http://localhost:5000/api/admin";

// In your AdminPanel component:
useEffect(() => {
  fetchUsers();
  fetchResearchEntries();
  fetchDashboardStats();
}, []);

// Fetch users
const fetchUsers = async () => {
  setIsLoading(true);
  try {
    const response = await fetch(
      `${BASE_URL}/users?search=${searchQuery}&page=${currentPage}&per_page=5`
    );
    const data = await response.json();

    if (data.success) {
      setUsers(data.users);
      // Update pagination info
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setIsLoading(false);
  }
};

// Delete user
const handleDelete = async (user) => {
  if (!window.confirm(`Delete ${user.name}?`)) return;

  try {
    const response = await fetch(`${BASE_URL}/users/${user._id}`, {
      method: "DELETE",
    });
    const data = await response.json();

    if (data.success) {
      alert("User deleted successfully!");
      fetchUsers(); // Refresh list
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Bulk upload research
const handleBulkUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${BASE_URL}/research/bulk-upload`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (data.success) {
      alert(`Uploaded ${data.count} entries!`);
      fetchResearchEntries(); // Refresh list
    }
  } catch (error) {
    console.error("Error:", error);
  }

  e.target.value = null;
};

// Fetch dashboard stats
const fetchDashboardStats = async () => {
  try {
    const response = await fetch(`${BASE_URL}/dashboard/stats`);
    const data = await response.json();

    if (data.success) {
      // Update stats in your component
      // data.stats.total_users
      // data.stats.total_research
      // data.stats.unsupervised_accounts
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

---

##  Database Structure

### MongoDB Collections

Your backend uses MongoDB with these collections:

#### 1. **users** Collection

```javascript
{
  _id: ObjectId,
  name: "Alice Johnson",
  email: "alice@example.com",
  role: "Admin",        // "Admin", "User", "Moderator"
  status: "Active",     // "Active", "Inactive", "Unsupervised"
  created_at: DateTime,
  updated_at: DateTime
}
```

#### 2. **research_entries** Collection

```javascript
{
  _id: ObjectId,
  title: "Machine Learning in Healthcare",
  abstract: "Full abstract text...",
  author: "Dr. Sarah Chen",
  year: 2023,
  description: "Short description...",
  created_at: DateTime,
  updated_at: DateTime
}
```

---

##  Testing Your Backend

### Option 1: Use the Test Script

```powershell
python test_admin_api.py
```

### Option 2: Test Manually with PowerShell

```powershell
# Get dashboard stats
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/dashboard/stats"

# Create a user
$userData = @{
    name = "John Doe"
    email = "john@example.com"
    role = "User"
    status = "Active"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users" `
  -Method POST `
  -Body $userData `
  -ContentType "application/json"

# Get all users
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users?page=1&per_page=5"
```

---

##  Excel Bulk Upload

### Step 1: Create Template

```powershell
python create_sample_excel.py
```

This creates `datas/research_upload_template.xlsx`

### Step 2: Fill in Data

Your Excel file must have these columns:

- **Title** - Research paper title
- **Abstract** - Full abstract
- **Author** - Author name(s)
- **Year** - Publication year

### Step 3: Upload via API

```javascript
// In your frontend
const formData = new FormData();
formData.append("file", fileInput.files[0]);

fetch("http://localhost:5000/api/admin/research/bulk-upload", {
  method: "POST",
  body: formData,
})
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      alert(`Uploaded ${data.count} entries!`);
    }
  });
```

---

##  API Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message here"
}
```

---

##  Troubleshooting

### Problem: Server won't start

**Solution:**

```powershell
# Install dependencies
pip install flask flask-cors pymongo python-dotenv pandas openpyxl

# Check if MongoDB is configured
# Verify .env file has MONGO_URI
```

### Problem: CORS errors in frontend

**Solution:** CORS is already configured! Make sure you're using:

```javascript
const BASE_URL = "http://localhost:5000/api/admin";
```

### Problem: MongoDB connection failed

**Solution:**

- Check `.env` file for `MONGO_URI`
- Ensure MongoDB Atlas allows your IP
- Test connection: `python -c "from mongo import db; print(db)"`

### Problem: Module not found

**Solution:**

```powershell
pip install <module-name>
```

---

##  Complete Documentation

For detailed API documentation, examples, and advanced features, see:
**`ADMIN_PANEL_SETUP.md`**

---

##  Next Steps

1.  **Start the backend** - `python main.py`
2.  **Test endpoints** - `python test_admin_api.py`
3.  **Update frontend** - Replace mock data with API calls
4.  **Add authentication** - Implement JWT (see full docs)
5.  **Deploy** - Deploy to production server

---

##  Key Features

 **User Management**

- Create, read, update, delete users
- Search users by name/email
- Pagination support

 **Research Management**

- Manage research entries
- Bulk upload from Excel
- Full CRUD operations

 **Dashboard Statistics**

- Total users count
- Total research entries
- Unsupervised accounts
- Recent additions

 **Production Ready**

- Error handling
- Input validation
- Consistent API responses
- CORS configured

---

## Need Help?

1. Check `ADMIN_PANEL_SETUP.md` for detailed docs
2. Run `python test_admin_api.py` to verify setup
3. Review code comments in the files
4. Test individual endpoints with PowerShell

---

**Happy Coding! **
