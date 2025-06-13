"use client";

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { StudyGrade } from '@/lib/types';

const STUDY_GRADES_CACHE_KEY = 'studyGradesSearchCache';

/**
 * Custom hook to fetch and cache study grades data for the global search.
 * It handles loading from localStorage, fetching from an API, and managing loading/error states.
 */
export const useStudyGradesData = () => {
  const { toast } = useToast();
  const [data, setData] = useState<StudyGrade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = useCallback(async () => {
    // Prevent refetching if data is already loaded or is in the process of loading.
    if (isLoaded || isLoading) return;

    setIsLoading(true);

    // 1. Try to load from cache first for performance.
    try {
      const cachedDataString = localStorage.getItem(STUDY_GRADES_CACHE_KEY);
      if (cachedDataString) {
        const cachedData = JSON.parse(cachedDataString) as StudyGrade[];
        if (cachedData?.length > 0) {
          setData(cachedData);
          setIsLoaded(true);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("useStudyGradesData: Failed to parse from localStorage.", e);
      localStorage.removeItem(STUDY_GRADES_CACHE_KEY); // Clear corrupted cache entry.
    }

    // 2. Fetch from API if not found in cache.
    try {
      const res = await fetch('/api/study-materials-manifest');
      if (!res.ok) {
        // Do not show a toast if it's a network error while offline.
        if (typeof window !== 'undefined' && navigator.onLine) {
             toast({
              title: "Search Data Limited",
              description: "Could not load full study material index.",
              variant: "default",
            });
        }
        throw new Error(`API responded with status ${res.status}`);
      }
      const apiData = (await res.json()) as StudyGrade[];
      setData(apiData);
      setIsLoaded(true);
      // Cache the newly fetched data.
      if (typeof window !== 'undefined') {
        localStorage.setItem(STUDY_GRADES_CACHE_KEY, JSON.stringify(apiData));
      }
    } catch (error) {
        // Only log errors that are not due to being offline during fetch
        if (typeof window !== 'undefined' && navigator.onLine) {
            console.error("useStudyGradesData: Error fetching manifest:", error);
            toast({
              title: "Search Data Error",
              description: "Error loading study material index. Search may be incomplete.",
              variant: "destructive",
            });
        } else {
             console.log("useStudyGradesData: Offline, skipping API fetch or network error occurred offline.", error);
        }
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isLoading, toast]);

  return { studyGrades: data, isLoadingStudyGrades: isLoading, loadData };
};