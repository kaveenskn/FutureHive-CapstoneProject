// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvyouGJsJ99a-3kYhMun3HDViM-XouZGs",
  authDomain: "futurehive-capstoneproject.firebaseapp.com",
  projectId: "futurehive-capstoneproject",
  storageBucket: "futurehive-capstoneproject.firebasestorage.app",
  messagingSenderId: "275365333619",
  appId: "1:275365333619:web:e6e32a6ea56c8654b5f806",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
