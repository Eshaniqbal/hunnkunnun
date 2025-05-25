
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const PLACEHOLDER_API_KEY = "YOUR_API_KEY";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

if (!apiKey || apiKey === PLACEHOLDER_API_KEY) {
  console.error(
    "Firebase API Key is not configured or is using a placeholder. " +
    "Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is set correctly in your environment variables. " +
    "Using placeholder may lead to auth/api-key-not-valid errors."
  );
}

const firebaseConfig = {
  apiKey: apiKey || PLACEHOLDER_API_KEY, // Fallback for initialization, error already logged
  authDomain: authDomain || "YOUR_AUTH_DOMAIN",
  projectId: projectId || "YOUR_PROJECT_ID",
  storageBucket: storageBucket || "YOUR_STORAGE_BUCKET",
  messagingSenderId: messagingSenderId || "YOUR_MESSAGING_SENDER_ID",
  appId: appId || "YOUR_APP_ID",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

