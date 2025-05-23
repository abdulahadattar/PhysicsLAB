
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookText, ChevronRight, AlertTriangle, Loader2, FileText, Landmark, Globe, BookCopy as BookIcon } from "lucide-react";
import { APP_AUTHOR } from "@/lib/constants";
import type { StudyGrade } from '@/lib/types';
import { useEffect, useState, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FullTextbookLink {
  key: keyof Pick<StudyGrade, 'completeTextbookPdfLink' | 'ziauddinBoardFullPdfLink' | 'punjabBoardFullPdfLink' | 'nationalSyllabusFullPdfLink'>;
  label: string;
  icon: React.ElementType;
}

const fullTextbookConfigs: FullTextbookLink[] = [
  { key: 'completeTextbookPdfLink', label: "STBB Full Textbook", icon: BookIcon },
  { key: 'ziauddinBoardFullPdfLink', label: "Ziauddin Board Full Textbook", icon: Landmark },
  { key: 'punjabBoardFullPdfLink', label: "Punjab Board Full Textbook", icon: BookIcon },
  { key: 'nationalSyllabusFullPdfLink', label: "National Syllabus Full Textbook", icon: Globe },
];


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

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setApiFetchAttempted(false);
    let freshDataFetched = false;
    let localOverridesApplied = false;

    // Try loading from localStorage overrides first to ensure teacher changes are prioritized if available
    const gradeOverridesRaw = typeof window !== 'undefined' ? localStorage.getItem('physicsLabTeacherGradeOverrides') : null;
    let allGradeOverrides: Record<string, Partial<StudyGrade>> = {};
    if (gradeOverridesRaw) {
        try {
            allGradeOverrides = JSON.parse(gradeOverridesRaw);
            localOverridesApplied = true;
        } catch (e) {
            console.error("Failed to parse grade overrides from localStorage:", e);
        }
    }

    if (typeof window !== 'undefined' && navigator.onLine) {
      const result = await fetchStudyGrades();
      setApiFetchAttempted(true);
      if (result.data) {
        let fetchedData = result.data;
        // Apply overrides to freshly fetched data
        fetchedData = fetchedData.map(grade => {
            const override = allGradeOverrides[grade.id];
            return override ? { ...grade, ...override } : grade;
        });
        setStudyGrades(fetchedData);
        localStorage.setItem('studyGradesCache', JSON.stringify(fetchedData)); // Use a different key for API fetched cache
        setError(null);
        freshDataFetched = true;
      } else {
        console.warn(`API fetch for study materials failed: ${result.error}`);
      }
    }

    if (!freshDataFetched) {
      const cachedDataString = typeof window !== 'undefined' ? localStorage.getItem('studyGradesCache') : null;
      if (cachedDataString) {
        try {
          let cachedData: StudyGrade[] = JSON.parse(cachedDataString);
          // Apply overrides to cached data as well if not already applied
          if (localOverridesApplied) { // only re-apply if initial fetch was skipped
            cachedData = cachedData.map(grade => {
                const override = allGradeOverrides[grade.id];
                return override ? { ...grade, ...override } : grade;
            });
          }
          setStudyGrades(cachedData);
          setError(null);
          if (apiFetchAttempted && typeof window !== 'undefined' && navigator.onLine) {
            setError("Could not refresh study materials from the server. Displaying locally cached version. Some content might be outdated.");
          }
        } catch (e) {
          console.error("Failed to parse cached study materials:", e);
          if (typeof window !== 'undefined') localStorage.removeItem('studyGradesCache');
          setError( (typeof window !== 'undefined' && !navigator.onLine) ? "You are offline and cached study materials could not be loaded." : "Failed to load study materials. Cache might be corrupted.");
        }
      } else {
        if (typeof window !== 'undefined' && !navigator.onLine) {
          setError("You are offline and no study materials are cached. Please connect to the internet to load them.");
        } else if (apiFetchAttempted) {
          setError("Failed to fetch study materials from the server, and no cached data is available.");
        } else {
           setError("Study materials could not be loaded. Please check your connection or try again later.");
        }
      }
    }
    setIsLoading(false);
  }, [apiFetchAttempted]); // Ensure apiFetchAttempted is a dependency

  useEffect(() => {
    loadData();
  }, [loadData]);


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
            <CardDescription>Chapter-wise notes and solved MCQs, aligned with the Sindh Textbook Board syllabus. App by {APP_AUTHOR}.</CardDescription>
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
          <CardDescription>Chapter-wise notes and solved MCQs, aligned with the Sindh Textbook Board syllabus. App by {APP_AUTHOR}.</CardDescription>
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
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <BookText className="h-6 w-6 text-primary" />
                        {grade.name}
                    </div>
                     <div className="flex items-center gap-1 flex-wrap justify-end max-w-[60%]">
                        {fullTextbookConfigs.map(config => {
                            const link = grade[config.key];
                            if (link) {
                                return (
                                    <Button
                                        key={config.key}
                                        variant="link"
                                        asChild
                                        size="sm"
                                        className="text-primary hover:underline px-1.5 py-1 h-auto text-xs"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                        <config.icon className="h-3.5 w-3.5"/> {config.label.replace(" Full Textbook", "")}
                                        </a>
                                    </Button>
                                );
                            }
                            return null;
                        })}
                    </div>
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
