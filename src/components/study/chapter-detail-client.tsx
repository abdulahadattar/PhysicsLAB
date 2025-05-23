
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, ListChecks, Star, AlertTriangle, CheckCircle, RefreshCw, BookOpen, Notebook, User, WifiOff, DownloadCloud, BookCopy, Landmark, Globe, Link2 } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_AUTHOR } from "@/lib/constants";
import type { StudyGrade, Chapter, ChapterContent, MCQ as MCQType, QuestionAnswer, TeacherChapterOverrides } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const TEACHER_CHAPTER_OVERRIDES_STORAGE_KEY = 'physicsLabTeacherChapterOverrides';
const PDF_CACHE_KEY_PREFIX = 'physicsLabPdfCache_';

type ChapterPdfSourceKey = keyof Pick<ChapterContent,
  'stbbChapterPdfLink' |
  'teacherNotesPdfName' |
  'alternativeChapterPdfLink' |
  'punjabBoardPdfName' |
  'nationalSyllabusPdfName' |
  'ziauddinBoardPdfName'
>;

interface ChapterPdfSourceInfo {
  key: ChapterPdfSourceKey;
  displayName: string;
  icon: React.ElementType;
  link?: string | null;
}

interface ChapterDetailClientProps {
  initialGradeData: StudyGrade;
  initialChapterData: Chapter;
  params: {
    grade: string;
    chapterId: string;
  };
}

interface CachedPdf {
  url: string; // Original GDrive URL
  blobUrl: string; // URL.createObjectURL(blob)
  fileName: string;
  fileSize?: number;
  lastFetched?: string;
}

export default function ChapterDetailClient({ initialGradeData, initialChapterData, params }: ChapterDetailClientProps) {
  const { toast } = useToast();
  const [gradeData, setGradeData] = useState<StudyGrade | null>(initialGradeData);
  const [chapterData, setChapterData] = useState<Chapter | null>(initialChapterData);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isCachingPdf, setIsCachingPdf] = useState(false);

  const [mcqAttempts, setMcqAttempts] = useState<Record<string, { selectedOptionIndex: number | null; isCorrect: boolean | null; revealed: boolean }>>({});

  const [activePdfSourceKey, setActivePdfSourceKey] = useState<ChapterPdfSourceKey | null>(null);
  const [activePdfGLink, setActivePdfGLink] = useState<string | null>(null);
  const [activePdfEmbedUrl, setActivePdfEmbedUrl] = useState<string | null>(null); // For iframe src
  const [currentCachedPdfDetails, setCurrentCachedPdfDetails] = useState<CachedPdf | null>(null);
  const [pdfCacheStatus, setPdfCacheStatus] = useState<'idle' | 'cached' | 'not_cached' | 'error_caching' | 'checking_cache'>('checking_cache');

  const [availableChapterPdfSources, setAvailableChapterPdfSources] = useState<ChapterPdfSourceInfo[]>([]);

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

  const getGoogleDriveEmbedUrl = (gDriveLink: string | null | undefined): string | null => {
    if (!gDriveLink || !gDriveLink.includes('drive.google.com')) return null;
    try {
      const url = new URL(gDriveLink);
      const fileIdMatch = url.pathname.match(/file\/d\/([^/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
      // Handle links that might already be /preview or /view
      if (url.pathname.includes("/preview") || url.pathname.includes("/view")) {
          return gDriveLink; // Assume it's already embeddable
      }
    } catch (e) {
      console.error("Error parsing GDrive link for embed:", e);
    }
    return null;
  };

  const getPdfCacheKey = useCallback((url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/');
      const dIndex = pathSegments.indexOf('d');
      if (dIndex !== -1 && dIndex < pathSegments.length - 1) {
        return `${PDF_CACHE_KEY_PREFIX}${pathSegments[dIndex + 1]}`;
      }
    } catch (e) { /* Invalid URL, fall through */ }
    // Fallback for non-standard GDrive URLs or other URLs
    return `${PDF_CACHE_KEY_PREFIX}${url.slice(-50).replace(/[^a-zA-Z0-9]/g, '')}`;
  }, []);

  const loadCachedPdf = useCallback(async (sourceGLink: string | null): Promise<CachedPdf | null> => {
    if (!sourceGLink) return null;
    const cacheKey = getPdfCacheKey(sourceGLink);
    if (!cacheKey) return null;

    try {
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) {
        const cached: { data: string; type: string; originalUrl: string; fileName: string, fileSize?: number, lastFetched?: string } = JSON.parse(cachedRaw);
        // Validate if the cached PDF is for the correct original URL
        if (cached.originalUrl !== sourceGLink) {
             console.warn("Cache found but for different URL. Invalidating.");
             localStorage.removeItem(cacheKey); return null;
        }
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
      console.error("Error loading or parsing cached PDF:", e);
      localStorage.removeItem(cacheKey); // Corrupted cache, remove it
    }
    return null;
  }, [getPdfCacheKey]);

  const cachePdf = useCallback(async (sourceGLink: string, fileName: string) => {
    if (!isOnline) {
        toast({ title: "Offline", description: "Cannot cache PDF while offline.", variant: "destructive" });
        setPdfCacheStatus('not_cached'); // Or some other error state
        return;
    }
    if (!sourceGLink.startsWith('http')) {
        toast({ title: "Invalid Link", description: "The provided PDF link is not valid for caching.", variant: "destructive" });
        setPdfCacheStatus('error_caching');
        return;
    }
    const cacheKey = getPdfCacheKey(sourceGLink);
    if (!cacheKey) {
        toast({ title: "Caching Error", description: "Could not generate a cache key for this PDF.", variant: "destructive" });
        setPdfCacheStatus('error_caching');
        return;
    }

    setIsCachingPdf(true);
    setPdfCacheStatus('idle'); // Reset status while caching
    toast({ title: "Caching PDF...", description: `Attempting to download ${fileName} for offline viewing. This might take a moment. Note: Standard Google Drive sharing links may not be directly downloadable due to CORS. Direct download links work best.` });

    try {
      // Simulate fetch for GDrive link: In a real app, this needs a backend proxy or specific GDrive API for direct download.
      // For now, we'll assume the link IS a direct download link.
      const response = await fetch(sourceGLink);
      if (!response.ok) throw new Error(`Failed to fetch PDF (status: ${response.status}). Ensure the link is a direct download link, not a viewer page.`);

      const blob = await response.blob();
      if (blob.type !== 'application/pdf') {
        throw new Error("Downloaded file is not a PDF. The link might be to an HTML page or an incorrect file type.");
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(',')[1];
        const itemToCache = {
            data: base64data,
            type: blob.type,
            originalUrl: sourceGLink,
            fileName,
            fileSize: blob.size,
            lastFetched: new Date().toISOString()
        };
        localStorage.setItem(cacheKey, JSON.stringify(itemToCache));
        const blobUrl = URL.createObjectURL(blob);
        setCurrentCachedPdfDetails({ url: sourceGLink, blobUrl, fileName, fileSize: blob.size, lastFetched: itemToCache.lastFetched });
        setActivePdfEmbedUrl(blobUrl); // Switch to cached version immediately
        setPdfCacheStatus('cached');
        toast({ title: "PDF Cached!", description: `${fileName} is now available offline.` });
      };
      reader.onerror = () => { throw new Error("Failed to read PDF blob after download."); };
      reader.readAsDataURL(blob);

    } catch (e: any) {
      console.error("Error caching PDF:", e);
      toast({ title: "PDF Caching Failed", description: e.message || "Could not download or cache the PDF. Check the link and ensure it's a direct download link.", variant: "destructive", duration: 7000 });
      setPdfCacheStatus('error_caching');
    } finally {
      setIsCachingPdf(false);
    }
  }, [isOnline, toast, getPdfCacheKey]);

  const updateDisplayedPdf = useCallback(async (gLink: string | null, sourceName: string) => {
    setActivePdfGLink(gLink);
    if (!gLink) {
      setActivePdfEmbedUrl(null);
      setCurrentCachedPdfDetails(null);
      setPdfCacheStatus('idle');
      return;
    }

    setPdfCacheStatus('checking_cache');
    const loadedCache = await loadCachedPdf(gLink);

    if (loadedCache) {
      setCurrentCachedPdfDetails(loadedCache);
      setActivePdfEmbedUrl(loadedCache.blobUrl);
      setPdfCacheStatus('cached');
      // No toast here for loading from cache, to avoid being too noisy.
    } else {
      setCurrentCachedPdfDetails(null); // Clear previous cache details
      if (isOnline) {
        const embedUrl = getGoogleDriveEmbedUrl(gLink);
        setActivePdfEmbedUrl(embedUrl);
        setPdfCacheStatus(embedUrl ? 'not_cached' : 'error_caching');
        if(!embedUrl) toast({ title: "Online View Issue", description: `Could not generate an embeddable link for ${sourceName}. Try caching if possible.`, variant: "default" });
      } else {
        setActivePdfEmbedUrl(null);
        setPdfCacheStatus('not_cached');
        toast({ title: "Offline", description: `${sourceName} is not cached and cannot be viewed offline.`, variant:"default" });
      }
    }
  }, [loadCachedPdf, isOnline, toast]);

  const loadChapterWithOverrides = useCallback(async () => {
    setIsLoading(true);
    let finalChapterData = { ...initialChapterData };
    try {
      if (typeof window !== 'undefined') {
          const overridesRaw = localStorage.getItem(TEACHER_CHAPTER_OVERRIDES_STORAGE_KEY);
          if (overridesRaw) {
            const allOverrides: TeacherChapterOverrides = JSON.parse(overridesRaw);
            const chapterOverride = allOverrides[finalChapterData.id];
            if (chapterOverride) {
                const mergedContent: ChapterContent = {
                  ...(finalChapterData.content || {}),
                  ...chapterOverride
                };
                finalChapterData.content = mergedContent;
            }
          }
      }
    } catch (e) {
      console.error("Failed to load or parse teacher chapter overrides:", e);
      toast({
        title: "Content Override Error",
        description: "Could not load teacher-modified content. Displaying default material.",
        variant: "destructive"
      })
    }
    setChapterData(finalChapterData);
    setGradeData(initialGradeData);

    const content = finalChapterData.content || {};
    const pdfSourceCandidates: ChapterPdfSourceInfo[] = [
        { key: 'stbbChapterPdfLink', displayName: "STBB Chapter", link: content.stbbChapterPdfLink, icon: BookCopy },
        { key: 'teacherNotesPdfName', displayName: "Teacher's Notes", link: content.teacherNotesPdfName, icon: Notebook },
        { key: 'ziauddinBoardPdfName', displayName: "Ziauddin Board", link: content.ziauddinBoardPdfName, icon: Landmark },
        { key: 'punjabBoardPdfName', displayName: "Punjab Board", link: content.punjabBoardPdfName, icon: BookCopy },
        { key: 'nationalSyllabusPdfName', displayName: "National Syllabus", link: content.nationalSyllabusPdfName, icon: Globe },
        { key: 'alternativeChapterPdfLink', displayName: "Alternative Notes", link: content.alternativeChapterPdfLink, icon: BookOpen },
    ];

    const validSources = pdfSourceCandidates.filter(s => s.link && s.link.trim() !== "");
    setAvailableChapterPdfSources(validSources);

    if (validSources.length > 0) {
        setActivePdfSourceKey(validSources[0].key); // Default to the first available source
        await updateDisplayedPdf(validSources[0].link!, validSources[0].displayName);
    } else {
        setActivePdfSourceKey(null);
        await updateDisplayedPdf(null, "No Source");
    }

    setIsLoading(false);
  }, [initialChapterData, initialGradeData, toast, updateDisplayedPdf]);

  useEffect(() => {
    loadChapterWithOverrides();
  }, [loadChapterWithOverrides]);

  useEffect(() => {
    // If online status changes, re-evaluate the displayed PDF
    if (activePdfGLink && activePdfSourceKey) {
        const sourceInfo = availableChapterPdfSources.find(s => s.key === activePdfSourceKey);
        if (sourceInfo) {
            updateDisplayedPdf(activePdfGLink, sourceInfo.displayName);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);


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
        description: correct ? "Well done!" : `The correct answer was: "${mcq.options[mcq.correctAnswerIndex]}". Check the explanation.`,
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
    if (activePdfGLink && activePdfSourceKey) {
        const sourceInfo = availableChapterPdfSources.find(s => s.key === activePdfSourceKey);
        if (sourceInfo && sourceInfo.link) { // Ensure link is present for the sourceInfo
            cachePdf(sourceInfo.link, sourceInfo.displayName);
        } else {
            toast({ title: "Error", description: "Cannot cache: No valid link for the current source.", variant: "destructive" });
        }
    } else {
        toast({ title: "Error", description: "Cannot cache: No PDF source selected or link is missing.", variant: "destructive" });
    }
  };

  const handleSourceButtonClick = async (source: ChapterPdfSourceInfo) => {
    setActivePdfSourceKey(source.key);
    await updateDisplayedPdf(source.link!, source.displayName);
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

  const currentActiveDisplayName = availableChapterPdfSources.find(s => s.key === activePdfSourceKey)?.displayName || "Chapter Notes";
  const showCacheButton = isOnline && activePdfGLink && (pdfCacheStatus === 'not_cached' || (pdfCacheStatus === 'cached' && currentCachedPdfDetails?.url !== activePdfGLink));

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
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:max-w-lg">
              <TabsTrigger value="notes-keypoints"><FileText className="mr-2 h-4 w-4" />Notes &amp; Key Points</TabsTrigger>
              <TabsTrigger value="chapter-exercise"><ListChecks className="mr-2 h-4 w-4" />Chapter Exercise</TabsTrigger>
            </TabsList>

            <TabsContent value="notes-keypoints" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <CardTitle>{currentActiveDisplayName}</CardTitle>
                    {showCacheButton && (
                       <Button onClick={handleForceCacheActivePdf} size="sm" variant="outline" disabled={isCachingPdf}>
                         {isCachingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <DownloadCloud className="mr-2 h-4 w-4"/>}
                         Cache for Offline
                       </Button>
                    )}
                  </div>
                   {availableChapterPdfSources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 border-b pb-2 mb-2">
                        <Label className="text-sm font-medium mr-2 self-center">View Source:</Label>
                        {availableChapterPdfSources.map(src => (
                            <Button
                                key={src.key}
                                variant={activePdfSourceKey === src.key ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleSourceButtonClick(src)}
                                className="text-xs"
                                disabled={isCachingPdf}
                            >
                                <src.icon className="mr-1 h-3 w-3" />
                                {src.displayName}
                            </Button>
                        ))}
                    </div>
                   )}
                  <CardDescription>
                    Viewing: {currentActiveDisplayName}.
                    {pdfCacheStatus === 'cached' && currentCachedPdfDetails && (
                        <span className="text-xs text-green-600 dark:text-green-400 block">
                            (Available Offline. Cached: {currentCachedPdfDetails.lastFetched ? new Date(currentCachedPdfDetails.lastFetched).toLocaleDateString() : 'N/A'},
                            Size: {currentCachedPdfDetails.fileSize ? (currentCachedPdfDetails.fileSize / (1024*1024)).toFixed(2) + 'MB' : 'N/A'})
                        </span>
                    )}
                    {pdfCacheStatus === 'not_cached' && isOnline && <span className="text-xs text-blue-600 dark:text-blue-400 block">(Online View)</span>}
                    {pdfCacheStatus === 'not_cached' && !isOnline && <span className="text-xs text-orange-600 dark:text-orange-400 block">(Offline, not cached)</span>}
                    {pdfCacheStatus === 'error_caching' && <span className="text-xs text-red-600 dark:text-red-400 block">(Error displaying or caching)</span>}
                    {pdfCacheStatus === 'checking_cache' && <span className="text-xs text-muted-foreground block">(Checking cache...)</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isOnline && !activePdfEmbedUrl && pdfCacheStatus !== 'checking_cache' && (
                    <Alert variant="destructive">
                        <WifiOff className="h-4 w-4" />
                        <AlertTitle>You are Offline</AlertTitle>
                        <AlertDescription>This document is not cached for offline viewing. Please connect to the internet to view or cache it.</AlertDescription>
                    </Alert>
                  )}
                  {isOnline && !activePdfEmbedUrl && activePdfGLink && pdfCacheStatus === 'not_cached' && (
                     <Alert variant="default">
                        <Link2 className="h-4 w-4" />
                        <AlertTitle>Online Document Viewer</AlertTitle>
                        <AlertDescription>
                            Attempting to load document. If it doesn't appear, the Google Drive link might be invalid, require specific sharing permissions, or not be directly embeddable.
                            You can try caching it for offline use.
                        </AlertDescription>
                    </Alert>
                  )}
                  {activePdfEmbedUrl && (
                    <iframe
                        key={activePdfEmbedUrl} // Force re-render if blob URL changes
                        src={activePdfEmbedUrl}
                        className="w-full h-[70vh] min-h-[500px] md:min-h-[700px] border rounded-md bg-muted"
                        title={`${currentActiveDisplayName} Document`}
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Standard sandbox for GDrive embeds
                    ></iframe>
                  )}
                  {!activePdfGLink && pdfCacheStatus !== 'checking_cache' && (
                    <div className="aspect-[4/3] bg-muted rounded-lg flex flex-col items-center justify-center p-4 text-center min-h-[300px]">
                        <FileText className="h-16 w-16 text-muted-foreground mb-2"/>
                        <p className="text-sm text-muted-foreground">No document source selected or available for this chapter.</p>
                        <p className="text-xs text-muted-foreground mt-1">The teacher can add PDF links via the Content Management panel.</p>
                    </div>
                  )}
                   {pdfCacheStatus === 'checking_cache' && (
                     <div className="min-h-[300px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                   )}
                   <Alert variant="default" className="mt-4 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
                        <AlertTriangle className="h-4 w-4 !text-blue-600 dark:!text-blue-400"/>
                        <AlertTitle className="text-blue-700 dark:text-blue-300">Important Note on PDF Caching</AlertTitle>
                        <AlertDescription className="text-blue-600 dark:text-blue-400 text-xs">
                            Directly caching PDFs from standard Google Drive "sharing" links in the browser can be unreliable due to Google's security and CORS policies.
                            For best offline results, teachers should ideally provide <strong className="font-semibold">direct download links</strong> to the PDF files.
                            Using `localStorage` for large PDFs is also not ideal for performance and has size limits (typically 5-10MB). A future version might use IndexedDB for more robust storage.
                        </AlertDescription>
                    </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-400"/>Key Points &amp; Summary</CardTitle>
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
