import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBE8M11pu50TRfRx-s7khgdys6X1zkj44M",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "rflix-91ab8.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "rflix-91ab8",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "rflix-91ab8.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "844475180177",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:844475180177:web:680bda8368d4a677f74b30",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-G07XWR839H"
};

// Initialize Firebase (Singleton pattern)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
export const db = getFirestore(app);

// Safe Analytics helper - completely insulated from adblocker / extension interference
export const initAnalytics = async () => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') return null;
  try {
    // Only attempt in production if measurement ID is present and indexedDB is supported
    if (firebaseConfig.measurementId && 'indexedDB' in window) {
      const { isSupported, getAnalytics } = await import('firebase/analytics');
      const supported = await isSupported().catch(() => false);
      if (supported) {
        return getAnalytics(app);
      }
    }
  } catch {
    // Gracefully handle browser extension / adblocker blockades (ERR_BLOCKED_BY_CLIENT / extension interceptors)
    return null;
  }
  return null;
};

export default app;
