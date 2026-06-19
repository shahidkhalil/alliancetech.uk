import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRQGCPHq99dVFXIQVH0C4FlIz3GQhUR1Y",
  authDomain: "alliancepak.firebaseapp.com",
  projectId: "alliancepak",
  storageBucket: "alliancepak.firebasestorage.app",
  messagingSenderId: "636273208966",
  appId: "1:636273208966:web:655a262305128f76c92b07",
  measurementId: "G-R9WQSXQFLE",
};

// Prevent duplicate initialization in Next.js dev mode
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export default app;
