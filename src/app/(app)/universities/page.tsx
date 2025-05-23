
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Link as LinkIcon, Loader2, AlertTriangle } from "lucide-react";
import type { UniversityProgram } from '@/lib/types';

// Directly import the JSON data for client-side rendering
import universitiesData from '@/data/universities.json';


export default function UniversityProgramsPage() {
  const [universities, setUniversities] = useState<UniversityProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUniversities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate async fetch, but use imported data
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate small delay
      const data: UniversityProgram[] = universitiesData;
      if (!data || data.length === 0) {
        setError("No university program data found. The data file might be empty.");
      }
      setUniversities(data);
    } catch (e) {
      console.error("Error loading university programs:", e);
      setError(e instanceof Error ? e.message : "Could not load university program data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUniversities();
  }, [loadUniversities]);

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
             <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Physics Universities & Programs in Sindh (and Pakistan)</CardTitle>
          <CardDescription>Explore universities offering physics degrees and programs. (This is a sample list and may not be exhaustive).</CardDescription>
        </CardHeader>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3">Loading university programs...</p>
        </div>
      )}
      {error && !isLoading && (
        <Card><CardContent className="pt-6"><Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert></CardContent></Card>
      )}

      {!isLoading && !error && universities.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {universities.map((uni) => (
            <Card key={uni.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{uni.name}</CardTitle>
                <CardDescription>{uni.city} - {uni.type}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-1">
                <p className="text-sm"><span className="font-semibold">Degrees:</span> {uni.degreesOffered.join(', ')}</p>
                {uni.keyLabs && uni.keyLabs.length > 0 && <p className="text-sm"><span className="font-semibold">Key Labs/Groups:</span> {uni.keyLabs.join(', ')}</p>}
              </CardContent>
              <CardContent className="mt-auto">
                <Button asChild className="w-full">
                  <a href={uni.departmentUrl} target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="mr-2 h-4 w-4" /> Visit Department
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!isLoading && !error && universities.length === 0 && (
        <Card><CardContent className="pt-6 text-center text-muted-foreground">No university programs data available.</CardContent></Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Disclaimer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            The university information provided here is for general guidance and may not be fully up-to-date or comprehensive. Students are strongly encouraged to visit the official university websites for the latest program details, admission criteria, and contact information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
    
