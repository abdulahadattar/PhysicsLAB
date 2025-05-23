
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { StudyGrade, Chapter, ChapterContent } from '@/lib/types';
import { APP_AUTHOR } from "@/lib/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ChapterDetailClient from "@/components/study/chapter-detail-client"; // New Client Component

const TEACHER_OVERRIDES_STORAGE_KEY = 'physicsLabTeacherChapterOverrides'; // Keep for server-side initial prop if needed later, though primary override logic is client.

interface ChapterPageProps {
  params: {
    grade: string;
    chapterId: string;
  };
}

async function fetchInitialChapterData(gradeId: string, chapterId: string): Promise<{ grade?: StudyGrade; chapter?: Chapter; error?: string }> {
  try {
    // In a real app, ensure this URL is correct for your build/server environment
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const res = await fetch(`${appUrl}/api/study-materials`);
    if (!res.ok) {
      return { error: `API Error: ${res.status}` };
    }
    const grades: StudyGrade[] = await res.json();
    const grade = grades.find(g => g.id === gradeId);
    if (!grade) {
      return { error: "Grade not found" };
    }
    const chapter = grade.chapters.find(c => c.id === chapterId);
    if (!chapter) {
      return { error: "Chapter not found in this grade" };
    }
    // Do NOT attempt to access localStorage on the server.
    // localStorage overrides will be handled purely client-side in ChapterDetailClient.
    return { grade, chapter };
  } catch (error) {
    console.error("Error fetching initial chapter data:", error);
    return { error: error instanceof Error ? error.message : "Failed to load initial chapter details" };
  }
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { grade: initialGradeData, chapter: initialChapterData, error } = await fetchInitialChapterData(params.grade, params.chapterId);

  if (error || !initialGradeData || !initialChapterData) {
    return (
      <div className="space-y-6 p-4">
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
                    {error || `Study material for chapter ${params.chapterId} in grade ${params.grade} could not be loaded.`}
                </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      </div>
    );
  }

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
    // In a real app, ensure this URL is correct for your build environment
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const res = await fetch(`${appUrl}/api/study-materials`);
    
    if (!res.ok) {
      console.error("Static Gen: Failed to fetch study grades for static generation:", await res.text());
      return []; 
    }
    const grades: StudyGrade[] = await res.json();
    const paths: { grade: string; chapterId: string }[] = [];
    grades.forEach(grade => {
      grade.chapters.forEach(chapter => {
        paths.push({ grade: grade.id, chapterId: chapter.id });
      });
    });
    return paths;
  } catch (error) {
    console.error("Static Gen: Failed to generate static params for chapters:", error);
    return []; 
  }
}
