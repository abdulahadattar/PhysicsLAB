
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, ListChecks, Star, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { APP_AUTHOR } from "@/lib/constants";
import type { StudyGrade, Chapter, ChapterContent, MCQ as MCQType, QuestionAnswer, TeacherChapterOverrides } from '@/lib/types';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const TEACHER_OVERRIDES_STORAGE_KEY = 'physicsLabTeacherChapterOverrides';

interface ChapterDetailClientProps {
  initialGradeData: StudyGrade;
  initialChapterData: Chapter;
  params: {
    grade: string;
    chapterId: string;
  };
}

export default function ChapterDetailClient({ initialGradeData, initialChapterData, params }: ChapterDetailClientProps) {
  const { toast } = useToast();
  const [gradeData, setGradeData] = useState<StudyGrade | null>(initialGradeData);
  const [chapterData, setChapterData] = useState<Chapter | null>(initialChapterData);
  const [isLoading, setIsLoading] = useState(false); // Initial data is passed as props, so not loading initially. Could be used for refresh.
  
  const [mcqAttempts, setMcqAttempts] = useState<Record<string, { selectedOptionIndex: number | null; isCorrect: boolean | null; revealed: boolean }>>({});

  const loadChapterWithOverrides = useCallback(() => {
    setIsLoading(true);
    let finalChapterData = { ...initialChapterData };
    try {
      if (typeof window !== 'undefined') {
          const overridesRaw = localStorage.getItem(TEACHER_OVERRIDES_STORAGE_KEY);
          if (overridesRaw) {
            const allOverrides: TeacherChapterOverrides = JSON.parse(overridesRaw);
            const chapterOverride = allOverrides[finalChapterData.id];
            if (chapterOverride) {
                // Ensure mcqs, shortAnswers, longAnswers are initialized as arrays if they exist in override but not in base
                const mergedContent = {
                  ...finalChapterData.content,
                  ...chapterOverride,
                  mcqs: chapterOverride.mcqs || finalChapterData.content?.mcqs || [],
                  shortAnswers: chapterOverride.shortAnswers || finalChapterData.content?.shortAnswers || [],
                  longAnswers: chapterOverride.longAnswers || finalChapterData.content?.longAnswers || [],
                };
                finalChapterData.content = mergedContent;
            }
          }
      }
    } catch (e) {
      console.error("Failed to load or parse teacher overrides:", e);
      toast({
        title: "Content Override Error",
        description: "Could not load teacher-modified content. Displaying default material.",
        variant: "destructive"
      })
    }
    setChapterData(finalChapterData);
    setGradeData(initialGradeData); // Grade data doesn't change based on overrides
    setIsLoading(false);
  }, [initialChapterData, initialGradeData, toast]);

  useEffect(() => {
    loadChapterWithOverrides();
  }, [loadChapterWithOverrides]);


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
        className: correct ? "bg-green-500 text-white dark:text-white" : "",
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

  if (isLoading || !gradeData || !chapterData) { // Check for isLoading too
    return (
      <div className="space-y-6 p-4">
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
  
  const content: ChapterContent = chapterData.content || {};
  const lastUpdatedByTeacher = content.lastUpdated ? new Date(content.lastUpdated).toLocaleDateString() : null;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Button variant="outline" asChild size="sm">
        <Link href="/study-material">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Study Materials
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">{chapterData.name}</CardTitle>
          <CardDescription>
            {gradeData.name} - Sindh Textbook Board Syllabus. App by {APP_AUTHOR}. 
            {lastUpdatedByTeacher && <span className="text-xs text-muted-foreground italic"> (Teacher Edits: {lastUpdatedByTeacher})</span>}
          </CardDescription>
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
                  <CardTitle>Chapter Notes</CardTitle>
                  <CardDescription>
                    {content.pdfName ? `Reference: ${content.pdfName}. ` : "Notes for this chapter will appear here. "}
                    Scroll to view the material.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[4/3] bg-muted rounded-lg flex flex-col items-center justify-center p-4">
                     <Image src="https://placehold.co/800x600.png" alt={`${chapterData.name} Notes Preview`} width={800} height={600} data-ai-hint="document textbook" className="max-w-full max-h-full object-contain"/>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Interactive notes viewer placeholder.
                    </p>
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
                      <div key={mcq.id || `mcq-${index}`} className="p-4 border rounded-md bg-card shadow-sm">
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
                            {mcq.explanation && <p><strong>Explanation:</strong> {mcq.explanation}</p>}
                          </div>
                        )}
                        <div className="mt-3">
                          {!mcqAttempts[mcq.id]?.revealed ? (
                            <Button onClick={() => checkMcqAnswer(mcq)} size="sm" disabled={mcqAttempts[mcq.id]?.selectedOptionIndex === null || mcqAttempts[mcq.id]?.selectedOptionIndex === undefined}>
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
                        <AccordionItem value={`crq-${qa.id || index}`} key={qa.id || `crq-${index}`}>
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
                        <AccordionItem value={`erq-${qa.id || index}`} key={qa.id || `erq-${index}`}>
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
