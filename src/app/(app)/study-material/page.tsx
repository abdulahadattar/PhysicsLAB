
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link"; // Keep Link for chapter navigation
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookText, ChevronRight, AlertTriangle, Loader2, FileText, Landmark, Globe, BookCopy } from "lucide-react";
import { APP_AUTHOR } from "@/lib/constants";
import type { StudyGrade, TeacherGradeOverride } from '@/lib/types';
import { useEffect, useState, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation'; // ADD THIS IMPORT for router.push

interface FullTextbookLinkConfig {
  key: keyof Pick<StudyGrade, 'completeTextbookPdfLink' | 'ziauddinBoardFullPdfLink' | 'punjabBoardFullPdfLink' | 'nationalSyllabusFullPdfLink'>;
  label: string;
  icon: React.ElementType;
}

const fullTextbookConfigs: FullTextbookLinkConfig[] = [
  { key: 'completeTextbookPdfLink', label: "STBB Full Textbook", icon: BookCopy },
  { key: 'ziauddinBoardFullPdfLink', label: "Ziauddin Board Full Textbook", icon: Landmark },
  { key: 'punjabBoardFullPdfLink', label: "Punjab Board Full Textbook", icon: BookCopy },
  { key: 'nationalSyllabusFullPdfLink', label: "National Syllabus Full Textbook", icon: Globe },
];

const STUDY_GRADES_CACHE_KEY = 'studyGradesCache';
const TEACHER_GRADE_OVERRIDES_STORAGE_KEY = 'physicsLabTeacherGradeOverrides';


async function fetchStudyGradesAPI(): Promise<{ data: StudyGrade[] | null, error?: string }> {
  try {
    const res = await fetch('/api/study-materials');
    if (!res.ok) {
      return { data: null, error: `Failed to fetch study materials: ${res.status} ${res.statusText}` };
    }
    const jsonData = await res.json();
    if (!Array.isArray(jsonData)) {
      console.error("API did not return an array for grades:", jsonData);
      return { data: null, error: "Invalid data format received from API for grades."};
    }
    return { data: jsonData };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Network error while fetching study materials.';
    return { data: null, error: errorMessage };
  }
}

function applyGradeOverrides(grades: StudyGrade[], overrides: Record<string, Partial<TeacherGradeOverride>>): StudyGrade[] {
  if (!grades || Object.keys(overrides).length === 0) return grades;
  return grades.map(grade => {
    const override = overrides[grade.id];
    return override ? { ...grade, ...override } : grade;
  });
}

export default function StudyMaterialPage() {
  const router = useRouter(); // INITIALIZE THE ROUTER
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setInfoMessage(null);
    let gradesToDisplay: StudyGrade[] = [];
    let teacherOverrides: Record<string, Partial<TeacherGradeOverride>> = {};

    if (typeof window !== 'undefined') {
      try {
        const overridesRaw = localStorage.getItem(TEACHER_GRADE_OVERRIDES_STORAGE_KEY);
        if (overridesRaw) {
          teacherOverrides = JSON.parse(overridesRaw);
        }
      } catch (e) {
        console.warn("Failed to parse teacher grade overrides from localStorage:", e);
      }
      
      const cachedDataString = localStorage.getItem(STUDY_GRADES_CACHE_KEY);
      if (cachedDataString) {
        try {
          const cachedData = JSON.parse(cachedDataString);
          gradesToDisplay = applyGradeOverrides(cachedData, teacherOverrides);
          setStudyGrades(gradesToDisplay);
          // Don't set info message here yet, wait for online check
        } catch (e) {
          console.warn("Failed to parse cached study materials:", e);
          localStorage.removeItem(STUDY_GRADES_CACHE_KEY); 
        }
      }
    }

    if (isOnline) {
      setInfoMessage(gradesToDisplay.length > 0 ? "Checking for content updates..." : "Fetching content...");
      const result = await fetchStudyGradesAPI();
      if (result.data) {
        gradesToDisplay = applyGradeOverrides(result.data, teacherOverrides);
        setStudyGrades(gradesToDisplay);
        setError(null);
        setInfoMessage(null); 
        if (typeof window !== 'undefined') {
          localStorage.setItem(STUDY_GRADES_CACHE_KEY, JSON.stringify(result.data)); 
        }
      } else {
        if (gradesToDisplay.length > 0) { // API failed but cache exists
          setError(`Could not refresh study materials: ${result.error || 'Unknown API error'}. Displaying last available version.`);
          setInfoMessage(null);
        } else { // API failed and no cache
          setError(`Failed to load study materials: ${result.error || 'Unknown API error'}. Please check your connection or try again later.`);
        }
      }
    } else { // Offline
      if (gradesToDisplay.length === 0) {
        setError("You are offline and no study materials are cached. Please connect to the internet to load them.");
      } else {
        setInfoMessage("You are offline. Displaying cached content.");
      }
    }
    setIsLoading(false);
  }, [isOnline]);

  useEffect(() => {
    loadData();
  }, [loadData]); 

  if (isLoading && studyGrades.length === 0) { 
    return (
      <div className="space-y-8">
        <Card className="animate-in fade-in-0 slide-in-from-top-5 duration-500 ease-out">
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
        <Card className="animate-in fade-in-0 slide-in-from-top-5 duration-500 ease-out">
          <CardHeader>
            <CardTitle className="text-3xl">Study Materials</CardTitle>
          </CardHeader>
        </Card>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!isLoading && studyGrades.length === 0 && !error) {
     return (
      <div className="space-y-8">
        <Card className="animate-in fade-in-0 slide-in-from-top-5 duration-500 ease-out">
          <CardHeader>
            <CardTitle className="text-3xl">Study Materials</CardTitle>
            <CardDescription>Chapter-wise notes and solved MCQs. App by {APP_AUTHOR}.</CardDescription>
          </CardHeader>
        </Card>
        <p className="text-center text-muted-foreground py-10">No study materials available at the moment. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="animate-in fade-in-0 slide-in-from-top-5 duration-500 ease-out">
        <CardHeader>
          <CardTitle className="text-3xl">Study Materials</CardTitle>
          <CardDescription>Chapter-wise notes and solved MCQs. App by {APP_AUTHOR}.</CardDescription>
        </CardHeader>
      </Card>
      
      {isLoading && studyGrades.length > 0 && ( 
          <div className="flex items-center justify-center text-sm text-muted-foreground p-2">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Checking for updates...</span>
          </div>
      )}

      {infoMessage && !isCacheWarning && (
        <Alert variant="default">
            <AlertDescription>{infoMessage}</AlertDescription>
        </Alert>
      )}
      {error && isCacheWarning && (
        <Alert variant="default" className="bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300">
            <AlertTriangle className="h-4 w-4 !text-yellow-600 dark:!text-yellow-400" />
            <AlertDescription>
                {error}
            </AlertDescription>
        </Alert>
      )}

      <Accordion type="multiple" className="w-full space-y-4" defaultValue={studyGrades.length > 0 ? [`grade-${studyGrades[0].id}`] : undefined}>
        {studyGrades.map((grade, gradeIndex) => (
          <Card 
            key={grade.id} 
            className="overflow-hidden shadow-md animate-in fade-in-0 slide-in-from-bottom-5 duration-500 ease-out"
            style={{ animationDelay: `${gradeIndex * 100}ms` }}
          >
            <AccordionItem value={`grade-${grade.id}`} className="border-none" key={grade.id}>
              <AccordionTrigger className="bg-secondary/30 hover:bg-secondary/50 px-6 py-4 text-xl font-semibold hover:no-underline">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <BookText className="h-6 w-6 text-primary" />
                        {grade.name}
                    </div>
                    {/* Wrap buttons in a non-interactive div to avoid nested button error */}
                    <div className="flex items-center gap-1 flex-wrap justify-end max-w-[60%]">
                        {fullTextbookConfigs.map(config => {
                            const pdfUrl = grade[config.key as keyof StudyGrade] as string | undefined;
                            if (pdfUrl) {
                                // Handle STBB Full Textbook with internal navigation
                                if (config.key === 'completeTextbookPdfLink') {
                                    return (
                                        <Button
                                            key={config.key}
                                            variant="link"
                                            size="sm"
                                            className="text-primary hover:underline px-1.5 py-1 h-auto text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent accordion toggle
                                                // Programmatic navigation using Next.js router
                                                router.push(`/study-material/${grade.id}/full-textbook?url=${encodeURIComponent(pdfUrl)}&title=${encodeURIComponent(config.label.replace(" Full Textbook", ""))}`);
                                            }}
                                        >
                                            <config.icon className="mr-1 h-3.5 w-3.5"/>
                                            {config.label.replace(" Full Textbook", "")}
                                        </Button>
                                    );
                                }
                                // Handle other full textbook types with external link (or modify similarly if needed)
                                return (
                                    <Button
                                        key={config.key} // Use config key for unique key prop
                                        variant="link" // Style as a link
                                        asChild // Render as the child element (the <a> tag)
                                        size="sm" // Small button size
                                        className="text-primary hover:underline px-1.5 py-1 h-auto text-xs" // Custom styling
                                        onClick={(e) => e.stopPropagation()} // Prevent the parent accordion item from toggling
                                    >
                                        {/* The actual anchor tag for external link */}
                                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                        <config.icon className="h-3.5 w-3.5"/> {config.label.replace(" Full Textbook", "")} {/* Display icon and label */}
                                        </a> {/* Closing anchor tag */}
                                    </Button>
                                );
                            }
                            return null;
                        })}
                    </div> {/* Close the non-interactive div */}
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <ul className="divide-y divide-border">
                  {grade.chapters.map((chapter) => (
                    <li key={chapter.id} className="transition-colors hover:bg-muted/30">
                      <Link href={`/study-material/${grade.id}/${chapter.id}`} passHref>
                        <Button variant="ghost" className="w-full justify-between rounded-none px-6 py-4 h-auto">
                          <div className="flex items-center gap-2 text-left">
                            <span>{chapter.name}</span>
                            {chapter.tags && chapter.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
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
