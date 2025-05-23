
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
import { useRouter } from 'next/navigation'; // Import useRouter
import { auth, googleProvider } from '@/lib/firebase'; 
import { signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

/**
 * Defines possible user roles within the application.
 */
export type UserRole = 'teacher' | 'student' | null;

/**
 * Represents the structure of the application user, derived from FirebaseUser.
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
  isLoading: boolean; // True while initial auth state is being determined
  isFirebaseConfigured: boolean; // True if Firebase SDK initialized correctly
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

/**
 * Provider component for the UserSessionContext.
 * Manages user authentication state, roles, and provides login/logout mechanisms.
 * It integrates with Firebase for Google Sign-In and has a fallback "magic login"
 * for offline teacher debugging.
 */
export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [viewAsStudent, setViewAsStudent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    setIsLoading(true);
    if (auth) { 
      setIsFirebaseConfigured(true);
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
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
          } else {
            setUserRole('student');
          }
          setViewAsStudent(false); 
        } else {
          setCurrentUser(null);
          setIsLoggedIn(false);
          setUserRole(null);
          setViewAsStudent(false);
        }
        setIsLoading(false);
      });
      return () => unsubscribe(); 
    } else {
      console.warn("UserSessionProvider: Firebase auth is not configured. Google Sign-In will be disabled. Using offline mode for auth simulation.");
      setIsFirebaseConfigured(false);
      setIsLoading(false); 
    }
  }, []); 

  const signInWithGoogle = useCallback(async () => {
    if (!auth || !isFirebaseConfigured) {
      toast({
        title: "Google Login Unavailable",
        description: "Firebase is not configured correctly. Please check environment variables.",
        variant: "destructive",
      });
      console.error("signInWithGoogle: Firebase auth is not available or configured.");
      return;
    }
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast({ title: "Login Successful", description: "Welcome!" });
      router.prefetch('/'); // Prefetch dashboard
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      // setIsLoading(false); // onAuthStateChanged handles final loading state
    }
  }, [toast, isFirebaseConfigured, router]);

  const magicLogin = useCallback(async (username: string, pass: string): Promise<boolean> => {
    if (typeof window !== 'undefined' && navigator.onLine && isFirebaseConfigured) {
        toast({ title: "Magic Login Not Available", description: "This login method is for offline testing when Firebase is unavailable.", variant: "default" });
        return false;
    }
    if (!isFirebaseConfigured && typeof window !== 'undefined' && !navigator.onLine) {
      // Proceed with magic login
    } else if (isFirebaseConfigured) {
      toast({ title: "Magic Login Not Permitted", description: "Firebase is configured; please use Google Sign-In.", variant: "default" });
      return false;
    }

    setIsLoading(true);
    try {
        const credsString = process.env.NEXT_PUBLIC_DEBUG_TEACHER_CREDENTIALS;
        if (!credsString) {
            toast({ title: "Magic Login Error", description: "Debug credentials not configured in .env.local.", variant: "destructive" });
            setIsLoading(false);
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
            toast({ title: "Debug Login Successful", description: "Logged in as Teacher (Offline Debug Mode)." });
            router.prefetch('/'); // Prefetch dashboard
            return true;
        } else {
            toast({ title: "Magic Login Failed", description: "Invalid debug credentials.", variant: "destructive" });
            return false;
        }
    } catch (error: any) {
        console.error("Magic Login Error:", error);
        toast({ title: "Magic Login Error", description: "An error occurred during debug login. Check console.", variant: "destructive" });
        return false;
    } finally {
        setIsLoading(false);
    }
  }, [toast, isFirebaseConfigured, router]);

  const signOutFirebase = useCallback(async () => {
    setIsLoading(true);
    if (auth && isFirebaseConfigured && currentUser && !currentUser.uid.startsWith('debug-teacher-')) {
      try {
        await signOut(auth);
      } catch (error: any) {
        console.error("Firebase Sign Out Error:", error);
        toast({
          title: "Logout Failed",
          description: error.message || "Could not sign out from Firebase. Please try again.",
          variant: "destructive",
        });
      }
    }
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUserRole(null);
    setViewAsStudent(false);
    setIsLoading(false);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  }, [toast, isFirebaseConfigured, currentUser]);

  const toggleViewAsStudent = useCallback(() => {
    if (isLoggedIn && userRole === 'teacher') {
      setViewAsStudent(prev => !prev);
    }
  }, [isLoggedIn, userRole]);

  const contextValue = useMemo(() => ({
    currentUser, 
    isLoggedIn, 
    userRole, 
    viewAsStudent, 
    signInWithGoogle, 
    magicLogin, 
    signOutFirebase, 
    toggleViewAsStudent, 
    isLoading, 
    isFirebaseConfigured
  }), [
    currentUser, isLoggedIn, userRole, viewAsStudent, 
    signInWithGoogle, magicLogin, signOutFirebase, toggleViewAsStudent, 
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
 * Provides access to user session state and actions.
 * @throws Error if used outside of a UserSessionProvider.
 */
export function useUserSession() {
  const context = useContext(UserSessionContext);
  if (context === undefined) {
    throw new Error('useUserSession must be used within a UserSessionProvider');
  }
  return context;
}
