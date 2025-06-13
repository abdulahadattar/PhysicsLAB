/**
 * @fileOverview User Session Management Context.
 */
/* 
👋 Gemini Code Generator Context:

This file defines the UserSessionContext, which is intended to manage the user's authentication state and potentially user data (including roles based on Firebase Custom Claims).

This context now primarily consumes state from the AuthService and provides authentication methods by calling the AuthService.
It should handle the 'View as Student' mode which remains local to the context.
*/
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
// Import the authService singleton and AuthState type
import { authService, type AuthState } from '@/lib/auth/authService';
import { AuthError } from 'firebase/auth'; // Import AuthError for toast messages
// Removed unused imports: auth, googleProvider, db, signInWithPopup, signOut, onAuthStateChanged, FirebaseUser, doc, getDoc, FirestoreError, APP_AUTHOR

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
 * Now largely mirrors AuthState, plus local context state like viewAsStudent.
 */
interface UserSessionContextType extends AuthState {
  viewAsStudent: boolean; // True if teacher is viewing as student
  signInWithGoogle: () => Promise<void>;
  magicLogin?: (username: string, pass: string) => Promise<boolean>; // Conditionally available
  signOutFirebase: () => Promise<void>;
  toggleViewAsStudent: () => void;
  debugSwitchRole?: (newRole: UserRole) => void; // Conditionally available
  // isLoading and isFirebaseConfigured are now part of AuthState via extends
  // currentUser and isLoggedIn and userRole are now part of AuthState via extends
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

/**
 * Provider component for the UserSessionContext.
 * Subscribes to AuthService to provide authentication state and methods to the React tree.
 */
export function UserSessionProvider({ children }: { children: ReactNode }) {
  // Local state to mirror AuthService state + viewAsStudent
  // Initialize state directly from the current state of the authService
  const [authState, setAuthState] = useState<AuthState>(authService.state);
  const [viewAsStudent, setViewAsStudent] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter(); // Keep router if needed in callbacks that remain here (e.g., magicLogin redirect)

  // Subscribe to authService state changes using a single effect
  useEffect(() => {
    console.log("UserSessionProvider: Subscribing to authService state changes.");
    // The subscribe method returns the initial state immediately and then listens for updates
    const unsubscribe = authService.subscribe(setAuthState);

    // Clean up subscription on unmount
    return () => {
      console.log("UserSessionProvider: Unsubscribing from authService.");
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount/initial render

  // Destructure state directly from the authState hook
  const { currentUser, isLoggedIn, userRole, isLoading, isFirebaseConfigured } = authState;

  // --- Authentication Methods (now call AuthService methods) ---

  // Note: Error handling with toasts is kept here as it's a UI concern.

  const signInWithGoogle = useCallback(async () => {
    // Check availability based on authService state (mirrored in our state)
    if (!isFirebaseConfigured) {
      toast({
        title: "Google Login Unavailable",
        description: "Firebase is not configured. Please check environment variables.",
        variant: "destructive",
      });
      return;
    }
    // AuthService will handle isLoading state and onAuthStateChanged updates
    try {
      await authService.signInWithGoogle();
       // Success is handled by the authService listener updating authState, which re-renders the context
    } catch (error: any) {
      console.error("UserSessionProvider: Google Sign-In Error:", error);
      let description = "Could not sign in with Google. Please try again.";

      if (error instanceof AuthError) {
         switch (error.code) {
            case 'auth/popup-closed-by-user':
               description = "Sign-in process cancelled.";
               break;
            case 'auth/cancelled-popup-request':
               description = "Sign-in popup blocked. Please allow popups.";
               break;
            case 'auth/operation-not-supported-in-this-environment':
               description = "Operation not supported in this environment.";
               break;
            case 'auth/auth-domain-config-error':
               description = "Authentication domain configuration error.";
               break;
            case 'auth/operation-not-allowed':
               description = "Sign-in method not enabled.";
               break;
             case 'auth/network-request-failed':
                description = "Network error. Please check your internet connection.";
                break;
            default:
               description = error.message || description;
         }
      } else {
          description = error.message || description;
      }

      toast({
        title: "Login Failed",
        description: description,
        variant: "destructive",
      });
       // authService already handles setting its isLoading to false on failure, which updates authState
    }
  }, [toast, isFirebaseConfigured]); // Depend on state provided by authService via authState

  // Magic login function (debug only)
  // The service handles the debugAuth check and state updates
  const magicLogin = useCallback(async (username: string, pass: string): Promise<boolean> => {
       // Check if the method exists on the service (depends on debugAuth env var)
      if (!authService.magicLogin) {
          console.warn("UserSessionProvider: magicLogin called but debugAuth is not enabled in AuthService.");
          toast({ title: "Magic Login Not Permitted", description: "Debug authentication is not enabled.", variant: "default" });
          return false;
      }
       // AuthService handles isLoading state
      const success = await authService.magicLogin(username, pass);
      if (success) {
          toast({ title: "Debug Login Successful", description: `Logged in as Debug Teacher.` });
          router.prefetch('/'); // Router dependency remains here as it's Next.js navigation
          return true;
      } else {
           toast({ title: "Magic Login Failed", description: "Invalid debug credentials or error.", variant: "destructive" });
           return false;
      }
  }, [toast, router]); // Depends on toast and router for UI/Navigation


  const signOutFirebase = useCallback(async () => {
     // Call the signOutFirebase method on the authService instance
     // The service handles the logic of whether it's a Firebase or debug user sign out
     // and updates its state accordingly, which will notify this context.
     try {
         await authService.signOutFirebase();
         // State clearing handled by authService listener updating authState
         toast({ title: "Logged Out", description: "You have been successfully logged out." });
     } catch (error: any) {
         console.error("UserSessionProvider: Sign Out Error:", error);
         let description = "Could not sign out. Please try again.";
         if (error instanceof AuthError) {
             description = error.message || description;
         }
         toast({
             title: "Logout Failed",
             description: description,
             variant: "destructive",
         });
         // authService already handles setting its isLoading to false on failure
     }

  }, [toast]); // Depends on toast for UI feedback

  // toggleViewAsStudent remains local context state logic
  const toggleViewAsStudent = useCallback(() => {
    if (isLoggedIn && userRole === 'teacher') {
      setViewAsStudent(prev => !prev);
       console.log("UserSessionProvider: Toggled View as Student");
    }
  }, [isLoggedIn, userRole]); // Depends on state provided by authService via authState

  // debugSwitchRole is now just calling the service method (if it exists)
  const debugSwitchRole = useCallback((newRole: UserRole) => {
      // Check if the method exists on the service (depends on debugAuth env var)
      if (!authService.debugSwitchRole) {
          console.warn("UserSessionProvider: debugSwitchRole called but debugAuth is not enabled in AuthService.");
          toast({ title: "Debug Switch Unavailable", description: "Debug authentication is not enabled.", variant: "default" });
          return;
      }
      // AuthService handles state updates and isLoading
      authService.debugSwitchRole(newRole);

      toast({ title: "Debug View Changed", description: `Now viewing as: ${newRole || 'Guest'}` });

  }, [toast]); // Depends on toast for UI feedback

  const contextValue = useMemo(() => ({
    // Provide state directly from the mirrored authState
    currentUser: authState.currentUser,
    isLoggedIn: authState.isLoggedIn,
    userRole: authState.userRole,
    isLoading: authState.isLoading,
    isFirebaseConfigured: authState.isFirebaseConfigured,
    viewAsStudent, // Local context state
    // Provide methods (conditionally for debug)
    signInWithGoogle,
    magicLogin: authService.magicLogin ? magicLogin : undefined, // Use the wrapped callback if service method exists
    signOutFirebase,
    toggleViewAsStudent,
    debugSwitchRole: authService.debugSwitchRole ? debugSwitchRole : undefined, // Use the wrapped callback if service method exists
  }), [
    // Dependencies should include all values from authState and viewAsStudent
    authState.currentUser, authState.isLoggedIn, authState.userRole,
    authState.isLoading, authState.isFirebaseConfigured, viewAsStudent,
    // Also include the memoized callbacks
    signInWithGoogle, magicLogin, signOutFirebase, toggleViewAsStudent, debugSwitchRole
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