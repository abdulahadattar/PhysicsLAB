
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, googleProvider } from '@/lib/firebase'; // Ensure firebase is initialized
import { signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'teacher' | 'student' | null;

interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface UserSessionContextType {
  currentUser: AppUser | null;
  isLoggedIn: boolean;
  userRole: UserRole;
  viewAsStudent: boolean; // True if teacher is viewing as student
  signInWithGoogle: () => Promise<void>;
  magicLogin: (username: string, pass: string) => Promise<boolean>;
  signOutFirebase: () => Promise<void>;
  toggleViewAsStudent: () => void;
  isLoading: boolean;
  isFirebaseConfigured: boolean;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [viewAsStudent, setViewAsStudent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    if (auth) { // Check if Firebase auth is initialized
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
          if (appUser.email === teacherEmail) {
            setUserRole('teacher');
          } else {
            setUserRole('student');
          }
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
      // Firebase is not configured, proceed with app in a non-Firebase auth state
      console.warn("Firebase auth is not configured. Google Sign-In will be disabled. Using offline mode for auth simulation.");
      setIsFirebaseConfigured(false);
      setIsLoading(false); // No Firebase auth state to wait for
      // Keep isLoggedIn false and currentUser null, magicLogin can still work
    }
  }, [toast]);

  const signInWithGoogle = useCallback(async () => {
    if (!auth || !isFirebaseConfigured) {
      toast({
        title: "Google Login Unavailable",
        description: "Firebase is not configured correctly. Please check environment variables.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider as any); // Cast to any if googleProvider can be {}
      // onAuthStateChanged will handle setting user state
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [toast, isFirebaseConfigured]);

  const magicLogin = useCallback(async (username: string, pass: string): Promise<boolean> => {
    if (typeof window !== 'undefined' && navigator.onLine && isFirebaseConfigured) {
        toast({ title: "Magic Login Disabled", description: "This login method is for offline testing when Firebase is not available.", variant: "destructive" });
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
            setIsLoading(false);
            toast({ title: "Debug Login Successful", description: "Logged in as Teacher (Offline Mode)." });
            return true;
        } else {
            toast({ title: "Magic Login Failed", description: "Invalid debug credentials.", variant: "destructive" });
            setIsLoading(false);
            return false;
        }
    } catch (error: any) {
        console.error("Magic Login Error:", error);
        toast({ title: "Magic Login Error", description: "An error occurred during debug login.", variant: "destructive" });
        setIsLoading(false);
        return false;
    }
  }, [toast, isFirebaseConfigured]);


  const signOutFirebase = useCallback(async () => {
    setIsLoading(true);
    if (auth && isFirebaseConfigured && currentUser && !currentUser.uid.startsWith('debug-teacher-')) { // Only sign out from firebase if it was a firebase session
      try {
        await signOut(auth);
      } catch (error: any) {
        console.error("Sign Out Error:", error);
        toast({
          title: "Logout Failed",
          description: error.message || "Could not sign out. Please try again.",
          variant: "destructive",
        });
      }
    }
    // Always clear client-side state for both Firebase and magic logins
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

  return (
    <UserSessionContext.Provider value={{ currentUser, isLoggedIn, userRole, viewAsStudent, signInWithGoogle, magicLogin, signOutFirebase, toggleViewAsStudent, isLoading, isFirebaseConfigured }}>
      {children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession() {
  const context = useContext(UserSessionContext);
  if (context === undefined) {
    throw new Error('useUserSession must be used within a UserSessionProvider');
  }
  return context;
}
