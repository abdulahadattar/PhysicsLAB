
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
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [viewAsStudent, setViewAsStudent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
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
          // toast({ title: "Logged In as Student", description: "Some features may require teacher verification in a full system." });
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
  }, [toast]);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
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
  }, [toast]);

  const magicLogin = useCallback(async (username: string, pass: string): Promise<boolean> => {
    if (typeof window !== 'undefined' && navigator.onLine) {
        toast({ title: "Magic Login Disabled", description: "This login method is for offline testing only.", variant: "destructive" });
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
  }, [toast]);


  const signOutFirebase = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged will handle clearing user state
    } catch (error: any) {
      console.error("Sign Out Error:", error);
      toast({
        title: "Logout Failed",
        description: error.message || "Could not sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Even if Firebase signout fails, clear client-side state for consistency
      // though onAuthStateChanged should ideally handle this if it was a firebase session
      setCurrentUser(null);
      setIsLoggedIn(false);
      setUserRole(null);
      setViewAsStudent(false);
      setIsLoading(false);
    }
  }, [toast]);

  const toggleViewAsStudent = useCallback(() => {
    if (isLoggedIn && userRole === 'teacher') {
      setViewAsStudent(prev => !prev);
    }
  }, [isLoggedIn, userRole]);

  return (
    <UserSessionContext.Provider value={{ currentUser, isLoggedIn, userRole, viewAsStudent, signInWithGoogle, magicLogin, signOutFirebase, toggleViewAsStudent, isLoading }}>
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
