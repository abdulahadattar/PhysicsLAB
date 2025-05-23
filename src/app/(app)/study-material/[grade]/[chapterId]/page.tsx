
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { StudyGrade, Chapter } from '@/lib/types';
import { Alert, AlertDescription } from "@/components/ui/alert";
import ChapterDetailClient from "@/components/study/chapter-detail-client";

interface ChapterPageProps {
  params: {
    grade: string;
    chapterId: string;
  };
}

async function fetchInitialChapterData(gradeId: string, chapterId: string): Promise<{ grade?: StudyGrade; chapter?: Chapter; error?: string }> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const res = await fetch(`${appUrl}/api/study-materials`);
    
    if (!res.ok) {
      return { error: `API Error: ${res.status} ${res.statusText}` };
    }
    
    const gradesData = await res.json();
    if (!Array.isArray(gradesData)) {
        console.error("API did not return an array for grades:", gradesData);
        return { error: "Invalid data format received from API for grades." };
    }
    const grades: StudyGrade[] = gradesData;

    const grade = grades.find(g => g && g.id === gradeId);
    if (!grade) {
      return { error: `Grade not found: ${gradeId}` };
    }

    if (!Array.isArray(grade.chapters)) {
      console.error(`Grade ${gradeId} has malformed chapters data (not an array).`);
      return { error: `Chapters data for grade '${grade.name}' is malformed.`, grade };
    }

    const chapter = grade.chapters.find(c => c && c.id === chapterId); // Ensure 'c' itself is not null/undefined
    if (!chapter) {
      return { error: `Chapter not found: ${chapterId} in grade '${grade.name}'`, grade };
    }
    
    return { grade, chapter };
  } catch (error) {
    console.error("Error fetching initial chapter data:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to load initial chapter details due to an unexpected error.";
    return { error: errorMessage };
  }
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { grade: initialGradeData, chapter: initialChapterData, error: fetchError } = await fetchInitialChapterData(params.grade, params.chapterId);

  if (fetchError || !initialGradeData || !initialChapterData) {
    let displayError = fetchError;
    if (!displayError) {
      if (!initialGradeData) displayError = "Grade data could not be loaded for this page.";
      else if (!initialChapterData) displayError = `Chapter (${params.chapterId}) could not be found in grade ${initialGradeData.name || params.grade}.`;
      else displayError = "Failed to load chapter details for an unknown reason.";
    }
    
    return (
      <div className="space-y-6 p-4 md:p-6">
         <Button variant="outline" asChild size="sm">
          <Link href="/study-material">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Study Materials
          </Link>
        </Button>
        <Card className="shadow-lg">
            <CardHeader>
                 <CardTitle className="text-2xl">Error Loading Chapter</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    {displayError} Please check the URL or try again later. If the problem persists, the content might be missing or misconfigured.
                </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      </div>
    );
  }

  // At this point, initialGradeData and initialChapterData are guaranteed to be defined objects.
  // The Chapter type allows chapter.content to be undefined. ChapterDetailClient handles this.
  return (
    <ChapterDetailClient 
        initialGradeData={initialGradeData} 
        initialChapterData={initialChapterData}
        params={params}
    />
  );
}

export async function generateStaticParams() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const res = await fetch(`${appUrl}/api/study-materials`);
    
    if (!res.ok) {
      console.error("Static Gen: Failed to fetch study grades for static generation:", res.status, await res.text());
      return []; 
    }
    
    const gradesData = await res.json();
    if (!Array.isArray(gradesData)) {
        console.error("Static Gen: API did not return an array for grades:", gradesData);
        return [];
    }
    const grades: StudyGrade[] = gradesData;

    const paths: { grade: string; chapterId: string }[] = [];
    
    grades.forEach(grade => {
      if (grade && grade.id && Array.isArray(grade.chapters)) {
        grade.chapters.forEach(chapter => {
          if (chapter && chapter.id) { // Ensure chapter and chapter.id are valid
            paths.push({ grade: grade.id, chapterId: chapter.id });
          } else {
            console.warn(`Static Gen: Malformed chapter data (id: ${chapter?.id}, name: ${chapter?.name}) in grade '${grade.name}' (id: ${grade.id}). Skipping.`);
          }
        });
      } else {
         console.warn(`Static Gen: Malformed grade data or missing chapters array for grade (id: ${grade?.id}, name: ${grade?.name}). Skipping.`);
      }
    });
    return paths;
  } catch (error) {
    console.error("Static Gen: Failed to generate static params for chapters:", error);
    return []; 
  }
}
