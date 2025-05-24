
/**
 * @fileOverview User Session Management Context.
 * This context handles user authentication state (Firebase-based and simulated offline debug),
 * user roles (teacher/student), and a "View as Student" mode for teachers.
 * It provides functions for login, logout, and toggling views.
 * Firebase handles its own session persistence.
 */
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { APP_AUTHOR } from '@/lib/constants'; // For mock teacher display name

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
  debugSwitchRole?: (newRole: UserRole) => void; // Optional for stricter checking, but will be present in dev
  isLoading: boolean; // True while initial auth state is being determined
  isFirebaseConfigured: boolean;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

/**
 * Provider component for the UserSessionContext.
 * Manages user authentication state, roles, and provides login/logout mechanisms.
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
    if (auth) {
      setIsFirebaseConfigured(true);
      console.log("UserSessionProvider: Firebase auth is configured. Setting up onAuthStateChanged listener.");
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
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
          const teacherEmail = process.env.NEXT_PUBLIC_TEACHER_EMAIL;
          if (appUser.email && teacherEmail && appUser.email.toLowerCase() === teacherEmail.toLowerCase()) {
            setUserRole('teacher');
            console.log("UserSessionProvider: Role set to teacher for", appUser.email);
          } else {
            setUserRole('student');
            console.log("UserSessionProvider: Role set to student for", appUser.email);
          }
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
      }
    } else {
      console.warn("UserSessionProvider: Firebase auth is NOT configured. Google Sign-In will be disabled. Offline debug login may be available.");
      setIsFirebaseConfigured(false);
      setIsLoading(false);
    }
  }, []);

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
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast({ title: "Login Successful", description: "Welcome!" });
      router.prefetch('/');
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      // onAuthStateChanged will set isLoading to false
    }
  }, [toast, isFirebaseConfigured, router]);

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
            return false;
        }
        const debugCredentials: {user: string; pass: string}[] = JSON.parse(credsString);
        const matchedCred = debugCredentials.find(cred => cred.user === username && cred.pass === pass);

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
            toast({ title: "Debug Login Successful", description: `Logged in as Teacher (${username}).` });
            router.prefetch('/');
            return true;
        } else {
            toast({ title: "Magic Login Failed", description: "Invalid debug credentials.", variant: "destructive" });
            return false;
        }
    } catch (error: any) {
        console.error("Magic Login Error:", error);
        toast({ title: "Magic Login Error", description: "An error occurred. Check console.", variant: "destructive" });
        return false;
    } finally {
        setIsLoading(false);
    }
  }, [toast, isFirebaseConfigured, router]);

  const signOutFirebase = useCallback(async () => {
    // Only attempt Firebase sign out if user was actually logged in via Firebase
    if (auth && isFirebaseConfigured && currentUser && !currentUser.uid.startsWith('debug-')) {
      setIsLoading(true);
      try {
        await signOut(auth);
        // onAuthStateChanged will handle setting user to null
      } catch (error: any) {
        console.error("Firebase Sign Out Error:", error);
        toast({
          title: "Logout Failed",
          description: error.message || "Could not sign out. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false); // Reset loading if sign out fails
        return;
      }
    }
    // For both Firebase logout and debug logout, clear local state
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUserRole(null);
    setViewAsStudent(false);
    // No need to setIsLoading(false) here if it's handled by onAuthStateChanged or already done for debug
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    if (!auth || !currentUser || currentUser.uid.startsWith('debug-')) { // If it was a debug user or no auth
        setIsLoading(false);
    }
  }, [toast, isFirebaseConfigured, currentUser]);

  const toggleViewAsStudent = useCallback(() => {
    if (isLoggedIn && userRole === 'teacher') {
      setViewAsStudent(prev => !prev);
    }
  }, [isLoggedIn, userRole]);

  const debugSwitchRole = useCallback((newRole: UserRole) => {
    console.log("debugSwitchRole called with role:", newRole);
    setIsLoading(true);
    let newIsLoggedIn = false;
    let newUser: AppUser | null = null;

    if (newRole === 'teacher') {
      newIsLoggedIn = true;
      newUser = { uid: 'debug-teacher', email: 'debug.teacher@example.com', displayName: `Teacher (${APP_AUTHOR})`, photoURL: null };
    } else if (newRole === 'student') {
      newIsLoggedIn = true;
      newUser = { uid: 'debug-student', email: 'debug.student@example.com', displayName: 'Debug Student', photoURL: null };
    }
    // For null (Guest), newIsLoggedIn and newUser remain false/null

    setCurrentUser(newUser);
    setIsLoggedIn(newIsLoggedIn);
    setUserRole(newRole);
    setViewAsStudent(false); // Always reset viewAsStudent when directly switching role

    toast({ title: "Debug View Changed", description: `Now viewing as: ${newRole || 'Guest'}` });
    
    // Short delay to allow UI to potentially catch up if state changes are too rapid
    setTimeout(() => setIsLoading(false), 50);
  }, [toast, setIsLoading, setCurrentUser, setIsLoggedIn, setUserRole, setViewAsStudent, APP_AUTHOR]);


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
