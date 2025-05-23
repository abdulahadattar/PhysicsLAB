
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Telescope, Link as LinkIcon, Loader2, AlertTriangle } from "lucide-react";
import type { ResearchCenter } from '@/lib/types';

// Directly import the JSON data for client-side rendering
import researchCentersData from '@/data/research-centers.json';


export default function ResearchCentersPage() {
  const [centers, setCenters] = useState<ResearchCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResearchCenters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate async fetch, but use imported data
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate small delay
      const data: ResearchCenter[] = researchCentersData; 
      if (!data || data.length === 0) {
        setError("No research center data found. The data file might be empty.");
      }
      setCenters(data);
    } catch (e) {
      console.error("Error loading research centers:", e);
      setError(e instanceof Error ? e.message : "Could not load research center data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResearchCenters();
  }, [loadResearchCenters]);

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
             <Telescope className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Physics Research Centers & Observatories</CardTitle>
          <CardDescription>Explore some of the world's leading institutions driving physics research and discovery.</CardDescription>
        </CardHeader>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3">Loading research centers...</p>
        </div>
      )}
      {error && !isLoading && (
         <Card><CardContent className="pt-6"><Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert></CardContent></Card>
      )}

      {!isLoading && !error && centers.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {centers.map((center) => (
            <Card key={center.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{center.name}</CardTitle>
                <CardDescription>{center.location}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <p className="text-sm"><span className="font-semibold">Focus:</span> {center.primaryFocus}</p>
                <p className="text-sm"><span className="font-semibold">Key Achievement:</span> {center.keyAchievement}</p>
              </CardContent>
              <CardContent className="mt-auto">
                <Button asChild className="w-full">
                  <a href={center.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="mr-2 h-4 w-4" /> Visit Website
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
       {!isLoading && !error && centers.length === 0 && (
         <Card><CardContent className="pt-6 text-center text-muted-foreground">No research centers data available.</CardContent></Card>
      )}

       <Card>
        <CardHeader>
          <CardTitle>More to Explore</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is just a sample of the many incredible physics research centers and observatories around the globe. Students are encouraged to research further based on their interests! Topics like local university research departments or specific observatories can also be explored.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
    
