import { auth, googleProvider, db } from '@/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser, AuthError } from 'firebase/auth';
import { type UserRole, type AppUser } from '@/contexts/user-session-context'; // Import types for consistency

// Conditional import for debug authentication functions
const debugAuth = process.env.NEXT_PUBLIC_ENABLE_DEBUG_AUTH === 'true'
  ? require('@/lib/auth/debug-auth')
  : null;

// Define a type for the auth state passed to listeners
export type AuthState = {
    currentUser: AppUser | null;
    isLoggedIn: boolean;
    userRole: UserRole;
    isLoading: boolean;
    isFirebaseConfigured: boolean;
}

type AuthStateListener = (state: AuthState) => void;

class AuthService {
  private listeners: AuthStateListener[] = [];
  private _currentUser: AppUser | null = null;
  private _userRole: UserRole = null;
  private _isLoggedIn: boolean = false; // Derived from _currentUser !== null
  private _isLoading: boolean = true; // True while initial auth state is being determined or during auth operations
  private _isFirebaseConfigured: boolean = false;

  constructor() {
    console.log("AuthService: Initializing...");
    this.initAuthState();
  }

  private async initAuthState() {
      // Check Firebase configuration status initially
      this._isFirebaseConfigured = !!(auth && db);

      if (this._isFirebaseConfigured) {
        console.log("AuthService: Firebase configured. Setting up onAuthStateChanged listener.");
        onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          console.log("AuthService: onAuthStateChanged triggered. User:", firebaseUser?.email);
          this._isLoading = true; // Start loading state during auth state processing

          if (firebaseUser) {
            const appUser: AppUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            };
            this._currentUser = appUser;
            this._isLoggedIn = true;

            let userRoleFromClaims: UserRole = 'student'; // Default role

            try {
              const idTokenResult = await firebaseUser.getIdTokenResult();
              const role = idTokenResult.claims.role;
              if (role === 'teacher' || role === 'student') {
                userRoleFromClaims = role as UserRole;
              }
              console.log(`AuthService: Role '${userRoleFromClaims}' fetched from custom claims for ${appUser.email}.`);
            } catch (error) {
              console.error("AuthService: Error fetching ID token result or claims:", error);
              // Decide how to handle this error - perhaps default to student or show an error to the user
              userRoleFromClaims = 'student'; // Default to student on error for now
            }
            this._userRole = userRoleFromClaims;

          } else {
            // User logged out or no user
            this._currentUser = null;
            this._isLoggedIn = false;
            this._userRole = null;
            console.log("AuthService: No Firebase user or logged out.");
             // When a Firebase user logs out, we should not automatically revert to debug roles from localStorage.
             // Debug roles should only be loaded on initial unconfigured state.
          }

          this._isLoading = false; // End loading state after processing
          this.notifyListeners(); // Notify listeners of the state change
        });

      } else {
        console.warn("AuthService: Firebase auth or Firestore (db) is NOT configured. Google Sign-In and Firestore features will be disabled.");

       // If Firebase is not configured and debug auth is enabled, attempt to load debug role from localStorage
       if (debugAuth) {
           const localRole = debugAuth.getDebugUserRoleFromLocalStorage();
           if (localRole) {
               this._userRole = localRole;
               this._isLoggedIn = true;
               // Create a mock user for debug mode if a role is found
               if (localRole === 'teacher') {
                  this._currentUser = { uid: 'debug-teacher-local', email: 'teacher@debug.local', displayName: `Teacher (${process.env.NEXT_PUBLIC_APP_AUTHOR || 'Debug'})`, photoURL: null };
               } else if (localRole === 'student') {
                  this._currentUser = { uid: 'debug-student-local', email: 'student@debug.local', displayName: 'Debug Student', photoURL: null };
               }
               console.log(`AuthService: Loaded debug user role from localStorage: ${localRole}`);
           } else {
              this._currentUser = null;
              this._isLoggedIn = false;
              this._userRole = null;
              console.warn("AuthService: No debug user role found in localStorage.");
           }
       } else {
           // Neither Firebase nor debug auth is configured/enabled
           this._currentUser = null;
           this._isLoggedIn = false;
           this._userRole = null;
           console.warn("AuthService: Debug authentication is also not enabled. No authentication method available.");
       }

        this._isLoading = false; // Set loading to false as initial state is determined
        this.notifyListeners(); // Notify listeners of the initial state
      }
       console.log("AuthService: Initialization complete.");
  }

  // Method to get the current state
  private getState(): AuthState {
      return {
          currentUser: this._currentUser,
          isLoggedIn: this._isLoggedIn,
          userRole: this._userRole,
          isLoading: this._isLoading,
          isFirebaseConfigured: this._isFirebaseConfigured,
      };
  }

  // Method to notify all registered listeners
  private notifyListeners() {
      const currentState = this.getState();
      console.log("AuthService: Notifying listeners with state:", currentState);
      this.listeners.forEach(listener => {
        try {
           listener(currentState);
        } catch (error) {
           console.error("AuthService: Error in listener callback:", error);
        }
      });
  }

  // Method for components/contexts to subscribe to auth state changes
  public subscribe(listener: AuthStateListener) {
    this.listeners.push(listener);
    console.log("AuthService: Listener subscribed. Total listeners:", this.listeners.length);

    // Immediately provide the current state to the new listener
    listener(this.getState());

    // Return an unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
      console.log("AuthService: Listener unsubscribed. Total listeners:", this.listeners.length);
    };
  }

  public async signInWithGoogle(): Promise<void> {
    if (!auth || !googleProvider || !this._isFirebaseConfigured) {
      console.error("AuthService: Firebase auth, Google Provider, or configuration is not available for signInWithGoogle.");
       // Don't throw here, let the calling component handle the lack of availability via isFirebaseConfigured check
       return;
    }
    this._isLoading = true; // Indicate loading started
    this.notifyListeners(); // Notify listeners of loading state change
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged listener will handle setting user state and isLoading to false
    } catch (error: any) {
      console.error("AuthService: Google Sign-In Error:", error);
      this._isLoading = false; // Stop loading on failure
      this.notifyListeners(); // Notify listeners of loading state change and potential error state if added to state
      throw error; // Re-throw the error to be handled by the UI (e.g., show toast)
    }
  }

  // Magic login function (debug only)
  public async magicLogin(username: string, pass: string): Promise<boolean> {
    if (!debugAuth || this._isFirebaseConfigured) {
        console.warn("AuthService: Magic Login not permitted in current configuration (debugAuth not enabled or Firebase configured).");
        return false;
    }
    this._isLoading = true;
     this.notifyListeners(); // Notify listeners of loading state change
    const result = await debugAuth.debugMagicLogin(username, pass);

    if (typeof result !== 'boolean' && result) { // Check if a user object was returned
        this._currentUser = result; // Set mock user
        this._isLoggedIn = true;
        this._userRole = 'teacher'; // Magic login is only for teacher debug
        // this._isFirebaseConfigured remains false in this flow

        this._isLoading = false;
        this.notifyListeners(); // Notify state change
        return true;
    } else {
         this._currentUser = null; // Ensure no partial state on failure
         this._isLoggedIn = false;
         this._userRole = null; // Ensure no partial state on failure
         this._isLoading = false;
         this.notifyListeners(); // Notify state change
         return false;
    }
  }

  public async signOutFirebase(): Promise<void> {
    // Check if it's a Firebase user before attempting Firebase signOut
    if (auth && this._isFirebaseConfigured && this._currentUser && !this._currentUser.uid.startsWith('debug-')) {
      this._isLoading = true; // Indicate loading started
       this.notifyListeners(); // Notify listeners of loading state change
      try {
        await signOut(auth);
        // onAuthStateChanged listener will handle clearing user state and isLoading to false
      } catch (error: any) {
        console.error("AuthService: Firebase Sign Out Error:", error);
        this._isLoading = false; // Stop loading on failure
        this.notifyListeners(); // Notify listeners of loading state change and potential error state
        throw error; // Re-throw the error to be handled by the UI
      }
    } else if (this._currentUser && this._currentUser.uid.startsWith('debug-')) {
       // Handle debug user sign out (clear local state and storage)
        console.log("AuthService: Signing out debug user.");
        this._isLoading = true;
        this.notifyListeners(); // Notify loading state change

        this._currentUser = null;
        this._isLoggedIn = false;
        this._userRole = null;
        // this._isFirebaseConfigured remains false

        if (debugAuth) {
            try {
                localStorage.removeItem('debugUserRole');
                console.log("AuthService: Removed debugUserRole from localStorage.");
            } catch (e) {
                console.error('AuthService: Error removing debugUserRole from localStorage on debug sign out:', e);
            }
        }
        this._isLoading = false;
        this.notifyListeners(); // Notify state change
    } else {
        // No user or not configured, just ensure state is cleared locally
         console.log("AuthService: Sign out called, but no active user or Firebase not configured. Clearing local state.");
         this._isLoading = true;
         this.notifyListeners(); // Notify loading state change

         this._currentUser = null;
         this._isLoggedIn = false;
         this._userRole = null;
         // this._isFirebaseConfigured state remains unchanged

         if (debugAuth) {
            try {
                localStorage.removeItem('debugUserRole');
                console.log("AuthService: Removed debugUserRole from localStorage (no user/unconfigured).");
            } catch (e) {
                console.error('AuthService: Error removing debugUserRole from localStorage on sign out (no user/unconfigured):', e);
            }
         }

         this._isLoading = false;
         this.notifyListeners(); // Notify state change
    }
  }

  // Debug switch role function (debug only)
  public debugSwitchRole(newRole: UserRole): void {
      if (!debugAuth) {
          console.warn("AuthService: debugSwitchRole called but debugAuth is not enabled.");
          return;
      }
      console.log("AuthService: Switching debug role to:", newRole);
      this._isLoading = true;
       this.notifyListeners(); // Notify loading state change

      const newUser = debugAuth.debugSwitchMockRole(newRole);

      this._currentUser = newUser;
      this._isLoggedIn = newRole !== null;
      this._userRole = newRole;
      // this._isFirebaseConfigured remains false

      this._isLoading = false;
      this.notifyListeners(); // Notify state change
  }

  // Public getter methods for the current state
   public get state(): AuthState {
       return this.getState();
   }
}

// Export a singleton instance of the AuthService
export const authService = new AuthService();
