import { getAnalytics, type Analytics } from 'firebase/analytics';
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

function initFirebase() {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return null;
  }
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
  const app: FirebaseApp =
    getApps().length > 0
      ? (getApps()[0] as FirebaseApp)
      : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const analytics = getAnalytics(app);
  return { app, auth, db, analytics };
}

const fb = initFirebase();

export const app = fb?.app ?? null;
export const auth = fb?.auth ?? null;
export const db = fb?.db ?? null;
export const analytics: Analytics | null = fb?.analytics ?? null;
