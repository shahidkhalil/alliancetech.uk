import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDRQGCPHq99dVFXIQVH0C4FlIz3GQhUR1Y",
  authDomain: "alliancepak.firebaseapp.com",
  projectId: "alliancepak",
  storageBucket: "alliancepak.firebasestorage.app",
  messagingSenderId: "636273208966",
  appId: "1:636273208966:web:655a262305128f76c92b07",
  measurementId: "G-R9WQSXQFLE",
};

function getApp(): FirebaseApp {
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
}

let _db: Firestore | undefined;
/** Firestore only — safe for forms/chat. Does not load Firebase Auth. */
export function getDb(): Firestore {
  if (!_db) _db = getFirestore(getApp());
  return _db;
}

let _auth: Auth | undefined;
/** Lazy Auth — only call from admin (or other authenticated surfaces). */
export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(getApp());
  return _auth;
}
