
"use client";

import { generateFunContentBatch, type GenerateFunContentInput, type FunContentItem } from '@/ai/flows/generate-fun-fact';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, RefreshCw, WifiOff, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useFunFactsSettings } from '@/hooks/use-fun-facts-settings';
import { Skeleton } from './ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile

const LOCAL_STORAGE_KEY_BATCH = 'physicsFunContentBatch';
const LOCAL_STORAGE_KEY_CURRENT_INDEX = 'physicsFunContentBatch_currentIndex';

export function FunFactPanel() {
  const [batch, setBatch] = useState<FunContentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentFactToDisplay, setCurrentFactToDisplay] = useState<FunContentItem | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const { isPanelVisible, togglePanelVisibility, isMounted } = useFunFactsSettings();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState<boolean>(!isMobile); // Expanded by default on desktop

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Adjust initial expansion based on mobile status once mounted
  useEffect(() => {
    if (isMounted) {
      setIsExpanded(!isMobile);
    }
  }, [isMobile, isMounted]);


  const fetchNewBatch = useCallback(async (topic: string = "general physics", gradeLevel: number = 10) => {
    if (isOffline) {
      setError("You are offline. Fun facts will load when you're back online.");
      setIsLoading(false);
      if (batch.length === 0) setCurrentFactToDisplay(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const input: GenerateFunContentInput = { topic, gradeLevel };
      const result = await generateFunContentBatch(input);
      
      if (result.items && result.items.length > 0) {
        setBatch(result.items);
        setCurrentIndex(0);
        setCurrentFactToDisplay(result.items[0]);
        localStorage.setItem(LOCAL_STORAGE_KEY_BATCH, JSON.stringify(result.items));
        localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_INDEX, JSON.stringify(0));
      } else {
        setError("No fun content received. Try again later.");
        setBatch([]); 
        setCurrentFactToDisplay(null);
      }
    } catch (err) {
      console.error("Failed to generate fun content batch:", err);
      setError("Could not fetch fun content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isOffline, batch.length]);

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
        return true; 
      }
    } catch (e) {
      console.error("Error loading fun facts from localStorage:", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY_BATCH); 
      localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_INDEX);
    }
    return false; 
  }, []);

  useEffect(() => {
    if (isPanelVisible && isMounted) {
      const dataLoaded = loadFromLocalStorage();
      if (!dataLoaded) {
        if (!isOffline) {
          fetchNewBatch();
        } else {
           setError("No fun facts cached. Connect to the internet to load them.");
           setCurrentFactToDisplay(null);
        }
      }
    }
  }, [isPanelVisible, isMounted, loadFromLocalStorage, fetchNewBatch, isOffline]);

  const handleShowNextFact = () => {
    if (isLoading) return;

    let nextIndex = currentIndex + 1;
    if (batch.length > 0 && nextIndex < batch.length) {
      setCurrentIndex(nextIndex);
      setCurrentFactToDisplay(batch[nextIndex]);
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_INDEX, JSON.stringify(nextIndex));
    } else {
      fetchNewBatch();
    }
  };

  const handleCloseOrCollapse = () => {
    if (isMobile) {
      setIsExpanded(false); // Collapse on mobile
    } else {
      togglePanelVisibility(); // Hide completely on desktop
    }
  };

  if (!isMounted || !isPanelVisible) {
    return null;
  }

  if (isMobile && !isExpanded) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full p-2 fixed bottom-4 right-4 z-50 h-10 w-10 bg-secondary/70 hover:bg-secondary text-primary shadow-md hover:shadow-lg transition-all"
        onClick={() => setIsExpanded(true)}
        aria-label="Show fun fact"
      >
        <Lightbulb className="h-5 w-5 text-yellow-500" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-4 right-4 z-50 shadow-xl animate-in fade-in-0 slide-in-from-bottom-5 duration-500 w-11/12 max-w-[280px] sm:max-w-[300px] md:w-80`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          <CardTitle className="text-lg">Fun Physics Tidbit!</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={handleCloseOrCollapse} aria-label="Close fun fact panel">
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
        {error && !isLoading && (
            <div className="flex flex-col items-center text-center">
                {isOffline && <WifiOff className="h-6 w-6 text-destructive mb-1" />}
                <p className="text-sm text-destructive">{error}</p>
            </div>
        )}
        {!isLoading && !error && currentFactToDisplay && (
          <>
            <p className="text-sm font-semibold">{currentFactToDisplay.content}</p>
            <CardDescription className="mt-1 text-xs">{currentFactToDisplay.explanation}</CardDescription>
          </>
        )}
        {!isLoading && !error && !currentFactToDisplay && !isOffline && (
             <p className="text-sm text-muted-foreground">No fun fact available at the moment.</p>
        )}
         {!isLoading && !error && !currentFactToDisplay && isOffline && (
             <div className="flex flex-col items-center text-center">
                <WifiOff className="h-6 w-6 text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">Fun facts will appear here when you're online or if previously cached.</p>
            </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleShowNextFact}
          disabled={isLoading || (isOffline && batch.length === 0)}
          className="mt-3 w-full"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isOffline && batch.length === 0 ? "Offline" : "Next Tidbit"}
        </Button>
      </CardContent>
    </Card>
  );
}
