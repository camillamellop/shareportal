// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCvI99h6xutWyZ-SlMDCvbS7p-xp604aro",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aeroportal-brasil.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aeroportal-brasil",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aeroportal-brasil.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "136549004745",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:136549004745:web:e78ee54833482bdcfde418"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app; 