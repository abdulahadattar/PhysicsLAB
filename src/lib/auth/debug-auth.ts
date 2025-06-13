import { type UserRole, type AppUser } from '@/contexts/user-session-context';
import { APP_AUTHOR } from '@/lib/constants';

// This file contains debug-only authentication functions.
// It should only be imported and used when a specific debug environment variable is enabled.

interface DebugCredentials { user: string; pass: string; }

/**
 * Performs a "magic" debug login using hardcoded credentials from environment variables.
 * This function should ONLY be callable in debug/development environments.
 * @param username - The debug username.
 * @param pass - The debug password.
 * @returns A Promise resolving to true if login is successful, false otherwise.
 */
export const debugMagicLogin = async (username: string, pass: string): Promise<boolean | AppUser> => {
  try {
    const credsStringEnv = process.env.NEXT_PUBLIC_DEBUG_TEACHER_CREDENTIALS;
    if (!credsStringEnv) {
      console.error("DEBUG_AUTH: Debug credentials not configured.");
      return false;
    }
    const debugCredentialsArray: DebugCredentials[] = JSON.parse(credsStringEnv);
    const matchedCred = debugCredentialsArray.find(cred => cred.user === username && cred.pass === pass);

    if (matchedCred) {
      const mockTeacherUser: AppUser = {
        uid: `debug-teacher-${username}`,
        email: `${username}@debug.local`,
        displayName: `Debug Teacher (${username})`,
        photoURL: null,
      };
      console.log(`DEBUG_AUTH: Debug Login Successful for ${username}.`);
      return mockTeacherUser;
    } else {
      console.warn("DEBUG_AUTH: Invalid debug credentials.");
      return false;
    }
  } catch (error: any) {
    console.error("DEBUG_AUTH: Error in magicLogin:", error);
    return false;
  }
};

/**
 * Switches the user's role for debugging purposes using localStorage.
 * This function should ONLY be callable in debug/development environments.
 * @param newRole - The role to switch to.
 * @returns The mocked AppUser for the new role, or null if role is null.
 */
export const debugSwitchMockRole = (newRole: UserRole): AppUser | null => {
  let newUser: AppUser | null = null;

  if (newRole === 'teacher') {
    newUser = { uid: 'debug-teacher', email: 'debug.teacher@example.com', displayName: `Teacher (${APP_AUTHOR})`, photoURL: null };
    try {
      localStorage.setItem('debugUserRole', 'teacher');
    } catch (e) {
      console.error('DEBUG_AUTH: Error writing debugUserRole to localStorage:', e);
    }
  } else if (newRole === 'student') {
    newUser = { uid: 'debug-student', email: 'debug.student@example.com', displayName: 'Debug Student', photoURL: null };
    try {
      localStorage.setItem('debugUserRole', 'student');
    } catch (e) {
      console.error('DEBUG_AUTH: Error writing debugUserRole to localStorage:', e);
    }
  } else {
    try {
      localStorage.removeItem('debugUserRole');
    } catch (e) {
      console.error('DEBUG_AUTH: Error removing debugUserRole from localStorage:', e);
    }
  }
  console.log(`DEBUG_AUTH: Debug role switched to ${newRole || 'Guest'}.`);
  return newUser;
};

/**
 * Reads the debug user role from localStorage.
 * This function should ONLY be callable in debug/development environments.
 * @returns The debug user role or null.
 */
export const getDebugUserRoleFromLocalStorage = (): UserRole => {
    try {
        const localRole = localStorage.getItem('debugUserRole') as UserRole;
        if (localRole === 'teacher' || localRole === 'student') {
            console.log(`DEBUG_AUTH: Found debug user role in localStorage: ${localRole}`);
            return localRole;
        }
    } catch (e) {
        console.error('DEBUG_AUTH: Error reading debugUserRole from localStorage:', e);
    }
    return null;
};
