const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
// Provide credentials via one of:
// - Backend/firebase-service-account.json (local dev)
// - FIREBASE_SERVICE_ACCOUNT_PATH env var
// - GOOGLE_APPLICATION_CREDENTIALS env var
let db = null;
let firebaseInitError = null;

try {
  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(__dirname, "firebase-service-account.json");

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      `Missing Firebase service account JSON. Expected at: ${serviceAccountPath}. ` +
        "Download it from Firebase Console → Project Settings → Service Accounts → Generate new private key, " +
        "then save it as Backend/firebase-service-account.json (or set FIREBASE_SERVICE_ACCOUNT_PATH)."
    );
  }

  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  db = admin.firestore();
} catch (err) {
  firebaseInitError = err;
  console.error("\n❌ Firebase Admin SDK failed to initialize:");
  console.error(err && err.message ? err.message : err);
  console.error(
    "\nThe server will still start, but /api/* endpoints will return 503 until credentials are configured.\n"
  );
}

const requireFirestore = (req, res, next) => {
  if (db) return next();
  return res.status(503).json({
    success: false,
    error:
      firebaseInitError && firebaseInitError.message
        ? firebaseInitError.message
        : "Firebase is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or add Backend/firebase-service-account.json",
  });
};

// ============ USER MANAGEMENT ENDPOINTS ============

// GET all users with pagination and search
app.get("/api/users", async (req, res) => {
  if (!db) return requireFirestore(req, res, () => {});
  try {
    const { page = 1, limit = 5, search = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let query = db.collection("users");

    // Get all documents
    const snapshot = await query.get();
    let allDocs = snapshot.docs;

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      allDocs = allDocs.filter((doc) => {
        const data = doc.data();
        return (
          data.name?.toLowerCase().includes(searchLower) ||
          data.email?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedDocs = allDocs.slice(startIndex, endIndex);

    const users = paginatedDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      users,
      total: allDocs.length,
      page: pageNum,
      per_page: limitNum,
      total_pages: Math.ceil(allDocs.length / limitNum),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET single user by ID
app.get("/api/users/:id", async (req, res) => {
  if (!db) return requireFirestore(req, res, () => {});
  try {
    const doc = await db.collection("users").doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST - Create new user
app.post("/api/users", async (req, res) => {
  if (!db) return requireFirestore(req, res, () => {});
  try {
    const { name, email, role, status } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: "Name and email are required",
      });
    }

    const newUser = {
      name,
      email,
      role: role || "User",
      status: status || "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docRef = await db.collection("users").add(newUser);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: docRef.id,
        ...newUser,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT - Update user
app.put("/api/users/:id", async (req, res) => {
  if (!db) return requireFirestore(req, res, () => {});
  try {
    const { name, email, role, status } = req.body;

    // Check if user exists
    const userDoc = await db.collection("users").doc(req.params.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      ...(status && { status }),
      updated_at: new Date().toISOString(),
    };

    await db.collection("users").doc(req.params.id).update(updateData);

    const updatedDoc = await db.collection("users").doc(req.params.id).get();

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE - Delete user
app.delete("/api/users/:id", async (req, res) => {
  if (!db) return requireFirestore(req, res, () => {});
  try {
    // Check if user exists
    const userDoc = await db.collection("users").doc(req.params.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await db.collection("users").doc(req.params.id).delete();

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============ DASHBOARD STATS ENDPOINTS ============

// GET dashboard statistics
app.get("/api/dashboard/stats", async (req, res) => {
  if (!db) return requireFirestore(req, res, () => {});
  try {
    const [usersSnapshot, researchSnapshot] = await Promise.all([
      db.collection("users").get(),
      db.collection("research_entries").get(),
    ]);

    const users = usersSnapshot.docs.map((doc) => doc.data());
    const unsupervisedCount = users.filter(
      (u) => u.status === "Unsupervised"
    ).length;

    res.json({
      success: true,
      stats: {
        total_users: usersSnapshot.size,
        total_research: researchSnapshot.size,
        unsupervised_accounts: unsupervisedCount,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============ HEALTH CHECK ============

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Firebase API Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "FutureHive Firebase API Server",
    endpoints: {
      health: "GET /health",
      users: {
        list: "GET /api/users?page=1&limit=5&search=",
        get: "GET /api/users/:id",
        create: "POST /api/users",
        update: "PUT /api/users/:id",
        delete: "DELETE /api/users/:id",
      },
      dashboard: {
        stats: "GET /api/dashboard/stats",
      },
    },
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n🔥 Firebase API Server running on http://localhost:${PORT}`);
  console.log(`\n📝 Available endpoints:`);
  console.log(`   GET    http://localhost:${PORT}/health`);
  console.log(`   GET    http://localhost:${PORT}/api/users`);
  console.log(`   GET    http://localhost:${PORT}/api/users/:id`);
  console.log(`   POST   http://localhost:${PORT}/api/users`);
  console.log(`   PUT    http://localhost:${PORT}/api/users/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/users/:id`);
  console.log(`   GET    http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`\n✅ Ready for Postman testing!\n`);
});
