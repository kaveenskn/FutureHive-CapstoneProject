// src/services/userService.js
// Firebase service for user management in Admin Panel

import { db } from "../components/Firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
} from "firebase/firestore";

const USERS_COLLECTION = "users";

/**
 * Get all users with pagination and search
 */
export const getUsers = async (searchQuery = "", page = 1, perPage = 5) => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    let q;

    if (searchQuery) {
      // For search, we'll get all users and filter client-side
      // Note: For better performance with large datasets, consider using Algolia or similar
      q = query(usersRef, orderBy("name"));
      const snapshot = await getDocs(q);

      const allUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter users based on search query
      const filteredUsers = allUsers.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Implement pagination on filtered results
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      return {
        success: true,
        users: paginatedUsers,
        total: filteredUsers.length,
        page,
        per_page: perPage,
        total_pages: Math.ceil(filteredUsers.length / perPage),
      };
    } else {
      // Without search, use efficient pagination
      q = query(usersRef, orderBy("name"), limit(perPage * page));
      const snapshot = await getDocs(q);

      const allUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get total count
      const countSnapshot = await getCountFromServer(usersRef);
      const total = countSnapshot.data().count;

      // Get only the current page
      const startIndex = (page - 1) * perPage;
      const paginatedUsers = allUsers.slice(startIndex);

      return {
        success: true,
        users: paginatedUsers,
        total,
        page,
        per_page: perPage,
        total_pages: Math.ceil(total / perPage),
      };
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get a single user by ID
 */
export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));

    if (userDoc.exists()) {
      return {
        success: true,
        user: {
          id: userDoc.id,
          ...userDoc.data(),
        },
      };
    } else {
      return {
        success: false,
        error: "User not found",
      };
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Create a new user
 */
export const createUser = async (userData) => {
  try {
    const docRef = await addDoc(collection(db, USERS_COLLECTION), {
      name: userData.name,
      email: userData.email,
      role: userData.role || "User",
      status: userData.status || "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return {
      success: true,
      user: {
        id: docRef.id,
        ...userData,
      },
      message: "User created successfully",
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);

    await updateDoc(userRef, {
      ...userData,
      updated_at: new Date().toISOString(),
    });

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const researchRef = collection(db, "research_entries");

    // Get total users count
    const usersCount = await getCountFromServer(usersRef);
    const totalUsers = usersCount.data().count;

    // Get total research entries count
    const researchCount = await getCountFromServer(researchRef);
    const totalResearch = researchCount.data().count;

    // Get unsupervised accounts (users without role or with specific status)
    const unsupervisedQuery = query(
      usersRef,
      where("status", "==", "Unsupervised")
    );
    const unsupervisedSnapshot = await getCountFromServer(unsupervisedQuery);
    const unsupervisedAccounts = unsupervisedSnapshot.data().count;

    return {
      success: true,
      stats: {
        total_users: totalUsers,
        total_research: totalResearch,
        unsupervised_accounts: unsupervisedAccounts,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      error: error.message,
      stats: {
        total_users: 0,
        total_research: 0,
        unsupervised_accounts: 0,
      },
    };
  }
};
