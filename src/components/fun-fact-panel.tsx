
"use client";

import { generateFunContentBatch, type GenerateFunContentInput, type FunContentItem } from '@/ai/flows/generate-fun-fact';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, RefreshCw, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useFunFactsSettings } from '@/hooks/use-fun-facts-settings';
import { Skeleton } from './ui/skeleton';

const LOCAL_STORAGE_KEY_BATCH = 'physicsFunContentBatch';
const LOCAL_STORAGE_KEY_CURRENT_INDEX = 'physicsFunContentBatch_currentIndex';

export function FunFactPanel() {
  const [batch, setBatch] = useState<FunContentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentFactToDisplay, setCurrentFactToDisplay] = useState<FunContentItem | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isPanelVisible, togglePanelVisibility, isMounted } = useFunFactsSettings();

  const fetchNewBatch = useCallback(async (topic: string = "general physics", gradeLevel: number = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const input: GenerateFunContentInput = { topic, gradeLevel };
      // Intentionally not passing chapterId for general facts in the panel, 
      // unless a specific page context is made available to the panel later.
      const result = await generateFunContentBatch(input);
      
      if (result.items && result.items.length > 0) {
        setBatch(result.items);
        setCurrentIndex(0);
        setCurrentFactToDisplay(result.items[0]);
        localStorage.setItem(LOCAL_STORAGE_KEY_BATCH, JSON.stringify(result.items));
        localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_INDEX, JSON.stringify(0));
      } else {
        setError("No fun content received. Try again later.");
        setBatch([]); // Clear previous batch
        setCurrentFactToDisplay(null);
      }
    } catch (err) {
      console.error("Failed to generate fun content batch:", err);
      setError("Could not fetch fun content. Please try again.");
      // Potentially keep old batch/fact displayed on error, or clear it:
      // setBatch([]); 
      // setCurrentFactToDisplay(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const storedBatchJson = localStorage.getItem(LOCAL_STORAGE_KEY_BATCH);
      const storedIndexJson = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
      
      let loadedBatch: FunContentItem[] = [];
      if (storedBatchJson) {
        loadedBatch = JSON.parse(storedBatchJson);
      }
      
      let loadedIndex = 0;
      if (storedIndexJson) {
        loadedIndex = JSON.parse(storedIndexJson);
      }

      if (loadedBatch.length > 0) {
        setBatch(loadedBatch);
        const validIndex = Math.min(Math.max(0, loadedIndex), loadedBatch.length - 1);
        setCurrentIndex(validIndex);
        setCurrentFactToDisplay(loadedBatch[validIndex]);
        return true; // Indicate that data was loaded
      }
    } catch (e) {
      console.error("Error loading fun facts from localStorage:", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY_BATCH); // Clear corrupted data
      localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    }
    return false; // Indicate no data was loaded
  }, []);

  useEffect(() => {
    if (isPanelVisible && isMounted) {
      const dataLoaded = loadFromLocalStorage();
      if (!dataLoaded) {
        fetchNewBatch();
      }
    }
  }, [isPanelVisible, isMounted, loadFromLocalStorage, fetchNewBatch]);

  const handleShowNextFact = () => {
    if (isLoading) return;

    let nextIndex = currentIndex + 1;
    if (batch.length > 0 && nextIndex < batch.length) {
      setCurrentIndex(nextIndex);
      setCurrentFactToDisplay(batch[nextIndex]);
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_INDEX, JSON.stringify(nextIndex));
    } else {
      // End of current batch, fetch a new one
      fetchNewBatch();
    }
  };

  if (!isMounted || !isPanelVisible) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-w-[calc(100vw-2rem)] shadow-xl z-50 animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          <CardTitle className="text-lg">Fun Physics Tidbit!</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={togglePanelVisibility} aria-label="Close fun fact panel">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5 mt-1" />
            <Skeleton className="h-3 w-3/4 mt-2" />
            <Skeleton className="h-3 w-2/3 mt-1" />
          </div>
        )}
        {error && !isLoading && <p className="text-sm text-destructive">{error}</p>}
        {!isLoading && !error && currentFactToDisplay && (
          <>
            <p className="text-sm font-semibold">{currentFactToDisplay.content}</p>
            <CardDescription className="mt-1 text-xs">{currentFactToDisplay.explanation}</CardDescription>
          </>
        )}
        {!isLoading && !error && !currentFactToDisplay && (
             <p className="text-sm text-muted-foreground">No fun fact available at the moment.</p>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleShowNextFact}
          disabled={isLoading}
          className="mt-3 w-full"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Next Tidbit
        </Button>
      </CardContent>
    </Card>
  );
}

