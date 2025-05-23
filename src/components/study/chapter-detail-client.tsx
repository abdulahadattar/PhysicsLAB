
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, ListChecks, Star, AlertTriangle, CheckCircle, RefreshCw, BookOpen, Notebook, User } from "lucide-react";
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

type PdfSourceType = 'sindh' | 'alternative' | 'teacher';

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
  const [isLoading, setIsLoading] = useState(false);
  
  const [mcqAttempts, setMcqAttempts] = useState<Record<string, { selectedOptionIndex: number | null; isCorrect: boolean | null; revealed: boolean }>>({});
  const [currentPdfSource, setCurrentPdfSource] = useState<PdfSourceType | null>(null);
  const [currentPdfFileName, setCurrentPdfFileName] = useState<string | null>(null);


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
                const mergedContent = {
                  ...(finalChapterData.content || {}), // Ensure base content exists
                  ...chapterOverride,
                  mcqs: chapterOverride.mcqs || finalChapterData.content?.mcqs || [],
                  shortAnswers: chapterOverride.shortAnswers || finalChapterData.content?.shortAnswers || [],
                  longAnswers: chapterOverride.longAnswers || finalChapterData.content?.longAnswers || [],
                };
                finalChapterData.content = mergedContent as ChapterContent;
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
    setGradeData(initialGradeData); 

    // Determine initial PDF to show
    const content = finalChapterData.content || {};
    if (content.sindhTextbookPdfName) {
        setCurrentPdfSource('sindh');
        setCurrentPdfFileName(content.sindhTextbookPdfName);
    } else if (content.alternativeTextbookPdfName) {
        setCurrentPdfSource('alternative');
        setCurrentPdfFileName(content.alternativeTextbookPdfName);
    } else if (content.teacherNotesPdfName) {
        setCurrentPdfSource('teacher');
        setCurrentPdfFileName(content.teacherNotesPdfName);
    } else {
        setCurrentPdfSource(null);
        setCurrentPdfFileName(null);
    }

    setIsLoading(false);
  }, [initialChapterData, initialGradeData, toast]);

  useEffect(() => {
    loadChapterWithOverrides();
  }, [loadChapterWithOverrides]);

  const handlePdfSourceChange = (source: PdfSourceType) => {
    setCurrentPdfSource(source);
    const content = chapterData?.content || {};
    if (source === 'sindh') setCurrentPdfFileName(content.sindhTextbookPdfName || null);
    else if (source === 'alternative') setCurrentPdfFileName(content.alternativeTextbookPdfName || null);
    else if (source === 'teacher') setCurrentPdfFileName(content.teacherNotesPdfName || null);
  };


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

  if (isLoading || !gradeData || !chapterData) { 
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

  const availablePdfSources: { type: PdfSourceType, name: string, fileName?: string, icon: React.ElementType }[] = [];
  if (content.sindhTextbookPdfName) availablePdfSources.push({ type: 'sindh', name: "Sindh Textbook", fileName: content.sindhTextbookPdfName, icon: BookOpen });
  if (content.alternativeTextbookPdfName) availablePdfSources.push({ type: 'alternative', name: "Alternative Book", fileName: content.alternativeTextbookPdfName, icon: BookOpen });
  if (content.teacherNotesPdfName) availablePdfSources.push({ type: 'teacher', name: "Teacher's Notes", fileName: content.teacherNotesPdfName, icon: Notebook });


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
                   {availablePdfSources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 border-b pb-2 mb-2">
                        <Label className="text-sm font-medium mr-2 self-center">View Source:</Label>
                        {availablePdfSources.map(src => (
                            <Button 
                                key={src.type} 
                                variant={currentPdfSource === src.type ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePdfSourceChange(src.type)}
                                className="text-xs"
                            >
                                <src.icon className="mr-1 h-3 w-3" />
                                {src.name}
                            </Button>
                        ))}
                    </div>
                   )}
                  <CardDescription>
                    {currentPdfFileName ? `Displaying: ${currentPdfFileName}. ` : "No PDF selected or available. "}
                    Scroll to view the material.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentPdfFileName ? (
                    <div className="aspect-[4/3] bg-muted rounded-lg flex flex-col items-center justify-center p-4">
                        <Image src="https://placehold.co/800x600.png" alt={`${currentPdfFileName} Preview`} width={800} height={600} data-ai-hint="document textbook" className="max-w-full max-h-full object-contain"/>
                        <p className="mt-4 text-sm text-muted-foreground">
                        Interactive notes viewer placeholder for: {currentPdfFileName}
                        </p>
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-muted rounded-lg flex flex-col items-center justify-center p-4">
                        <FileText className="h-16 w-16 text-muted-foreground mb-2"/>
                        <p className="text-sm text-muted-foreground">No PDF content to display for this selection.</p>
                        <p className="text-xs text-muted-foreground mt-1">Teacher can upload PDFs via Content Management.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-400"/>Key Points & Summary</CardTitle>
                  <CardDescription>Quickly review the most important concepts, definitions, and formulas from this chapter. (Generated by AI, approved by teacher)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded-md bg-secondary/30 min-h-[200px] space-y-4 whitespace-pre-wrap">
                    {content.keyPoints ? (
                      <p className="text-sm">{content.keyPoints}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No key points available for this chapter yet. Teacher can add or generate these via the Content Management panel.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chapter-exercise" className="mt-4 space-y-6">
              <p className="text-sm text-muted-foreground">All exercises are based on the syllabus. (Content generated by AI, approved by teacher)</p>
              
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
