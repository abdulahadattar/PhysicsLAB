import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DownloadCloud, FileText, ListChecks } from "lucide-react";
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
          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-1/2">
              <TabsTrigger value="notes"><FileText className="mr-2 h-4 w-4" />Notes</TabsTrigger>
              <TabsTrigger value="mcqs"><ListChecks className="mr-2 h-4 w-4" />Solved MCQs</TabsTrigger>
            </TabsList>
            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Chapter Notes</CardTitle>
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
