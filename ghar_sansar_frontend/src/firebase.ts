// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnkNmAI_gIm-i11on0rLZC8jeB9Njd_Lo",
  authDomain: "gharsansar-90b6e.firebaseapp.com",
  projectId: "gharsansar-90b6e",
  storageBucket: "gharsansar-90b6e.firebasestorage.app",
  messagingSenderId: "614084198450",
  appId: "1:614084198450:web:a6e2be10d50a8ef2c9bc2b",
  measurementId: "G-G13C48P6PV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider };
