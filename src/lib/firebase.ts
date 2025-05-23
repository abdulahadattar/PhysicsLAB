
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
const missingKeys: string[] = [];

for (const key of requiredConfigKeys) {
  if (!firebaseConfig[key]) {
    const envVarName = `NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
    missingKeys.push(envVarName);
    allKeysPresent = false;
  }
}

if (!allKeysPresent) {
  const errorMessage = `
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
CRITICAL Firebase Configuration Error:
The following environment variable(s) are MISSING:
  ${missingKeys.join('\n  ')}

Please ensure these variables are correctly set in your .env.local file.
This file MUST be in the root directory of your project.

After creating or modifying .env.local, you MUST RESTART your Next.js development server.
Firebase will NOT initialize correctly until this is resolved.
See .env.example (if provided) or Firebase project settings for these values.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
`;
  console.error(errorMessage);
}


let app: FirebaseApp | undefined = undefined;
let auth: Auth | undefined = undefined;
let googleProvider: GoogleAuthProvider | {} = {}; // Use {} as a fallback to avoid errors if auth is not initialized

// Initialize Firebase ONLY if all keys are present
if (allKeysPresent) {
  if (getApps().length === 0) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
    } catch (error) {
      console.error("Error initializing Firebase app (even after config check):", error);
      // app and auth will remain undefined
    }
  } else {
    app = getApps()[0];
    if (app) {
      try {
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
      } catch (error){
        console.error("Error getting Auth instance from existing Firebase app:", error);
      }
    }
  }
} else {
  // If config keys are missing, do not attempt to initialize.
  // The console errors above are the primary notification.
  console.warn("Firebase initialization SKIPPED due to missing critical configuration variables. Please check your .env.local file and restart the server.");
}


export { app, auth, googleProvider };
