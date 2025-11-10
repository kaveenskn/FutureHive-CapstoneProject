# Research Admin Panel Backend - Complete Setup Guide

## Overview

This guide explains how to build and use the ResearchAdminPanel backend using Python, Flask, and MongoDB.

## Architecture

### Components:

1. **Routes** (`routes/admin_route.py`) - API endpoints
2. **Controllers** (`controller/admin_controller.py`) - Business logic
3. **Database** (`mongo.py`) - MongoDB connection
4. **Main App** (`PastResearches.py`) - Flask application with all blueprints

## Features

### 1. User Management

- **GET** `/api/admin/users` - Get all users (with search & pagination)
- **GET** `/api/admin/users/<user_id>` - Get specific user
- **POST** `/api/admin/users` - Create new user
- **PUT** `/api/admin/users/<user_id>` - Update user
- **DELETE** `/api/admin/users/<user_id>` - Delete user

### 2. Research Entry Management

- **GET** `/api/admin/research` - Get all research entries (with pagination)
- **GET** `/api/admin/research/<research_id>` - Get specific entry
- **POST** `/api/admin/research` - Create new entry
- **PUT** `/api/admin/research/<research_id>` - Update entry
- **DELETE** `/api/admin/research/<research_id>` - Delete entry
- **POST** `/api/admin/research/bulk-upload` - Bulk upload from Excel

### 3. Dashboard Statistics

- **GET** `/api/admin/dashboard/stats` - Get admin dashboard statistics

## Setup Instructions

### Step 1: Install Required Packages

```powershell
cd d:\Project\FutureHive-CapstoneProject\Backend
pip install flask flask-cors pymongo python-dotenv pandas openpyxl bson
```

### Step 2: Configure MongoDB

Ensure your `.env` file has the MongoDB connection string:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/FutureHiveDB?retryWrites=true&w=majority
```

### Step 3: Create MongoDB Collections

The backend automatically uses these collections:

- `users` - Stores user information
- `research_entries` - Stores research papers/entries

### Step 4: Start the Backend Server

```powershell
cd d:\Project\FutureHive-CapstoneProject\Backend
python main.py
```

The server will run on `http://localhost:5000`

## API Documentation

### User Management APIs

#### 1. Get All Users

```http
GET /api/admin/users?search=alice&page=1&per_page=5
```

**Query Parameters:**

- `search` (optional) - Search by name or email
- `page` (optional, default: 1) - Page number
- `per_page` (optional, default: 5) - Results per page

**Response:**

```json
{
  "success": true,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "role": "Admin",
      "status": "Active",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ],
  "total": 100,
  "page": 1,
  "per_page": 5,
  "total_pages": 20
}
```

#### 2. Get User by ID

```http
GET /api/admin/users/507f1f77bcf86cd799439011
```

**Response:**

```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "Admin",
    "status": "Active"
  }
}
```

#### 3. Create User

```http
POST /api/admin/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "User",
  "status": "Active"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User",
    "status": "Active"
  },
  "message": "User created successfully"
}
```

#### 4. Update User

```http
PUT /api/admin/users/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "name": "Alice Smith",
  "role": "Moderator"
}
```

#### 5. Delete User

```http
DELETE /api/admin/users/507f1f77bcf86cd799439011
```

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Research Management APIs

#### 1. Get All Research Entries

```http
GET /api/admin/research?page=1&per_page=10
```

**Response:**

```json
{
  "success": true,
  "entries": [
    {
      "_id": "607f1f77bcf86cd799439011",
      "title": "Machine Learning in Healthcare",
      "abstract": "This research explores...",
      "author": "Dr. Sarah Chen",
      "year": 2023,
      "description": "Exploring AI applications...",
      "created_at": "2024-01-01T00:00:00"
    }
  ],
  "total": 50,
  "page": 1,
  "per_page": 10,
  "total_pages": 5
}
```

#### 2. Create Research Entry

```http
POST /api/admin/research
Content-Type: application/json

{
  "title": "AI in Education",
  "abstract": "This paper discusses AI applications in modern education...",
  "author": "Prof. Michael Kumar",
  "year": 2024,
  "description": "AI applications in education..."
}
```

#### 3. Update Research Entry

```http
PUT /api/admin/research/607f1f77bcf86cd799439011
Content-Type: application/json

{
  "title": "Updated Title",
  "year": 2025
}
```

#### 4. Delete Research Entry

```http
DELETE /api/admin/research/607f1f77bcf86cd799439011
```

#### 5. Bulk Upload Research Entries

```http
POST /api/admin/research/bulk-upload
Content-Type: multipart/form-data

file: [Excel file with columns: Title, Abstract, Author, Year]
```

**Excel Format:**
| Title | Abstract | Author | Year |
|-------|----------|--------|------|
| AI Research | Abstract text... | Dr. Smith | 2024 |
| ML Study | Abstract text... | Prof. Jones | 2023 |

**Response:**

```json
{
  "success": true,
  "message": "Successfully uploaded 50 research entries",
  "count": 50
}
```

### Dashboard Statistics API

#### Get Dashboard Stats

```http
GET /api/admin/dashboard/stats
```

**Response:**

```json
{
  "success": true,
  "stats": {
    "total_users": 9247,
    "total_research": 8492,
    "unsupervised_accounts": 10,
    "recent_users": 1247,
    "recent_research": 12
  }
}
```

## Frontend Integration

### Example: Fetch Users in React

```javascript
// Fetch users with search and pagination
const fetchUsers = async (searchQuery = "", page = 1) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/admin/users?search=${searchQuery}&page=${page}&per_page=5`
    );
    const data = await response.json();

    if (data.success) {
      setUsers(data.users);
      setTotalPages(data.total_pages);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

// Create new user
const createUser = async (userData) => {
  try {
    const response = await fetch("http://localhost:5000/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();

    if (data.success) {
      alert("User created successfully!");
      fetchUsers(); // Refresh the list
    }
  } catch (error) {
    console.error("Error creating user:", error);
  }
};

// Delete user
const deleteUser = async (userId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/admin/users/${userId}`,
      {
        method: "DELETE",
      }
    );
    const data = await response.json();

    if (data.success) {
      alert("User deleted successfully!");
      fetchUsers(); // Refresh the list
    }
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

// Bulk upload research from Excel
const handleBulkUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      "http://localhost:5000/api/admin/research/bulk-upload",
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();

    if (data.success) {
      alert(`Successfully uploaded ${data.count} entries!`);
    }
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

// Fetch dashboard statistics
const fetchDashboardStats = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/admin/dashboard/stats"
    );
    const data = await response.json();

    if (data.success) {
      setStats(data.stats);
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
};
```

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  role: String, // "Admin", "User", "Moderator"
  status: String, // "Active", "Inactive", "Unsupervised"
  created_at: DateTime,
  updated_at: DateTime
}
```

### Research Entries Collection

```javascript
{
  _id: ObjectId,
  title: String,
  abstract: String,
  author: String,
  year: Number,
  description: String,
  created_at: DateTime,
  updated_at: DateTime
}
```

## Testing the API

### Using PowerShell (Windows)

```powershell
# Get all users
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users" -Method GET

# Create a user
$body = @{
    name = "Test User"
    email = "test@example.com"
    role = "User"
    status = "Active"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users" -Method POST -Body $body -ContentType "application/json"

# Get dashboard stats
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/dashboard/stats" -Method GET
```

### Using cURL

```bash
# Get all users
curl http://localhost:5000/api/admin/users

# Create a user
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "role": "User",
    "status": "Active"
  }'

# Delete a user
curl -X DELETE http://localhost:5000/api/admin/users/507f1f77bcf86cd799439011

# Bulk upload research
curl -X POST http://localhost:5000/api/admin/research/bulk-upload \
  -F "file=@research_data.xlsx"
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Security Considerations

### TODO: Add Authentication

For production, you should add:

1. **JWT Authentication**
2. **Role-based Access Control (RBAC)**
3. **Input Validation**
4. **Rate Limiting**
5. **HTTPS Only**

Example JWT middleware (to be added):

```python
from functools import wraps
import jwt

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'])
        except:
            return jsonify({'error': 'Token is invalid'}), 401
        return f(*args, **kwargs)
    return decorated
```

## Troubleshooting

### Issue: ModuleNotFoundError

```powershell
pip install flask flask-cors pymongo python-dotenv pandas openpyxl
```

### Issue: MongoDB Connection Failed

- Check your `.env` file for correct `MONGO_URI`
- Ensure MongoDB Atlas allows connections from your IP
- Verify database name is correct

### Issue: CORS Errors

- CORS is already configured in the Flask app
- Frontend should use `http://localhost:5000` as base URL

### Issue: File Upload Not Working

- Ensure `Content-Type: multipart/form-data` header
- Check file has `.xlsx` or `.xls` extension
- Verify Excel file has required columns: Title, Abstract, Author, Year

## Next Steps

1. **Add Authentication** - Implement JWT-based authentication
2. **Add Validation** - Use Flask-Marshmallow for input validation
3. **Add Logging** - Implement proper logging with Python's logging module
4. **Add Tests** - Write unit tests using pytest
5. **Deploy** - Deploy to cloud platform (Heroku, AWS, Azure)

## File Structure

```
Backend/
├── main.py                           # Entry point
├── PastResearches.py                 # Main Flask app
├── mongo.py                          # MongoDB connection
├── routes/
│   ├── admin_route.py                # Admin panel routes
│   ├── pastResearchAsk_route.py      # Existing routes
│   └── ...
├── controller/
│   ├── admin_controller.py           # Admin business logic
│   └── ...
└── datas/
    └── research_data.xlsx            # Sample data
```

## Support

For issues or questions:

1. Check this documentation
2. Review the code comments
3. Test using the provided examples
4. Check Flask and MongoDB documentation

---

**Created:** November 2025  
**Version:** 1.0  
**Author:** FutureHive Team
