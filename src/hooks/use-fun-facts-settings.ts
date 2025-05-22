"use client";

import { useState, useEffect, useCallback } from 'react';

const FUN_FACTS_VISIBLE_KEY = 'funFactsPanelVisible';

export function useFunFactsSettings() {
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedVisibility = localStorage.getItem(FUN_FACTS_VISIBLE_KEY);
      if (storedVisibility !== null) {
        setIsPanelVisible(JSON.parse(storedVisibility));
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
  }, []);

  const togglePanelVisibility = useCallback(() => {
    setIsPanelVisible(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem(FUN_FACTS_VISIBLE_KEY, JSON.stringify(newValue));
      } catch (error) {
        console.error("Error writing to localStorage:", error);
      }
      return newValue;
    });
  }, []);
  
  if (!isMounted) {
    return {
        isPanelVisible: true, // Default during SSR or before mount
        togglePanelVisibility: () => {},
        isMounted
    };
  }

  return { isPanelVisible, togglePanelVisibility, isMounted };
}
