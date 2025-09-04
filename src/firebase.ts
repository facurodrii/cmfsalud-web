import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHnSmGMrVjAcBpJpV2kJbAEF08BFtzLsA",
  authDomain: "cmfsalud-8beda.firebaseapp.com",
  projectId: "cmfsalud-8beda",
  storageBucket: "cmfsalud-8beda.firebasestorage.app",
  messagingSenderId: "77729385748",
  appId: "1:77729385748:web:c58eb56b47d1d369fb8601"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
