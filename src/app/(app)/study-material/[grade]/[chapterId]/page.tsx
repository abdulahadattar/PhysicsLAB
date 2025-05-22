
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DownloadCloud, FileText, ListChecks, Star, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { APP_NOTES_AUTHOR } from "@/lib/constants";
import type { StudyGrade, Chapter } from '@/lib/types';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChapterPageProps {
  params: {
    grade: string;
    chapterId: string;
  };
}

// Function to fetch all study grades (could be cached or fetched once)
async function fetchAllStudyGrades(): Promise<StudyGrade[]> {
  // In a real app, fetch from your API endpoint
  // For generateStaticParams, ensure this can run at build time
  // This might mean a direct file read or a fetch to an internal/public API endpoint
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/study-materials`);
  if (!res.ok) {
    console.error("Failed to fetch study grades for static generation:", await res.text());
    // Fallback or error handling if API is down during build
    // This is critical for generateStaticParams
    return []; 
  }
  try {
    return await res.json();
  } catch (e) {
    console.error("Failed to parse study grades JSON for static generation:", e);
    return [];
  }
}

async function getChapterDetails(gradeId: string, chapterId: string): Promise<{ grade: StudyGrade | undefined; chapter: Chapter | undefined }> {
  try {
    const grades = await fetchAllStudyGrades();
    const grade = grades.find(g => g.id === gradeId);
    const chapter = grade?.chapters.find(c => c.id === chapterId);
    return { grade, chapter };
  } catch (error) {
    console.error("Error fetching chapter details:", error);
    return { grade: undefined, chapter: undefined };
  }
}


export default async function ChapterPage({ params }: ChapterPageProps) {
  const { grade: gradeData, chapter } = await getChapterDetails(params.grade, params.chapterId);

  if (!gradeData || !chapter) {
    return (
      <div className="space-y-6">
         <Button variant="outline" asChild size="sm">
          <Link href="/study-material">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Study Materials
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Study material for {params.chapterId} in grade {params.grade} not found or failed to load. It might be due to an incorrect link or a server issue.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild size="sm">
        <Link href="/study-material">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Study Materials
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">{chapter.name}</CardTitle>
          <CardDescription>{gradeData.name} - Sindh Textbook Board Syllabus. Notes by {APP_NOTES_AUTHOR}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="notes-keypoints" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 md:w-auto md:max-w-md">
              <TabsTrigger value="notes-keypoints"><FileText className="mr-2 h-4 w-4" />Notes & Key Points</TabsTrigger>
              <TabsTrigger value="mcqs"><ListChecks className="mr-2 h-4 w-4" />Solved MCQs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="notes-keypoints" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Full Chapter Notes (PDF)</CardTitle>
                  <CardDescription>Read-only PDF notes. For offline access, ensure the app is used on a device with the PDF pre-loaded or viewable when online initially.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[4/3] bg-muted rounded-lg flex flex-col items-center justify-center p-4">
                     <Image src="https://placehold.co/800x600.png" alt="PDF Notes Preview" width={800} height={600} data-ai-hint="document textbook" className="max-w-full max-h-full object-contain"/>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Embedded PDF viewer will display notes here. (Content to be added)
                    </p>
                    <Button variant="outline" className="mt-2" disabled>
                      <DownloadCloud className="mr-2 h-4 w-4" /> Download PDF (Disabled)
                    </Button>
                     <p className="text-xs text-muted-foreground mt-1">PDFs are read-only and not downloadable as per requirements.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-400"/>Key Points & Summary</CardTitle>
                  <CardDescription>Quickly review the most important concepts, definitions, and formulas from this chapter.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded-md bg-secondary/30 min-h-[200px] space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2 text-primary">Important Definitions:</h3>
                        <ul className="list-disc list-inside text-sm space-y-1 pl-4">
                            <li><span className="font-medium">Term 1:</span> (Definition for {chapter.name} - Content to be added)</li>
                            <li><span className="font-medium">Term 2:</span> (Definition for {chapter.name} - Content to be added)</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2 text-primary">Core Concepts:</h3>
                        <ol className="list-decimal list-inside text-sm space-y-1 pl-4">
                            <li>(Core concept 1 for {chapter.name} - Content to be added)</li>
                            <li>(Core concept 2 for {chapter.name} - Content to be added)</li>
                        </ol>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2 text-primary">Key Formulas (if applicable):</h3>
                        <ul className="list-none text-sm space-y-2 pl-4">
                            <li><code className="bg-muted px-2 py-1 rounded text-sm">Formula 1</code> - (Explanation for {chapter.name} - Content to be added)</li>
                            <li><code className="bg-muted px-2 py-1 rounded text-sm">Formula 2</code> - (Explanation for {chapter.name} - Content to be added)</li>
                        </ul>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2">
                        (More detailed key points, summaries, and essential formulas for {chapter.name} will be populated from the content file: /src/data/study-materials.json or a dedicated content source.)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mcqs" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Solved MCQs</CardTitle>
                  <CardDescription>Practice with multiple-choice questions and their solutions for this chapter. (Content to be added)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="p-4 border rounded-md bg-card">
                      <p className="font-semibold mb-1">Question {n} for {chapter.name}: (MCQ text to be added)</p>
                      <ul className="text-sm space-y-1 list-disc list-inside ml-4">
                        <li>Option A</li>
                        <li className="text-primary font-medium">Option B (Example Correct Answer)</li>
                        <li>Option C</li>
                        <li>Option D</li>
                      </ul>
                      <p className="text-xs text-muted-foreground mt-2"><strong>Explanation:</strong> (Explanation for MCQ {n} to be added)</p>
                    </div>
                  ))}
                   <Button className="w-full mt-4" disabled>Load More MCQs (Feature to come)</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const grades = await fetchAllStudyGrades();
    const paths: { grade: string; chapterId: string }[] = [];
    grades.forEach(grade => {
      grade.chapters.forEach(chapter => {
        paths.push({ grade: grade.id, chapterId: chapter.id });
      });
    });
    return paths;
  } catch (error) {
    console.error("Failed to generate static params for chapters:", error);
    return []; // Fallback to no pre-rendered paths if API fails during build
  }
}
