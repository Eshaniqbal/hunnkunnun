
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, type Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCh2sxuzUsxnTEU3QgM2lRVBlKJI3k_DqM",
  authDomain: "kashurprop-3b5c3.firebaseapp.com",
  projectId: "kashurprop-3b5c3",
  storageBucket: "kashurprop-3b5c3.appspot.com", // Standard format for storageBucket
  messagingSenderId: "651796855318",
  appId: "1:651796855318:web:8d43f4fe9dfe1dd42d5337",
  measurementId: "G-MXYCKVR4KC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let analytics: Analytics | undefined;

if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, storage, analytics };
