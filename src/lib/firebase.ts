
// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all required Firebase config variables are present
const requiredConfigKeys: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
let allKeysPresent = true;
for (const key of requiredConfigKeys) {
  if (!firebaseConfig[key]) {
    console.error(`Firebase config error: Missing environment variable NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}. Please check your .env.local file.`);
    allKeysPresent = false;
  }
}

if (!allKeysPresent) {
  console.error("Firebase initialization failed due to missing configuration variables. Please ensure all NEXT_PUBLIC_FIREBASE_... variables are set in your .env.local file and restart your development server.");
}

let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0 && allKeysPresent) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (error) {
    console.error("Error initializing Firebase app:", error);
    // @ts-ignore - Allow app and auth to be undefined if init fails
    app = undefined;
    // @ts-ignore
    auth = undefined;
  }
} else if (getApps().length > 0) {
  app = getApps()[0];
  auth = getAuth(app);
} else {
  // @ts-ignore
  app = undefined;
  // @ts-ignore
  auth = undefined;
}

const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
