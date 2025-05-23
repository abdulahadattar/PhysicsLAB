
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface TeacherModeContextType {
  isTeacherMode: boolean;
  toggleTeacherMode: () => void;
  isLoading: boolean;
}

const TeacherModeContext = createContext<TeacherModeContextType | undefined>(undefined);

const LOCAL_STORAGE_TEACHER_MODE_KEY = 'physicsLabTeacherMode';

export function TeacherModeProvider({ children }: { children: ReactNode }) {
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedMode = localStorage.getItem(LOCAL_STORAGE_TEACHER_MODE_KEY);
      if (storedMode !== null) {
        setIsTeacherMode(JSON.parse(storedMode));
      }
    } catch (error) {
      console.error("Error reading teacher mode from localStorage:", error);
      // Keep default false if error
    }
    setIsLoading(false);
  }, []);

  const toggleTeacherMode = useCallback(() => {
    setIsTeacherMode(prevMode => {
      const newMode = !prevMode;
      try {
        localStorage.setItem(LOCAL_STORAGE_TEACHER_MODE_KEY, JSON.stringify(newMode));
      } catch (error) {
        console.error("Error saving teacher mode to localStorage:", error);
      }
      return newMode;
    });
  }, []);

  if (isLoading) {
    return null; // Or a loading spinner for the whole app if preferred
  }

  return (
    <TeacherModeContext.Provider value={{ isTeacherMode, toggleTeacherMode, isLoading }}>
      {children}
    </TeacherModeContext.Provider>
  );
}

export function useTeacherMode() {
  const context = useContext(TeacherModeContext);
  if (context === undefined) {
    throw new Error('useTeacherMode must be used within a TeacherModeProvider');
  }
  return context;
}
