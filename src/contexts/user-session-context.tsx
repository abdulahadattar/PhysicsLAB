
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserRole = 'teacher' | 'student' | null;

interface UserSessionContextType {
  isLoggedIn: boolean;
  userRole: UserRole;
  viewAsStudent: boolean; // True if teacher is viewing as student
  login: (role: 'teacher' | 'student') => void;
  logout: () => void;
  toggleViewAsStudent: () => void;
  isLoading: boolean;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

const LOCAL_STORAGE_LOGGED_IN_KEY = 'physicsLabLoggedIn';
const LOCAL_STORAGE_USER_ROLE_KEY = 'physicsLabUserRole';

export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [viewAsStudent, setViewAsStudent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedLoggedIn = localStorage.getItem(LOCAL_STORAGE_LOGGED_IN_KEY);
      const storedRole = localStorage.getItem(LOCAL_STORAGE_USER_ROLE_KEY) as UserRole;
      
      if (storedLoggedIn !== null) {
        setIsLoggedIn(JSON.parse(storedLoggedIn));
      }
      if (storedRole) {
        setUserRole(storedRole);
      }
    } catch (error) {
      console.error("Error reading user session from localStorage:", error);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((role: 'teacher' | 'student') => {
    setIsLoggedIn(true);
    setUserRole(role);
    setViewAsStudent(false); // Reset view mode on new login
    try {
      localStorage.setItem(LOCAL_STORAGE_LOGGED_IN_KEY, JSON.stringify(true));
      localStorage.setItem(LOCAL_STORAGE_USER_ROLE_KEY, role);
    } catch (error) {
      console.error("Error saving user session to localStorage:", error);
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserRole(null);
    setViewAsStudent(false);
    try {
      localStorage.removeItem(LOCAL_STORAGE_LOGGED_IN_KEY);
      localStorage.removeItem(LOCAL_STORAGE_USER_ROLE_KEY);
    } catch (error) {
      console.error("Error clearing user session from localStorage:", error);
    }
  }, []);

  const toggleViewAsStudent = useCallback(() => {
    if (isLoggedIn && userRole === 'teacher') {
      setViewAsStudent(prev => !prev);
    }
  }, [isLoggedIn, userRole]);

  if (isLoading) {
    // Render nothing or a global loader until session state is determined
    return null; 
  }

  return (
    <UserSessionContext.Provider value={{ isLoggedIn, userRole, viewAsStudent, login, logout, toggleViewAsStudent, isLoading }}>
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
    