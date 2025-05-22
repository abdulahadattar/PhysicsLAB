
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

async function fetchStudyGrades(): Promise<StudyGrade[]> {
  const res = await fetch('/api/study-materials');
  if (!res.ok) {
    throw new Error('Failed to fetch study materials');
  }
  return res.json();
}

export default function StudyMaterialPage() {
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await fetchStudyGrades();
        // Try to load from localStorage first
        const cachedData = localStorage.getItem('studyGrades');
        if (cachedData) {
          setStudyGrades(JSON.parse(cachedData));
        } else {
          setStudyGrades(data);
          localStorage.setItem('studyGrades', JSON.stringify(data));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        const cachedData = localStorage.getItem('studyGrades');
        if (cachedData) {
          setStudyGrades(JSON.parse(cachedData));
          setError(null); // if cache exists, don't show API error, just use cache
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Attempt to refresh data from API if online, otherwise use cache.
  useEffect(() => {
    const refreshDataIfNeeded = async () => {
      if (navigator.onLine) {
        try {
          const data = await fetchStudyGrades();
          setStudyGrades(data);
          localStorage.setItem('studyGrades', JSON.stringify(data));
        } catch (err) {
          // If refresh fails, we rely on existing state (potentially from cache)
          console.error("Failed to refresh study materials, using cached version if available:", err);
        }
      }
    };
    refreshDataIfNeeded();
  }, []);


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

  if (error && studyGrades.length === 0) { // Only show error if no cached data
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
            Failed to load study materials: {error}. Please check your internet connection and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!studyGrades || studyGrades.length === 0) {
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
      
      {error && ( // Show non-blocking error if API failed but cache was used
        <Alert variant="default" className="bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300">
            <AlertTriangle className="h-4 w-4 !text-yellow-600 dark:!text-yellow-400" />
            <AlertDescription>
                Could not refresh study materials from the server. Displaying locally cached version. Some content might be outdated.
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
