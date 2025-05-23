
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, ListChecks, Star, AlertTriangle, CheckCircle, RefreshCw, BookOpen, Notebook, User, WifiOff, DownloadCloud } from "lucide-react"; // Added WifiOff, DownloadCloud
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Removed Image from 'next/image' as we are using iframe or placeholder text
import { APP_AUTHOR } from "@/lib/constants";
import type { StudyGrade, Chapter, ChapterContent, MCQ as MCQType, QuestionAnswer, TeacherChapterOverrides } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const TEACHER_OVERRIDES_STORAGE_KEY = 'physicsLabTeacherChapterOverrides';
const PDF_CACHE_KEY_PREFIX = 'physicsLabPdfCache_';

type PdfSourceType = 'sindh' | 'alternative' | 'teacher';

interface ChapterDetailClientProps {
  initialGradeData: StudyGrade;
  initialChapterData: Chapter;
  params: {
    grade: string;
    chapterId: string;
  };
}

interface CachedPdf {
  url: string;
  blobUrl: string; // Object URL for the cached blob
  fileName: string;
  fileSize?: number; // Optional: store file size for update checks
  lastFetched?: string; // Optional: store last fetched date for update checks
}

export default function ChapterDetailClient({ initialGradeData, initialChapterData, params }: ChapterDetailClientProps) {
  const { toast } = useToast();
  const [gradeData, setGradeData] = useState<StudyGrade | null>(initialGradeData);
  const [chapterData, setChapterData] = useState<Chapter | null>(initialChapterData);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true); // For online status
  const [isCachingPdf, setIsCachingPdf] = useState(false); // For PDF caching activity

  const [mcqAttempts, setMcqAttempts] = useState<Record<string, { selectedOptionIndex: number | null; isCorrect: boolean | null; revealed: boolean }>>({});
  
  const [activePdfSource, setActivePdfSource] = useState<PdfSourceType | null>(null);
  const [activePdfLink, setActivePdfLink] = useState<string | null>(null); // Direct Google Drive Link
  const [activePdfDisplayUrl, setActivePdfDisplayUrl] = useState<string | null>(null); // Could be Object URL or Google Drive Embed Link
  const [cachedPdfInfo, setCachedPdfInfo] = useState<CachedPdf | null>(null);


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

  const getPdfCacheKey = (url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      // Try to extract a file ID from common Google Drive link patterns
      const pathSegments = urlObj.pathname.split('/');
      const dIndex = pathSegments.indexOf('d');
      if (dIndex !== -1 && dIndex < pathSegments.length - 1) {
        return `${PDF_CACHE_KEY_PREFIX}${pathSegments[dIndex + 1]}`;
      }
    } catch (e) { /* Invalid URL, fall through */ }
    // Fallback for non-standard URLs, use a hash or the full URL (might be too long for localStorage key)
    // For simplicity, just use the prefix and a truncated/hashed URL if it's not a recognizable GDrive link
    return `${PDF_CACHE_KEY_PREFIX}${url.slice(-50).replace(/[^a-zA-Z0-9]/g, '')}`;
  };
  
  const loadCachedPdf = useCallback(async (sourceLink: string | null): Promise<CachedPdf | null> => {
    if (!sourceLink) return null;
    const cacheKey = getPdfCacheKey(sourceLink);
    if (!cacheKey) return null;

    try {
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) {
        const cached: { data: string; type: string; originalUrl: string; fileName: string, fileSize?: number, lastFetched?: string } = JSON.parse(cachedRaw);
        // Convert base64 back to blob
        const byteCharacters = atob(cached.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: cached.type });
        const blobUrl = URL.createObjectURL(blob);
        return { url: cached.originalUrl, blobUrl, fileName: cached.fileName, fileSize: cached.fileSize, lastFetched: cached.lastFetched };
      }
    } catch (e) {
      console.error("Error loading cached PDF:", e);
      localStorage.removeItem(cacheKey); // Clear corrupted cache
    }
    return null;
  }, []);

  const cachePdf = useCallback(async (sourceLink: string, fileName: string) => {
    if (!isOnline || !sourceLink.startsWith('http')) { // Basic check for valid link
        toast({ title: "Cannot Cache PDF", description: "Offline or invalid PDF link provided.", variant: "destructive" });
        return;
    }
    const cacheKey = getPdfCacheKey(sourceLink);
    if (!cacheKey) {
        toast({ title: "Cannot Cache PDF", description: "Could not generate a key for this PDF link.", variant: "destructive" });
        return;
    }

    setIsCachingPdf(true);
    toast({ title: "Caching PDF...", description: `Downloading ${fileName} for offline viewing.` });

    try {
      // IMPORTANT: Direct fetching from Google Drive links can be blocked by CORS.
      // This fetch will likely fail for most Google Drive links unless they are specifically set up for direct download
      // and allow CORS. A backend proxy would be needed for robust fetching.
      // For this simulation, we'll assume a direct-downloadable, CORS-friendly link or a placeholder that works.
      const response = await fetch(sourceLink); 
      if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      
      const blob = await response.blob();
      if (blob.type !== 'application/pdf') {
        throw new Error("Downloaded file is not a PDF.");
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(',')[1]; // Get base64 part
        const itemToCache = { 
            data: base64data, 
            type: blob.type, 
            originalUrl: sourceLink, 
            fileName,
            fileSize: blob.size,
            lastFetched: new Date().toISOString()
        };
        localStorage.setItem(cacheKey, JSON.stringify(itemToCache));
        const blobUrl = URL.createObjectURL(blob);
        setCachedPdfInfo({ url: sourceLink, blobUrl, fileName, fileSize: blob.size, lastFetched: itemToCache.lastFetched });
        setActivePdfDisplayUrl(blobUrl); // Display the cached version
        toast({ title: "PDF Cached!", description: `${fileName} is now available offline.` });
      };
      reader.onerror = () => { throw new Error("Failed to read PDF blob."); };
      reader.readAsDataURL(blob);

    } catch (e) {
      console.error("Error caching PDF:", e);
      toast({ title: "PDF Caching Failed", description: e instanceof Error ? e.message : "Could not download or cache the PDF.", variant: "destructive" });
    } finally {
      setIsCachingPdf(false);
    }
  }, [isOnline, toast]);


  const loadChapterWithOverrides = useCallback(async () => {
    setIsLoading(true);
    let finalChapterData = { ...initialChapterData };
    try {
      if (typeof window !== 'undefined') {
          const overridesRaw = localStorage.getItem(TEACHER_OVERRIDES_STORAGE_KEY);
          if (overridesRaw) {
            const allOverrides: TeacherChapterOverrides = JSON.parse(overridesRaw);
            const chapterOverride = allOverrides[finalChapterData.id];
            if (chapterOverride) {
                const mergedContent: ChapterContent = { // Ensure ChapterContent type
                  ...(finalChapterData.content || {}),
                  ...chapterOverride,
                  sindhTextbookPdfName: chapterOverride.sindhTextbookPdfName || finalChapterData.content?.sindhTextbookPdfName,
                  alternativeTextbookPdfName: chapterOverride.alternativeTextbookPdfName || finalChapterData.content?.alternativeTextbookPdfName,
                  teacherNotesPdfName: chapterOverride.teacherNotesPdfName || finalChapterData.content?.teacherNotesPdfName,
                  keyPoints: chapterOverride.keyPoints || finalChapterData.content?.keyPoints,
                  mcqs: chapterOverride.mcqs || finalChapterData.content?.mcqs || [],
                  shortAnswers: chapterOverride.shortAnswers || finalChapterData.content?.shortAnswers || [],
                  longAnswers: chapterOverride.longAnswers || finalChapterData.content?.longAnswers || [],
                  lastUpdated: chapterOverride.lastUpdated
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
    setGradeData(initialGradeData); 

    // Determine initial PDF to show and attempt to load from cache
    const content = finalChapterData.content || {};
    let initialSource: PdfSourceType | null = null;
    let initialLink: string | null = null;
    let initialFileName: string | null = null;

    if (content.sindhTextbookPdfName) {
        initialSource = 'sindh';
        initialLink = content.sindhTextbookPdfName;
        initialFileName = "Sindh Textbook";
    } else if (content.alternativeTextbookPdfName) {
        initialSource = 'alternative';
        initialLink = content.alternativeTextbookPdfName;
        initialFileName = "Alternative Textbook";
    } else if (content.teacherNotesPdfName) {
        initialSource = 'teacher';
        initialLink = content.teacherNotesPdfName;
        initialFileName = "Teacher's Notes";
    }
    
    setActivePdfSource(initialSource);
    setActivePdfLink(initialLink);

    if (initialLink && initialFileName) {
        const loadedCache = await loadCachedPdf(initialLink);
        if (loadedCache) {
            setCachedPdfInfo(loadedCache);
            setActivePdfDisplayUrl(loadedCache.blobUrl);
            toast({ title: "Loaded Cached PDF", description: `Displaying offline version of ${loadedCache.fileName}.`});
        } else if (isOnline) {
            // If not cached, and online, use a Google Drive embed link if it's a GDrive URL
            // This is a simplified embed. Robust embedding might need `uc?export=embed&id=FILE_ID`
             if (initialLink.includes('drive.google.com')) {
                const fileIdMatch = initialLink.match(/[\w-]{25,}/); // Common GDrive file ID pattern
                if (fileIdMatch) {
                    setActivePdfDisplayUrl(`https://drive.google.com/file/d/${fileIdMatch[0]}/preview`);
                } else {
                    setActivePdfDisplayUrl(null); // Or a direct link if it's not a GDrive one
                     // toast({ title: "Note", description: "Could not form embed link. PDF might not display correctly.", variant: "default"});
                }
            } else {
                 setActivePdfDisplayUrl(null); // Not a GDrive link, can't embed this way
            }
        } else {
            setActivePdfDisplayUrl(null); // Offline and not cached
        }
    } else {
        setActivePdfDisplayUrl(null);
        setCachedPdfInfo(null);
    }

    setIsLoading(false);
  }, [initialChapterData, initialGradeData, toast, loadCachedPdf, isOnline]);

  useEffect(() => {
    loadChapterWithOverrides();
  }, [loadChapterWithOverrides]);

  const handlePdfSourceChange = async (source: PdfSourceType, link: string | null | undefined, fileName: string) => {
    if (!link) {
        setActivePdfSource(source);
        setActivePdfLink(null);
        setActivePdfDisplayUrl(null);
        setCachedPdfInfo(null);
        return;
    }
    setActivePdfSource(source);
    setActivePdfLink(link);
    
    const loadedCache = await loadCachedPdf(link);
    if (loadedCache) {
        setCachedPdfInfo(loadedCache);
        setActivePdfDisplayUrl(loadedCache.blobUrl);
        toast({ title: "Loaded Cached PDF", description: `Displaying offline version of ${fileName}.`});
    } else if (isOnline) {
        if (link.includes('drive.google.com')) {
            const fileIdMatch = link.match(/[\w-]{25,}/);
            if (fileIdMatch) {
                setActivePdfDisplayUrl(`https://drive.google.com/file/d/${fileIdMatch[0]}/preview`);
            } else {
                setActivePdfDisplayUrl(null);
                // toast({ title: "Note", description: "Could not form embed link for new selection.", variant: "default"});
            }
        } else {
            setActivePdfDisplayUrl(null);
        }
        setCachedPdfInfo(null); // Clear old cache info if viewing online link
    } else {
        setActivePdfDisplayUrl(null); // Offline and not cached for this new source
        setCachedPdfInfo(null);
        toast({ title: "Offline", description: `${fileName} is not available offline. Connect to view or cache it.`, variant:"default" });
    }
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

  const handleForceCacheActivePdf = () => {
    if (activePdfLink && chapterData?.content) {
        let fileName = "Selected PDF";
        if (activePdfSource === 'sindh' && chapterData.content.sindhTextbookPdfName) fileName = "Sindh Textbook";
        else if (activePdfSource === 'alternative' && chapterData.content.alternativeTextbookPdfName) fileName = "Alternative Textbook";
        else if (activePdfSource === 'teacher' && chapterData.content.teacherNotesPdfName) fileName = "Teacher's Notes";
        cachePdf(activePdfLink, fileName);
    }
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

  const availablePdfSources: { type: PdfSourceType, name: string, link?: string, icon: React.ElementType }[] = [];
  if (content.sindhTextbookPdfName) availablePdfSources.push({ type: 'sindh', name: "Sindh Textbook", link: content.sindhTextbookPdfName, icon: BookOpen });
  if (content.alternativeTextbookPdfName) availablePdfSources.push({ type: 'alternative', name: "Alternative Book", link: content.alternativeTextbookPdfName, icon: BookOpen });
  if (content.teacherNotesPdfName) availablePdfSources.push({ type: 'teacher', name: "Teacher's Notes", link: content.teacherNotesPdfName, icon: Notebook });

  const currentActiveFileName = 
    activePdfSource === 'sindh' ? "Sindh Textbook" :
    activePdfSource === 'alternative' ? "Alternative Textbook" :
    activePdfSource === 'teacher' ? "Teacher's Notes" : 
    "Chapter Notes";


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
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <CardTitle>{currentActiveFileName}</CardTitle>
                    {isOnline && activePdfLink && (!cachedPdfInfo || cachedPdfInfo.url !== activePdfLink) && (
                       <Button onClick={handleForceCacheActivePdf} size="sm" variant="outline" disabled={isCachingPdf}>
                         {isCachingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <DownloadCloud className="mr-2 h-4 w-4"/>}
                         Cache for Offline
                       </Button>
                    )}
                  </div>
                   {availablePdfSources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 border-b pb-2 mb-2">
                        <Label className="text-sm font-medium mr-2 self-center">View Source:</Label>
                        {availablePdfSources.map(src => (
                            <Button 
                                key={src.type} 
                                variant={activePdfSource === src.type ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePdfSourceChange(src.type, src.link, src.name)}
                                className="text-xs"
                                disabled={isCachingPdf}
                            >
                                <src.icon className="mr-1 h-3 w-3" />
                                {src.name}
                            </Button>
                        ))}
                    </div>
                   )}
                  <CardDescription>
                    {activePdfDisplayUrl ? `Displaying: ${currentActiveFileName}. ` : "No document selected or available. "}
                    Scroll to view the material.
                    {cachedPdfInfo && activePdfLink === cachedPdfInfo.url && <span className="text-xs text-green-600 dark:text-green-400 block">(Available Offline)</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isOnline && !activePdfDisplayUrl && (
                    <Alert variant="destructive">
                        <WifiOff className="h-4 w-4" />
                        <AlertTitle>You are Offline</AlertTitle>
                        <AlertDescription>This document is not cached for offline viewing. Please connect to the internet to view or cache it.</AlertDescription>
                    </Alert>
                  )}
                  {isOnline && !activePdfDisplayUrl && activePdfLink && (
                     <Alert variant="default">
                        <AlertDescription>Attempting to load document. If it doesn't appear, the link might be invalid or requires specific permissions. You can try caching it for offline use.</AlertDescription>
                    </Alert>
                  )}
                  {activePdfDisplayUrl ? (
                    <iframe 
                        src={activePdfDisplayUrl} 
                        className="w-full h-[600px] md:h-[800px] border rounded-md bg-muted" 
                        title={`${currentActiveFileName} Document`}
                        // sandbox="allow-scripts allow-same-origin" // Consider sandbox attributes for security if GDrive links are direct
                    ></iframe>
                  ) : !activePdfLink && (
                    <div className="aspect-[4/3] bg-muted rounded-lg flex flex-col items-center justify-center p-4 text-center">
                        <FileText className="h-16 w-16 text-muted-foreground mb-2"/>
                        <p className="text-sm text-muted-foreground">No document source selected or available for this chapter.</p>
                        <p className="text-xs text-muted-foreground mt-1">Teacher can add Google Drive PDF links via Content Management.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-400"/>Key Points & Summary</CardTitle>
                  <CardDescription>Quickly review the most important concepts, definitions, and formulas from this chapter. {lastUpdatedByTeacher && "(Teacher Edited)"}</CardDescription>
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
              <p className="text-sm text-muted-foreground">All exercises are based on the syllabus. {lastUpdatedByTeacher && "(Teacher Edited)"}</p>
              
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
