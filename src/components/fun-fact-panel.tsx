"use client";

import { generateFunFact, type GenerateFunFactInput } from '@/ai/flows/generate-fun-fact';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, RefreshCw, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useFunFactsSettings } from '@/hooks/use-fun-facts-settings';
import { Skeleton } from './ui/skeleton';

interface FunFact {
  fact: string;
  explanation: string;
}

export function FunFactPanel() {
  const [funFact, setFunFact] = useState<FunFact | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isPanelVisible, togglePanelVisibility, isMounted } = useFunFactsSettings();

  const fetchFunFact = useCallback(async (topic: string = "general physics", gradeLevel: number = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const input: GenerateFunFactInput = { topic, gradeLevel };
      const result = await generateFunFact(input);
      setFunFact(result);
    } catch (err) {
      console.error("Failed to generate fun fact:", err);
      setError("Could not fetch a fun fact. Please try again.");
      setFunFact(null); // Clear previous fact on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPanelVisible && !funFact && isMounted) { // Fetch initial fact only if panel is visible and no fact yet
      fetchFunFact();
    }
  }, [isPanelVisible, funFact, fetchFunFact, isMounted]);

  if (!isMounted || !isPanelVisible) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-w-[calc(100vw-2rem)] shadow-xl z-50 animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          <CardTitle className="text-lg">Fun Physics Fact!</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={togglePanelVisibility} aria-label="Close fun fact panel">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-1/2 mt-2" />
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!isLoading && !error && funFact && (
          <>
            <p className="text-sm font-semibold">{funFact.fact}</p>
            <CardDescription className="mt-1 text-xs">{funFact.explanation}</CardDescription>
          </>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchFunFact()}
          disabled={isLoading}
          className="mt-3 w-full"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          New Fact
        </Button>
      </CardContent>
    </Card>
  );
}
