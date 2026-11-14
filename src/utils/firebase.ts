import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Every EXPO_PUBLIC_* var gets baked into the web bundle at export time —
// see .env.example for what to put in .env.local. Until all six are set,
// firebaseConfigured stays false and login/cloud-save quietly doesn't
// render anywhere, so a deploy before Firebase is set up behaves exactly
// like the no-login build it's replacing.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(firebaseConfig).every((v) => !!v);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

if (firebaseConfigured) {
  app = initializeApp(firebaseConfig as Record<string, string>);
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
}

// Only valid to call when firebaseConfigured is true — every call site
// checks that first, so these asserting getters catch a real wiring bug
// loudly instead of silently no-op-ing.
export function getFirebaseAuth(): Auth {
  if (!authInstance) throw new Error('Firebase is not configured');
  return authInstance;
}

export function getFirebaseDb(): Firestore {
  if (!dbInstance) throw new Error('Firebase is not configured');
  return dbInstance;
}
