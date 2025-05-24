/**
 * @fileOverview Firebase SDK Initialization.
 * This file configures and initializes the Firebase app using environment variables.
 * It provides the `auth`, `googleProvider`, and `db` (Firestore) instances.
 * Includes checks for missing environment variables and handles initialization errors gracefully
 * to prevent app crashes if Firebase is not configured, allowing other app features to function.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Firebase configuration object, populated from environment variables.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// List of essential Firebase configuration keys.
const requiredConfigKeys: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
let allKeysPresent = true;
const missingKeys: string[] = [];

// Check if all required Firebase configuration keys are present in the environment variables.
for (const key of requiredConfigKeys) {
  if (!firebaseConfig[key]) {
    const envVarName = `NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
    missingKeys.push(envVarName);
    allKeysPresent = false;
  }
}

let app: FirebaseApp | undefined = undefined;
let auth: Auth | undefined = undefined;
let db: Firestore | undefined = undefined; // Firestore database instance
let googleProvider: GoogleAuthProvider | {} = {}; // Use {} as a fallback if Firebase doesn't init

if (!allKeysPresent) {
  // If essential keys are missing, log a prominent warning and do not attempt to initialize Firebase.
  // This prevents the app from crashing due to Firebase errors if not configured.
  const errorMessage = `
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
CRITICAL Firebase Configuration Error:
The following environment variable(s) are MISSING:
  ${missingKeys.join('\n  ')}

Please ensure these variables are correctly set in your .env.local file.
This file MUST be in the root directory of your project.

After creating or modifying .env.local, you MUST RESTART your Next.js development server.
Firebase will NOT initialize correctly until this is resolved.
Firebase features like Google Sign-In and Firestore integration will be disabled.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
`;
  console.warn(errorMessage);
  // app, auth, and db will remain undefined, preventing initialization attempts
} else {
  // All required keys are present, attempt to initialize Firebase.
  if (getApps().length === 0) { // Check if Firebase app hasn't been initialized yet
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app); // Initialize Firestore
      googleProvider = new GoogleAuthProvider();
      console.log("Firebase app, auth, and Firestore initialized successfully.");
    } catch (error) {
      console.error("Error initializing Firebase app (even after config check):", error);
      // Ensure auth, app, and db are undefined if initialization fails catastrophically
      auth = undefined;
      app = undefined;
      db = undefined;
    }
  } else {
    // Firebase app already initialized, get existing instance.
    app = getApps()[0];
    if (app) {
      try {
        auth = getAuth(app); // Get auth instance from existing app
        db = getFirestore(app); // Get Firestore instance from existing app
        googleProvider = new GoogleAuthProvider();
      } catch (error){
        console.error("Error getting Auth or Firestore instance from existing Firebase app:", error);
        auth = undefined; // Ensure auth and db are undefined on error
        db = undefined;
      }
    }
  }
}

export { app, auth, db, googleProvider };
