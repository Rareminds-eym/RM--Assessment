// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6jBamEg4pCsUzy1MMJk03LfsARCJpxmA",
  authDomain: "assessmentquiz-f75f0.firebaseapp.com",
  projectId: "assessmentquiz-f75f0",
  storageBucket: "assessmentquiz-f75f0.firebasestorage.app",
  messagingSenderId: "399939610782",
  appId: "1:399939610782:web:c6bff6ad254c1f4be4b38f",
  measurementId: "G-JGHWG0X9XG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app, analytics };