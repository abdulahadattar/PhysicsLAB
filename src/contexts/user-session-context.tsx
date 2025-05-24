
/**
 * @fileOverview User Session Management Context.
 * This context handles user authentication state (Firebase-based and simulated offline debug),
 * user roles (teacher/student, potentially fetched from Firestore), and a "View as Student" mode for teachers.
 * It provides functions for login, logout, and toggling views.
 */
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider, db } from '@/lib/firebase'; // Import db for Firestore
import { signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
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

          // Attempt to fetch role from Firestore
          let roleFromDb: UserRole = null;
          try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              if (userData.role && (userData.role === 'teacher' || userData.role === 'student')) {
                roleFromDb = userData.role as UserRole;
                console.log(`UserSessionProvider: Role '${roleFromDb}' fetched from Firestore for ${appUser.email}.`);
              } else {
                console.warn(`UserSessionProvider: User document for ${appUser.email} exists in Firestore but missing/invalid 'role' field.`);
              }
            } else {
              console.log(`UserSessionProvider: No custom role document found in Firestore for ${appUser.email}. Will use fallback logic.`);
            }
          } catch (error) {
            const firestoreError = error as FirestoreError;
            console.error("UserSessionProvider: Error fetching user role from Firestore:", firestoreError.message);
            // Potentially show a non-critical toast if Firestore read fails but auth succeeds
            // toast({ title: "Profile Info", description: "Could not fetch custom profile details. Using default role.", variant: "default" });
          }

          if (roleFromDb) {
            setUserRole(roleFromDb);
          } else {
            // Fallback to email-based teacher detection if no role from Firestore
            const teacherEmail = process.env.NEXT_PUBLIC_TEACHER_EMAIL;
            if (appUser.email && teacherEmail && appUser.email.toLowerCase() === teacherEmail.toLowerCase()) {
              setUserRole('teacher');
              console.log("UserSessionProvider: Role set to teacher (email fallback) for", appUser.email);
            } else {
              setUserRole('student');
              console.log("UserSessionProvider: Role set to student (default fallback) for", appUser.email);
            }
          }
          setViewAsStudent(false); // Reset viewAsStudent on any auth change
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
      const localRole = localStorage.getItem('debugUserRole') as UserRole;
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
  }, []); // Empty dependency array: runs once on mount

  const signInWithGoogle = useCallback(async () => {
    if (!auth || !isFirebaseConfigured) {
      toast({
        title: "Google Login Unavailable",
        description: "Firebase is not configured. Please check environment variables.",
        variant: "destructive",
      });
      console.error("signInWithGoogle: Firebase auth is not available or configured.");
      return;
    }
    setIsLoading(true); // Set loading true before starting sign-in
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle setting user state, including Firestore role check.
      // Toast for successful login is now handled by onAuthStateChanged or can be added here if needed.
      // router.prefetch('/'); // Prefetch dashboard after login (already there)
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false); // Ensure loading is false if sign-in process itself fails
    }
    // Note: onAuthStateChanged will also set isLoading to false eventually.
  }, [toast, isFirebaseConfigured]);

  const magicLogin = useCallback(async (username: string, pass: string): Promise<boolean> => {
     if (typeof window !== 'undefined' && navigator.onLine && isFirebaseConfigured) {
        toast({ title: "Magic Login Not Permitted", description: "Firebase is configured; please use Google Sign-In or debug role switcher.", variant: "default" });
        return false;
    }
    setIsLoading(true);
    try {
        const credsString = process.env.NEXT_PUBLIC_DEBUG_TEACHER_CREDENTIALS;
        if (!credsString) {
            toast({ title: "Magic Login Error", description: "Debug credentials not configured.", variant: "destructive" });
            setIsLoading(false);
            return false;
        }
        const debugCredentialsArray: {user: string; pass: string}[] = JSON.parse(credsString);
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
            localStorage.setItem('debugUserRole', 'teacher'); // Persist for non-Firebase sessions
            toast({ title: "Debug Login Successful", description: `Logged in as Teacher (${username}).` });
            router.prefetch('/');
            setIsLoading(false);
            return true;
        } else {
            toast({ title: "Magic Login Failed", description: "Invalid debug credentials.", variant: "destructive" });
            setIsLoading(false);
            return false;
        }
    } catch (error: any) {
        console.error("Magic Login Error:", error);
        toast({ title: "Magic Login Error", description: "An error occurred. Check console.", variant: "destructive" });
        setIsLoading(false);
        return false;
    }
  }, [toast, isFirebaseConfigured, router]);

  const signOutFirebase = useCallback(async () => {
    if (auth && isFirebaseConfigured && currentUser && !currentUser.uid.startsWith('debug-')) {
      setIsLoading(true);
      try {
        await signOut(auth);
        // onAuthStateChanged will handle setting user to null and thus isLoading to false.
      } catch (error: any) {
        console.error("Firebase Sign Out Error:", error);
        toast({
          title: "Logout Failed",
          description: error.message || "Could not sign out. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false); // Ensure loading is false if sign-out itself fails
        return;
      }
    }
    // For both Firebase logout and debug/local logout, clear local state immediately
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUserRole(null);
    setViewAsStudent(false);
    localStorage.removeItem('debugUserRole');
    
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    if (!auth || !isFirebaseConfigured || (currentUser && currentUser.uid.startsWith('debug-'))) {
        setIsLoading(false); // Ensure loading is reset for non-Firebase or debug logouts
    }
  }, [toast, isFirebaseConfigured, currentUser]);

  const toggleViewAsStudent = useCallback(() => {
    if (isLoggedIn && userRole === 'teacher') {
      setViewAsStudent(prev => !prev);
    }
  }, [isLoggedIn, userRole]);

  const debugSwitchRole = useCallback((newRole: UserRole) => {
    console.log("UserSessionContext: debugSwitchRole called with role:", newRole);
    setIsLoading(true);
    let newIsLoggedIn = false;
    let newUser: AppUser | null = null;

    if (newRole === 'teacher') {
      newIsLoggedIn = true;
      newUser = { uid: 'debug-teacher', email: 'debug.teacher@example.com', displayName: `Teacher (${APP_AUTHOR})`, photoURL: null };
      localStorage.setItem('debugUserRole', 'teacher');
    } else if (newRole === 'student') {
      newIsLoggedIn = true;
      newUser = { uid: 'debug-student', email: 'debug.student@example.com', displayName: 'Debug Student', photoURL: null };
      localStorage.setItem('debugUserRole', 'student');
    } else { // Guest
      localStorage.removeItem('debugUserRole');
    }
    
    setCurrentUser(newUser);
    setIsLoggedIn(newIsLoggedIn);
    setUserRole(newRole);
    setViewAsStudent(false);

    toast({ title: "Debug View Changed", description: `Now viewing as: ${newRole || 'Guest'}` });
    
    setTimeout(() => setIsLoading(false), 50); // Short delay for UI to settle if needed
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
}

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
