"use client";

import { Lightbulb, RefreshCw, WifiOff, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useFunFactsSettings } from '@/hooks/use-fun-facts-settings';
import { Skeleton } from './ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import funFacts from '@/data/fun-facts.json';
import { getNextFunFactForUser, getGuestId } from '@/data/fun-facts-util';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const LOCAL_STORAGE_KEY_BATCH = 'physicsFunContentBatch';
const LOCAL_STORAGE_KEY_CURRENT_INDEX = 'physicsFunContentBatch_currentIndex';

// Use the type from the JSON structure
type FunFact = { content: string; explanation: string };

export function FunFactPanel() {
  const [currentFactToDisplay, setCurrentFactToDisplay] = useState<FunFact | null>(null);
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


  // Helper: get user or guest id
  function getUserOrGuestId() {
    // If you have a user session, use user.id, else use guest id
    // For now, just use guest id
    return getGuestId();
  }

  // Show a new, unique fun fact
  const showNextFunFact = useCallback(() => {
    setIsLoading(true);
    setError(null);
    try {
      const userId = getUserOrGuestId();
      const fact = getNextFunFactForUser(userId) as FunFact | undefined;
      if (fact && typeof fact === 'object' && 'content' in fact && 'explanation' in fact) {
        setCurrentFactToDisplay(fact);
      } else {
        setError('Could not load a new fun fact.');
        setCurrentFactToDisplay(null);
      }
    } catch (e) {
      setError('Could not load a new fun fact.');
      setCurrentFactToDisplay(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPanelVisible && isMounted) {
      showNextFunFact();
    }
  }, [isPanelVisible, isMounted, showNextFunFact]);

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
          onClick={showNextFunFact}
          disabled={isLoading || (isOffline && !currentFactToDisplay)}
          className="mt-3 w-full"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isOffline && !currentFactToDisplay ? "Offline" : "Next Tidbit"}
        </Button>
      </CardContent>
    </Card>
  );
}
