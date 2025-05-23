
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DownloadCloud, FileText, ListChecks, Star, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { APP_AUTHOR } from "@/lib/constants";
import type { StudyGrade, Chapter, ChapterContent, MCQ as MCQType, QuestionAnswer } from '@/lib/types';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const TEACHER_OVERRIDES_STORAGE_KEY = 'physicsLabTeacherChapterOverrides';

interface ChapterPageProps {
  params: {
    grade: string;
    chapterId: string;
  };
}

async function fetchChapterDetails(gradeId: string, chapterId: string): Promise<{ grade: StudyGrade | undefined; chapter: Chapter | undefined; error?: string }> {
  try {
    const res = await fetch(`/api/study-materials`); // Fetch all grades
    if (!res.ok) {
      return { grade: undefined, chapter: undefined, error: `API Error: ${res.status}` };
    }
    const grades: StudyGrade[] = await res.json();
    const grade = grades.find(g => g.id === gradeId);
    if (!grade) {
      return { grade: undefined, chapter: undefined, error: "Grade not found" };
    }
    const chapter = grade.chapters.find(c => c.id === chapterId);
    if (!chapter) {
      return { grade: undefined, chapter: undefined, error: "Chapter not found in this grade" };
    }
    return { grade, chapter };
  } catch (error) {
    console.error("Error fetching chapter details:", error);
    return { grade: undefined, chapter: undefined, error: error instanceof Error ? error.message : "Failed to load chapter details" };
  }
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const { toast } = useToast();
  const [gradeData, setGradeData] = useState<StudyGrade | null>(null);
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [mcqAttempts, setMcqAttempts] = useState<Record<string, { selectedOptionIndex: number | null; isCorrect: boolean | null; revealed: boolean }>>({});

  const loadChapter = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await fetchChapterDetails(params.grade, params.chapterId);
    if (result.error || !result.grade || !result.chapter) {
      setError(result.error || "Chapter data could not be loaded.");
      setGradeData(null);
      setChapterData(null);
    } else {
      let finalChapterData = { ...result.chapter };
      // Try to load teacher overrides from localStorage
      try {
        const overridesRaw = localStorage.getItem(TEACHER_OVERRIDES_STORAGE_KEY);
        if (overridesRaw) {
          const allOverrides = JSON.parse(overridesRaw);
          const chapterOverride = allOverrides[finalChapterData.id];
          if (chapterOverride) {
            finalChapterData.content = { ...finalChapterData.content, ...chapterOverride };
            console.log(`Loaded overrides for chapter ${finalChapterData.id}`, chapterOverride);
          }
        }
      } catch (e) {
        console.error("Failed to load or parse teacher overrides:", e);
      }

      setGradeData(result.grade);
      setChapterData(finalChapterData);
    }
    setIsLoading(false);
  }, [params.grade, params.chapterId]);

  useEffect(() => {
    loadChapter();
  }, [loadChapter]);

  const handleMcqOptionChange = (mcqId: string, optionIndex: number) => {
    setMcqAttempts(prev => ({
      ...prev,
      [mcqId]: { ...prev[mcqId], selectedOptionIndex: optionIndex, isCorrect: null, revealed: false },
    }));
  };

  const checkMcqAnswer = (mcq: MCQType) => {
    const attempt = mcqAttempts[mcq.id];
    if (attempt && attempt.selectedOptionIndex !== null) {
      const correct = attempt.selectedOptionIndex === mcq.correctAnswerIndex;
      setMcqAttempts(prev => ({
        ...prev,
        [mcq.id]: { ...attempt, isCorrect: correct, revealed: true },
      }));
      toast({
        title: correct ? "Correct!" : "Incorrect",
        description: correct ? "Well done!" : `The correct answer was option ${mcq.options[mcq.correctAnswerIndex]}. Check the explanation.`,
        variant: correct ? "default" : "destructive",
        className: correct ? "bg-green-500 text-white" : "",
      });
    } else {
      toast({ title: "No Option Selected", description: "Please select an option before checking.", variant: "destructive" });
    }
  };

  const tryMcqAgain = (mcqId: string) => {
    setMcqAttempts(prev => ({
      ...prev,
      [mcqId]: { selectedOptionIndex: null, isCorrect: null, revealed: false },
    }));
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-64" />
        <div className="mt-4 space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !gradeData || !chapterData) {
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
            {error || `Study material for ${params.chapterId} in grade ${params.grade} not found.`}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const content: ChapterContent = chapterData.content || {};

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild size="sm">
        <Link href="/study-material">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Study Materials
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">{chapterData.name}</CardTitle>
          <CardDescription>{gradeData.name} - Sindh Textbook Board Syllabus. App by {APP_AUTHOR}. {content.lastUpdated && <span className="text-xs text-muted-foreground italic">(Content last updated by teacher: {new Date(content.lastUpdated).toLocaleDateString()})</span>}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="notes-keypoints" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 md:max-w-md">
              <TabsTrigger value="notes-keypoints"><FileText className="mr-2 h-4 w-4" />Notes & Key Points</TabsTrigger>
              <TabsTrigger value="chapter-exercise"><ListChecks className="mr-2 h-4 w-4" />Chapter Exercise</TabsTrigger>
            </TabsList>
            
            <TabsContent value="notes-keypoints" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Full Chapter Notes (PDF)</CardTitle>
                  <CardDescription>
                    {content.pdfName ? `Current PDF: ${content.pdfName}. ` : "No PDF uploaded for this chapter yet. "}
                    Read-only PDF notes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[4/3] bg-muted rounded-lg flex flex-col items-center justify-center p-4">
                     <Image src="https://placehold.co/800x600.png" alt="PDF Notes Preview" width={800} height={600} data-ai-hint="document textbook" className="max-w-full max-h-full object-contain"/>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Embedded PDF viewer placeholder. (Actual PDF viewing functionality to be implemented)
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
                  <div className="p-4 border rounded-md bg-secondary/30 min-h-[200px] space-y-4 whitespace-pre-wrap">
                    {content.keyPoints ? (
                      <p className="text-sm">{content.keyPoints}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No key points available for this chapter yet. Teacher can add these via the Content Management panel.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chapter-exercise" className="mt-4 space-y-6">
              <p className="text-sm text-muted-foreground">All exercises are based on the syllabus.</p>
              
              <Card>
                <CardHeader>
                  <CardTitle>Multiple Choice Questions (MCQs)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {content.mcqs && content.mcqs.length > 0 ? (
                    content.mcqs.map((mcq, index) => (
                      <div key={mcq.id} className="p-4 border rounded-md bg-card shadow-sm">
                        <p className="font-semibold mb-2">Question {index + 1}: {mcq.question}</p>
                        <RadioGroup
                          value={mcqAttempts[mcq.id]?.selectedOptionIndex !== null && mcqAttempts[mcq.id]?.selectedOptionIndex !== undefined ? mcq.options[mcqAttempts[mcq.id]?.selectedOptionIndex!] : undefined}
                          onValueChange={(value) => {
                            const optionIndex = mcq.options.findIndex(opt => opt === value);
                            if (optionIndex !== -1 && !mcqAttempts[mcq.id]?.revealed) {
                                handleMcqOptionChange(mcq.id, optionIndex);
                            }
                          }}
                          disabled={mcqAttempts[mcq.id]?.revealed}
                          className="space-y-2"
                        >
                          {mcq.options.map((option, optIndex) => (
                            <Label
                              key={optIndex}
                              htmlFor={`${mcq.id}-option-${optIndex}`}
                              className={`flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-accent/50
                                ${mcqAttempts[mcq.id]?.revealed && mcq.correctAnswerIndex === optIndex ? 'bg-green-100 dark:bg-green-900 border-green-500' : ''}
                                ${mcqAttempts[mcq.id]?.revealed && mcqAttempts[mcq.id]?.selectedOptionIndex === optIndex && mcq.correctAnswerIndex !== optIndex ? 'bg-red-100 dark:bg-red-900 border-red-500' : ''}
                                ${mcqAttempts[mcq.id]?.selectedOptionIndex === optIndex && !mcqAttempts[mcq.id]?.revealed ? 'bg-secondary' : ''}
                              `}
                            >
                              <RadioGroupItem value={option} id={`${mcq.id}-option-${optIndex}`} disabled={mcqAttempts[mcq.id]?.revealed} />
                              <span>{option}</span>
                            </Label>
                          ))}
                        </RadioGroup>
                        {mcqAttempts[mcq.id]?.revealed && (
                          <div className={`mt-3 p-2 rounded-md text-sm ${mcqAttempts[mcq.id]?.isCorrect ? 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
                            <p className="font-semibold">{mcqAttempts[mcq.id]?.isCorrect ? 'Correct!' : 'Incorrect.'}</p>
                            <p><strong>Explanation:</strong> {mcq.explanation}</p>
                          </div>
                        )}
                        <div className="mt-3">
                          {!mcqAttempts[mcq.id]?.revealed ? (
                            <Button onClick={() => checkMcqAnswer(mcq)} size="sm">
                              <CheckCircle className="mr-2 h-4 w-4"/> Check Answer
                            </Button>
                          ) : (
                            <Button onClick={() => tryMcqAgain(mcq.id)} size="sm" variant="outline">
                              <RefreshCw className="mr-2 h-4 w-4"/> Try Again
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No MCQs available for this chapter yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Short Answer Questions (CRQs)</CardTitle>
                </CardHeader>
                <CardContent>
                  {content.shortAnswers && content.shortAnswers.length > 0 ? (
                    <Accordion type="multiple" className="w-full">
                      {content.shortAnswers.map((qa, index) => (
                        <AccordionItem value={`crq-${qa.id}`} key={qa.id}>
                          <AccordionTrigger>Question {index + 1}: {qa.question}</AccordionTrigger>
                          <AccordionContent className="whitespace-pre-wrap text-sm text-muted-foreground">
                            <strong>Answer:</strong><br />{qa.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <p className="text-muted-foreground">No Short Answer Questions available for this chapter yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Long Answer Questions (ERQs)</CardTitle>
                </CardHeader>
                <CardContent>
                  {content.longAnswers && content.longAnswers.length > 0 ? (
                     <Accordion type="multiple" className="w-full">
                      {content.longAnswers.map((qa, index) => (
                        <AccordionItem value={`erq-${qa.id}`} key={qa.id}>
                          <AccordionTrigger>Question {index + 1}: {qa.question}</AccordionTrigger>
                          <AccordionContent className="whitespace-pre-wrap text-sm text-muted-foreground">
                            <strong>Answer:</strong><br />{qa.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <p className="text-muted-foreground">No Long Answer Questions available for this chapter yet.</p>
                  )}
                </CardContent>
              </Card>

            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// generateStaticParams remains the same as it fetches basic grade/chapter IDs
export async function generateStaticParams() {
  try {
    // In a real app, ensure this URL is correct for your build environment
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/study-materials`);
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
