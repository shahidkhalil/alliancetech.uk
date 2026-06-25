import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

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

let analytics: Analytics | undefined;
export async function getFirebaseAnalytics() {
  if (typeof window === "undefined") return undefined;
  if (analytics) return analytics;
  if (await isSupported()) {
    analytics = getAnalytics(app);
  }
  return analytics;
}

export default app;
