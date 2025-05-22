
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DownloadCloud, FileText, ListChecks, Star } from "lucide-react";
import Link from "next/link";
import { STUDY_GRADES } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

interface ChapterPageProps {
  params: {
    grade: string;
    chapterId: string;
  };
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const grade = STUDY_GRADES.find(g => g.id === params.grade);
  const chapter = grade?.chapters.find(c => c.id === params.chapterId);

  if (!grade || !chapter) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Study Material not found</h1>
        <p className="text-muted-foreground">The requested chapter could not be located.</p>
        <Button asChild className="mt-4">
          <Link href="/study-material">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Study Materials
          </Link>
        </Button>
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
          <CardDescription>{grade.name} - Sindh Textbook Board Syllabus. Notes by Abdul Ahad Attar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="notes-keypoints" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-1/2">
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
                  {/* Placeholder for PDF Viewer */}
                  <div className="aspect-[4/3] bg-muted rounded-lg flex flex-col items-center justify-center p-4">
                     <Image src="https://placehold.co/800x600.png" alt="PDF Notes Preview" width={800} height={600} data-ai-hint="document textbook" className="max-w-full max-h-full object-contain"/>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Embedded PDF viewer will display notes here. 
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
                            <li><span className="font-medium">Term 1:</span> Explanation of the first key term related to {chapter.name}.</li>
                            <li><span className="font-medium">Term 2:</span> Explanation of the second key term related to {chapter.name}.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2 text-primary">Core Concepts:</h3>
                        <ol className="list-decimal list-inside text-sm space-y-1 pl-4">
                            <li>Brief overview of the first core concept in {chapter.name}.</li>
                            <li>Brief overview of the second core concept in {chapter.name}.</li>
                        </ol>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2 text-primary">Key Formulas (if applicable):</h3>
                        <ul className="list-none text-sm space-y-2 pl-4">
                            <li><code className="bg-muted px-2 py-1 rounded text-sm">E = mc²</code> - Explanation of formula.</li>
                            <li><code className="bg-muted px-2 py-1 rounded text-sm">F = ma</code> - Explanation of formula.</li>
                        </ul>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2">
                        (More detailed key points, summaries, and essential formulas for {chapter.name} will be populated here.)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mcqs" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Solved MCQs</CardTitle>
                  <CardDescription>Practice with multiple-choice questions and their solutions for this chapter.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="p-4 border rounded-md bg-card">
                      <p className="font-semibold mb-1">Question {n}: What is the S.I. unit of force?</p>
                      <ul className="text-sm space-y-1 list-disc list-inside ml-4">
                        <li>Joule</li>
                        <li className="text-primary font-medium">Newton (Correct Answer)</li>
                        <li>Watt</li>
                        <li>Pascal</li>
                      </ul>
                      <p className="text-xs text-muted-foreground mt-2"><strong>Explanation:</strong> The S.I. unit of force is Newton (N), defined as kg·m/s².</p>
                    </div>
                  ))}
                   <Button className="w-full mt-4">Load More MCQs</Button>
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
  const paths: { grade: string; chapterId: string }[] = [];
  STUDY_GRADES.forEach(grade => {
    grade.chapters.forEach(chapter => {
      paths.push({ grade: grade.id, chapterId: chapter.id });
    });
  });
  return paths;
}
