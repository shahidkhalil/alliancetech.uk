import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyClnwfLBrM088xsGzSc3ob9IU-IHJbW1VQ",
  authDomain: "alliance-tech-656ba.firebaseapp.com",
  projectId: "alliance-tech-656ba",
  storageBucket: "alliance-tech-656ba.firebasestorage.app",
  messagingSenderId: "232722176419",
  appId: "1:232722176419:web:eeb2144c9ed1970c26e216",
  measurementId: "G-34PXZF6WML",
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

let _storage: FirebaseStorage | undefined;
/** Lazy Storage — blog cover images and admin uploads. */
export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) _storage = getStorage(getApp());
  return _storage;
}
