/**
 * @fileOverview Firebase SDK Initialization.
 *
 * 👋 Gemini Code Generator Context:
 *
 * This file is responsible for initializing and exporting the Firebase application instance.
 *
 * It should configure Firebase with the project's credentials and initialize the necessary services (Firestore, Auth, Storage, Functions) that the application will use.
 *
 * Ensure that Firebase is initialized only once, regardless of how many times this file is imported.
 *
 * This file is a central point for Firebase-related code and is imported by other parts of the application that interact with Firebase services.
 * It provides the `auth`, `googleProvider`, and `db` (Firestore) instances.
 * Includes checks for missing environment variables and handles initialization errors gracefully
 * to prevent app crashes if Firebase is not configured, allowing other app features to function.\n * Enables Firestore offline persistence.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { indexedDBLocalPersistence } from 'firebase/auth';

import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, type Functions } from 'firebase/functions';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Firebase configuration object.
// IMPORTANT: Firebase configuration MUST be loaded from environment variables
// for security reasons and to avoid exposing credentials in the codebase.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// List of essential Firebase configuration keys.
const requiredConfigKeys: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
let allKeysPresent = true;
const missingKeys: string[] = [];

// Check if all required Firebase configuration keys are present in the environment variables.
for (const key of requiredConfigKeys) {
  if (!firebaseConfig[key as keyof typeof firebaseConfig]) { // Type assertion here
    const envVarName = `NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
    missingKeys.push(envVarName);
    allKeysPresent = false;
  }
}

let app: FirebaseApp | undefined = undefined;
let auth: Auth | undefined = undefined;
let db: Firestore | undefined = undefined; // Firestore database instance
let storage: FirebaseStorage | undefined = undefined; // Firebase Storage instance
let functions: Functions | undefined = undefined; // Firebase Functions instance
let googleProvider: GoogleAuthProvider | undefined = undefined; // Use undefined as a fallback if Firebase doesn't init

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
      storage = getStorage(app); // Initialize Storage
      functions = getFunctions(app); // Initialize Functions
      if (auth) {
        auth.setPersistence(indexedDBLocalPersistence);
        console.log("Firebase Auth IndexedDB persistence enabled.");
      } else {
 console.warn("Firebase Auth not initialized, cannot enable IndexedDB persistence.");
      }
      console.log("Firebase app, auth, and Firestore initialized successfully.");
    } catch (error) {
      console.error("Error initializing Firebase app (even after config check):", error);
      // Ensure auth, app, and db are undefined if initialization fails catastrophically
 app = undefined;
 auth = undefined;
 db = undefined;
 storage = undefined;
 functions = undefined;
    }
  } else {
    // Firebase app already initialized, get existing instance.
    app = getApps()[0];
    if (app) {
 auth = getAuth(app); // Get auth instance from existing app
 db = getFirestore(app); // Get Firestore instance from existing app
      try {
        auth = getAuth(app); // Get auth instance from existing app
        db = getFirestore(app); // Get Firestore instance from existing app
        if (auth) {
        auth.setPersistence(indexedDBLocalPersistence);
        console.log("Firebase Auth IndexedDB persistence enabled on existing app.");
        } else {
 console.warn("Firebase Auth not obtained from existing app, cannot enable IndexedDB persistence.");
        }
 storage = getStorage(app); // Get Storage instance from existing app
 functions = getFunctions(app); // Get Functions instance from existing app
        googleProvider = new GoogleAuthProvider();
      } catch (error){
 console.error("Error getting Auth, Firestore, Storage, or Functions instance from existing Firebase app:", error);
 auth = undefined; // Ensure auth, db, storage, and functions are undefined on error
 db = undefined;
 storage = undefined;
 functions = undefined;
      }
    }
  }
}
