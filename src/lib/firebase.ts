// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "single-5b69e.firebaseapp.com",
  databaseURL: "https://single-5b69e-default-rtdb.firebaseio.com",
  projectId: "single-5b69e",
  storageBucket: "single-5b69e.firebasestorage.app",
  messagingSenderId: "24015769510",
  appId: "1:24015769510:web:7d8ecc24f63f43d630c967",
  measurementId: "G-3YEM677418"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const database = getDatabase(app);
export const storage = getStorage(app);
export { app };
