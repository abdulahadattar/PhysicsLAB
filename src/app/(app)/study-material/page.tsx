
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookText, ChevronRight, AlertTriangle, Loader2 } from "lucide-react";
import { APP_NOTES_AUTHOR } from "@/lib/constants";
import type { StudyGrade } from '@/lib/types';
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

async function fetchStudyGrades(): Promise<{ data: StudyGrade[] | null, error?: string }> {
  try {
    const res = await fetch('/api/study-materials');
    if (!res.ok) {
      return { data: null, error: `Failed to fetch study materials: ${res.status} ${res.statusText}` };
    }
    const jsonData = await res.json();
    return { data: jsonData };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Network error while fetching study materials.';
    return { data: null, error: errorMessage };
  }
}

export default function StudyMaterialPage() {
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiFetchAttempted, setApiFetchAttempted] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setApiFetchAttempted(false);
      let freshDataFetched = false;

      if (navigator.onLine) {
        const result = await fetchStudyGrades();
        setApiFetchAttempted(true);
        if (result.data) {
          setStudyGrades(result.data);
          localStorage.setItem('studyGrades', JSON.stringify(result.data));
          setError(null); // Clear any previous error
          freshDataFetched = true;
        } else {
          // API fetch failed, log warning. Error state will be handled after checking cache.
          console.warn(`API fetch for study materials failed: ${result.error}`);
        }
      }

      if (!freshDataFetched) {
        // Try to load from localStorage if API fetch didn't happen or failed
        const cachedDataString = localStorage.getItem('studyGrades');
        if (cachedDataString) {
          try {
            setStudyGrades(JSON.parse(cachedDataString));
            setError(null); // Using cache, so clear error for UI
            // If API was attempted and failed, but we have cache, show a mild warning
            if (apiFetchAttempted && navigator.onLine) {
                 setError("Could not refresh study materials from the server. Displaying locally cached version. Some content might be outdated.");
            }
          } catch (e) {
            console.error("Failed to parse cached study materials:", e);
            localStorage.removeItem('studyGrades'); // Clear corrupted cache
            if (!navigator.onLine) {
              setError("You are offline and cached study materials could not be loaded.");
            } else {
              setError("Failed to load study materials. Cache might be corrupted.");
            }
          }
        } else {
          // No fresh data and no cache
          if (!navigator.onLine) {
            setError("You are offline and no study materials are cached. Please connect to the internet to load them.");
          } else if (apiFetchAttempted) { // API was tried and failed, and no cache
            setError("Failed to fetch study materials from the server, and no cached data is available.");
          } else { // Should not happen if navigator.onLine was true and apiFetchAttempted is false, but as a fallback
             setError("Study materials could not be loaded. Please check your connection or try again later.");
          }
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, []); // Runs once on mount


  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Study Materials</CardTitle>
            <CardDescription>Loading study materials...</CardDescription>
          </CardHeader>
        </Card>
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-4 text-lg">Loading content...</p>
        </div>
      </div>
    );
  }
  
  // Error display logic:
  // If error is the specific cache refresh warning, show it as default/yellow.
  // Otherwise, show it as destructive.
  const isCacheWarning = error && error.startsWith("Could not refresh study materials");

  if (error && !isCacheWarning && studyGrades.length === 0) { 
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Study Materials</CardTitle>
          </CardHeader>
        </Card>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error} Please check your internet connection or try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!isLoading && !error && studyGrades.length === 0) {
     return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Study Materials</CardTitle>
            <CardDescription>Chapter-wise notes and solved MCQs, aligned with the Sindh Textbook Board syllabus. Materials by {APP_NOTES_AUTHOR}.</CardDescription>
          </CardHeader>
        </Card>
        <p className="text-center text-muted-foreground py-10">No study materials available at the moment. Please try again later.</p>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Study Materials</CardTitle>
          <CardDescription>Chapter-wise notes and solved MCQs, aligned with the Sindh Textbook Board syllabus. Materials by {APP_NOTES_AUTHOR}.</CardDescription>
        </CardHeader>
      </Card>
      
      {error && isCacheWarning && (
        <Alert variant="default" className="bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300">
            <AlertTriangle className="h-4 w-4 !text-yellow-600 dark:!text-yellow-400" />
            <AlertDescription>
                {error}
            </AlertDescription>
        </Alert>
      )}

      <Accordion type="multiple" className="w-full space-y-4" defaultValue={studyGrades.length > 0 ? [`grade-${studyGrades[0].id}`] : undefined}>
        {studyGrades.map((grade) => (
          <Card key={grade.id} className="overflow-hidden shadow-md">
            <AccordionItem value={`grade-${grade.id}`} className="border-none">
              <AccordionTrigger className="bg-secondary/30 hover:bg-secondary/50 px-6 py-4 text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <BookText className="h-6 w-6 text-primary" />
                  {grade.name}
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <ul className="divide-y divide-border">
                  {grade.chapters.map((chapter) => (
                    <li key={chapter.id}>
                      <Link href={`/study-material/${grade.id}/${chapter.id}`} passHref>
                        <Button variant="ghost" className="w-full justify-between rounded-none px-6 py-4 h-auto">
                          <span className="text-left">{chapter.name}</span>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </Link>
                    </li>
                  ))}
                  {grade.chapters.length === 0 && (
                     <li className="px-6 py-4 text-muted-foreground">No chapters available for this grade yet.</li>
                  )}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Card>
        ))}
      </Accordion>
    </div>
  );
}
