/**
 * @fileOverview User Session Management Context.
 */
/* 
👋 Gemini Code Generator Context:

This file defines the UserSessionContext, which is intended to manage the user's authentication state and potentially user data (including roles based on Firebase Custom Claims).

According to the TODO list, this context is crucial for implementing User Roles and Authentication. It should:
- Listen for Firebase Authentication state changes.
- Store the authenticated user object.
- Fetch and store user's custom claims (roles) after login or auth state change.
- Provide functions to access the user object, their roles, and potentially login/logout functionality (though login/logout might be handled elsewhere and trigger context updates).
- Be used by components throughout the app to determine user permissions and personalize the experience.

Ensure the context is implemented using React's Context API and useState/useReducer as appropriate. It should handle loading states and potential errors during authentication.
*/
/**
 * This context handles user authentication state (Firebase-based and simulated offline debug),
 * user roles (teacher/student, potentially fetched from Firestore), and a "View as Student" mode for teachers.
 * It provides functions for login, logout, and toggling views.
 */
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider, db } from '@/lib/firebase'; // Import db for Firestore
import { signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser, GoogleAuthProvider as FirebaseGoogleAuthProviderInstance } from 'firebase/auth';
import { doc, getDoc, type FirestoreError } from 'firebase/firestore'; // Firestore imports
import { useToast } from '@/hooks/use-toast';
import { APP_AUTHOR } from '@/lib/constants';

/**
 * Defines possible user roles within the application.
 */
export type UserRole = 'teacher' | 'student' | null;

/**
 * Represents the structure of the application user, derived from FirebaseUser or mocked.
 */
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Defines the shape of the UserSessionContext.
 */
interface UserSessionContextType {
  currentUser: AppUser | null;
  isLoggedIn: boolean;
  userRole: UserRole;
  viewAsStudent: boolean; // True if teacher is viewing as student
  signInWithGoogle: () => Promise<void>;
  magicLogin: (username: string, pass: string) => Promise<boolean>; // For offline teacher debug
  signOutFirebase: () => Promise<void>;
  toggleViewAsStudent: () => void;
  debugSwitchRole?: (newRole: UserRole) => void;
  isLoading: boolean; // True while initial auth state is being determined
  isFirebaseConfigured: boolean;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

/**
 * Provider component for the UserSessionContext.
 * Manages user authentication state, roles (with Firestore override), and provides login/logout mechanisms.
 */
export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [viewAsStudent, setViewAsStudent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    if (auth && db) { // Check if Firebase auth AND db are configured
      setIsFirebaseConfigured(true);
      console.log("UserSessionProvider: Firebase auth & db configured. Setting up onAuthStateChanged listener.");
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        console.log("UserSessionProvider: onAuthStateChanged triggered. User:", firebaseUser?.email);
        if (firebaseUser) {
          const appUser: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };
          setCurrentUser(appUser);
          setIsLoggedIn(true);

          let userRoleFromClaims: UserRole = 'student'; // Default role

          try {
            const idTokenResult = await firebaseUser.getIdTokenResult();
            const role = idTokenResult.claims.role;
            if (role === 'teacher' || role === 'student') {
              userRoleFromClaims = role as UserRole;
            }
            console.log(`UserSessionProvider: Role '${userRoleFromClaims}' fetched from custom claims for ${appUser.email}.`);
          } catch (error) {
            console.error("UserSessionProvider: Error fetching ID token result or claims:", error);
          }
          setUserRole(userRoleFromClaims);
          setViewAsStudent(false);
        } else {
          setCurrentUser(null);
          setIsLoggedIn(false);
          setUserRole(null);
          setViewAsStudent(false);
          console.log("UserSessionProvider: No Firebase user. Logged out.");
        }
        setIsLoading(false);
      });
      return () => {
        console.log("UserSessionProvider: Cleaning up onAuthStateChanged listener.");
        unsubscribe();
      };
    } else {
      console.warn("UserSessionProvider: Firebase auth or Firestore (db) is NOT configured. Google Sign-In and Firestore features will be disabled. Offline debug login may be available.");
      setIsFirebaseConfigured(false);
      let localRole: UserRole = null;
      try {
        localRole = localStorage.getItem('debugUserRole') as UserRole;
      } catch (e) {
        console.error('Error reading debugUserRole from localStorage:', e);
      }
      if (localRole) {
        setUserRole(localRole);
        setIsLoggedIn(true);
        if (localRole === 'teacher') {
            setCurrentUser({ uid: 'debug-teacher-local', email: 'teacher@debug.local', displayName: `Teacher (${APP_AUTHOR})`, photoURL: null });
        } else if (localRole === 'student') {
            setCurrentUser({ uid: 'debug-student-local', email: 'student@debug.local', displayName: 'Debug Student', photoURL: null });
        }
      }
      setIsLoading(false);
    }
  }, [router, toast]); // Added router and toast as they are used in callbacks, though not directly in this useEffect. Better safe.

  const signInWithGoogle = useCallback(async () => {
    if (!auth || !googleProvider || !isFirebaseConfigured) {
      toast({
        title: "Google Login Unavailable",
        description: "Firebase is not configured or Google Provider is not initialized. Please check environment variables.",
        variant: "destructive",
      });
      console.error("signInWithGoogle: Firebase auth, Google Provider, or configuration is not available.");
      return;
    }
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      // setIsLoading(false); // onAuthStateChanged will handle this
    }
  }, [toast, isFirebaseConfigured, setIsLoading]); // Added setIsLoading

  const magicLogin = useCallback(async (username: string, pass: string): Promise<boolean> => {
    if (typeof window !== 'undefined' && navigator.onLine && isFirebaseConfigured) {
      toast({ title: "Magic Login Not Permitted", description: "Firebase is configured; please use Google Sign-In or debug role switcher.", variant: "default" });
      return false;
    }
    setIsLoading(true);
    try {
      const credsStringEnv = process.env.NEXT_PUBLIC_DEBUG_TEACHER_CREDENTIALS; // Renamed to avoid conflict if there was a local credsString
      if (!credsStringEnv) {
        toast({ title: "Magic Login Error", description: "Debug credentials not configured.", variant: "destructive" });
        return false;
      }
      const debugCredentialsArray: {user: string; pass: string}[] = JSON.parse(credsStringEnv);
      const matchedCred = debugCredentialsArray.find(cred => cred.user === username && cred.pass === pass);

      if (matchedCred) {
        const mockTeacherUser: AppUser = {
          uid: `debug-teacher-${username}`,
          email: `${username}@debug.local`,
          displayName: `Debug Teacher (${username})`,
          photoURL: null,
        };
        setCurrentUser(mockTeacherUser);
        setIsLoggedIn(true);
        setUserRole('teacher');
        setViewAsStudent(false);
        localStorage.setItem('debugUserRole', 'teacher');
        toast({ title: "Debug Login Successful", description: `Logged in as Teacher (${username}).` });
        router.prefetch('/');
        return true;
      } else {
        toast({ title: "Magic Login Failed", description: "Invalid debug credentials.", variant: "destructive" });
        return false;
      }
    } catch (error: any) {
      console.error("Magic Login Error (inside catch):", error);
      toast({ title: "Magic Login Error", description: "An error occurred. Check console.", variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, isFirebaseConfigured, router, setIsLoading, setCurrentUser, setIsLoggedIn, setUserRole, setViewAsStudent]);

  const signOutFirebase = useCallback(async () => {
    if (auth && isFirebaseConfigured && currentUser && !currentUser.uid.startsWith('debug-')) {
      setIsLoading(true);
      try {
        await signOut(auth);
      } catch (error: any) {
        console.error("Firebase Sign Out Error:", error);
        toast({
          title: "Logout Failed",
          description: error.message || "Could not sign out. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUserRole(null);
    setViewAsStudent(false);
    try {
      localStorage.removeItem('debugUserRole');
    } catch (e) {
      console.error('Error removing debugUserRole from localStorage:', e);
    }
    
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    if (!auth || !isFirebaseConfigured || (currentUser && currentUser.uid.startsWith('debug-'))) {
        setIsLoading(false);
    }
  }, [toast, isFirebaseConfigured, currentUser, setIsLoading, setCurrentUser, setIsLoggedIn, setUserRole, setViewAsStudent]);

  const toggleViewAsStudent = useCallback(() => {
    if (isLoggedIn && userRole === 'teacher') {
      setViewAsStudent(prev => !prev);
    }
  }, [isLoggedIn, userRole, setViewAsStudent]); // Added setViewAsStudent

  const debugSwitchRole = useCallback((newRole: UserRole) => {
    console.log("UserSessionContext: debugSwitchRole called with role:", newRole);
    setIsLoading(true);
    let newIsLoggedIn = false;
    let newUser: AppUser | null = null;

    if (newRole === 'teacher') {
      newIsLoggedIn = true;
      newUser = { uid: 'debug-teacher', email: 'debug.teacher@example.com', displayName: `Teacher (${APP_AUTHOR})`, photoURL: null };
      try {
        localStorage.setItem('debugUserRole', 'teacher');
      } catch (e) {
        console.error('Error writing debugUserRole to localStorage:', e);
      }
    } else if (newRole === 'student') {
      newIsLoggedIn = true;
      newUser = { uid: 'debug-student', email: 'debug.student@example.com', displayName: 'Debug Student', photoURL: null };
      try {
        localStorage.setItem('debugUserRole', 'student');
      } catch (e) {
        console.error('Error writing debugUserRole to localStorage:', e);
      }
    } else {
      try {
        localStorage.removeItem('debugUserRole');
      } catch (e) {
        console.error('Error removing debugUserRole from localStorage:', e);
      }
    }
    
    setCurrentUser(newUser);
    setIsLoggedIn(newIsLoggedIn);
    setUserRole(newRole);
    setViewAsStudent(false);

    toast({ title: "Debug View Changed", description: `Now viewing as: ${newRole || 'Guest'}` });
    
    setTimeout(() => setIsLoading(false), 50);
  }, [toast, setIsLoading, setCurrentUser, setIsLoggedIn, setUserRole, setViewAsStudent]);

  const contextValue = useMemo(() => ({
    currentUser,
    isLoggedIn,
    userRole,
    viewAsStudent,
    signInWithGoogle,
    magicLogin,
    signOutFirebase,
    toggleViewAsStudent,
    debugSwitchRole,
    isLoading,
    isFirebaseConfigured
  }), [
    currentUser, isLoggedIn, userRole, viewAsStudent,
    signInWithGoogle, magicLogin, signOutFirebase, toggleViewAsStudent,
    debugSwitchRole,
    isLoading, isFirebaseConfigured
  ]);

  return (
    <UserSessionContext.Provider value={contextValue}>
      {children}
    </UserSessionContext.Provider>
  );
} // <-- This is the closing brace for UserSessionProvider

/**
 * Custom hook to use the UserSessionContext.
 */
export function useUserSession() {
  const context = useContext(UserSessionContext);
  if (context === undefined) {
    throw new Error('useUserSession must be used within a UserSessionProvider');
  }
  return context;
}