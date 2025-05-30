"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, ListChecks, Star, AlertTriangle, CheckCircle, RefreshCw, BookOpen, Notebook, User, WifiOff, DownloadCloud, BookCopy, Landmark, Globe, Link2, Loader2, Trash2, Calculator, Globe2, Image as ImageIcon, Info } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { APP_AUTHOR } from "@/lib/constants";
import type { StudyGrade, Chapter, ChapterContent, MCQ as MCQType, QuestionAnswer, TeacherChapterOverrides } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase'; // Import Firestore DB instance
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Latex from 'react-latex-next';

const TEACHER_CHAPTER_OVERRIDES_STORAGE_KEY = 'physicsLabTeacherChapterOverrides';
const PDF_DB_NAME = 'PhysicsLabPDFCache';
const PDF_STORE_NAME = 'pdfStore';

type ChapterPdfSourceKey = keyof Pick<ChapterContent,
  'stbbChapterPdfLink' | 'teacherNotesPdfName' | 'alternativeChapterPdfLink' | 'punjabBoardPdfName' | 'nationalSyllabusPdfName' | 'ziauddinBoardPdfName'>;
interface ChapterPdfSourceInfo {
  key: ChapterPdfSourceKey;
  displayName: string;
  icon: React.ElementType;
  link?: string | null;
}

interface ChapterDetailClientProps {
  initialGradeData: StudyGrade; // Still useful for grade name/context
  initialChapterData: Chapter; // Still useful for chapter name/initial structure
  params: {
    grade: string;
    chapterId: string;
  };
}

interface CachedPdfData {
  url: string; // Original GDrive URL
  blob: Blob;
  fileName: string;
  fileSize?: number;
  lastFetched?: string;
}

// --- IndexedDB Helper Functions ---
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PDF_DB_NAME, 1);
    request.onerror = () => reject("Error opening IndexedDB: " + request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PDF_STORE_NAME)) {
        db.createObjectStore(PDF_STORE_NAME, { keyPath: 'url' });
      }
    };
  });
};

const storePdfInDB = async (url: string, blob: Blob, fileName: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PDF_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(PDF_STORE_NAME);
    const pdfData: CachedPdfData = {
      url,
      blob,
      fileName,
      fileSize: blob.size,
      lastFetched: new Date().toISOString(),
    };
    const request = store.put(pdfData);
    request.onerror = () => reject("Error storing PDF in IndexedDB: " + request.error);
    request.onsuccess = () => resolve();
    transaction.oncomplete = () => db.close();
  });
};

const getPdfFromDB = async (url: string): Promise<CachedPdfData | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PDF_STORE_NAME, 'readonly');
    const store = transaction.objectStore(PDF_STORE_NAME);
    const request = store.get(url);
    request.onerror = () => reject("Error fetching PDF from IndexedDB: " + request.error);
    request.onsuccess = () => resolve(request.result || null);
    transaction.oncomplete = () => db.close();
  });
};

const deletePdfFromDB = async (url: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PDF_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(PDF_STORE_NAME);
    const request = store.delete(url);
    request.onerror = () => reject("Error deleting PDF from IndexedDB: " + request.error);
    request.onsuccess = () => resolve();
    transaction.oncomplete = () => db.close();
  });
};
// --- End IndexedDB Helper Functions ---

export default function ChapterDetailClient({ initialGradeData, initialChapterData, params }: ChapterDetailClientProps) {
  const { toast } = useToast();
  const [gradeData, setGradeData] = useState<StudyGrade | null>(initialGradeData);
  const [chapterContent, setChapterContent] = useState<ChapterContent | null>(null); // Full fetched content
  const [isLoading, setIsLoading] = useState(false); // For initial chapter data merge
  const [isLoadingPdf, setIsLoadingPdf] = useState(false); // Specifically for PDF loading/caching operations

  const [isOnline, setIsOnline] = useState(true);
  const [isCachingPdf, setIsCachingPdf] = useState(false);

  const [mcqAttempts, setMcqAttempts] = useState<Record<string, { selectedOptionIndex: number | null; isCorrect: boolean | null; revealed: boolean }>>({});

  const [activePdfSourceKey, setActivePdfSourceKey] = useState<ChapterPdfSourceKey | null>(null);
  const [activePdfGLink, setActivePdfGLink] = useState<string | null>(null); // Original Google Drive link
  const [activePdfEmbedUrl, setActivePdfEmbedUrl] = useState<string | null>(null); // URL for iframe (embed or blob)
  const [currentCachedPdfDetails, setCurrentCachedPdfDetails] = useState<CachedPdfData | null>(null);
  const [pdfCacheStatus, setPdfCacheStatus] = useState<'idle' | 'cached' | 'not_cached' | 'error_caching' | 'checking_cache' | 'caching_in_progress'>('checking_cache');

  // Track cache status for each PDF source
  const [pdfResourceStates, setPdfResourceStates] = useState<Record<string, 'idle' | 'cached' | 'not_cached' | 'error_caching' | 'checking_cache' | 'caching_in_progress'>>({});

  const [availableChapterPdfSources, setAvailableChapterPdfSources] = useState<ChapterPdfSourceInfo[]>([]);

  const pdfSourceConfig: Omit<ChapterPdfSourceInfo, 'link'>[] = useMemo(() => [
    { key: 'stbbChapterPdfLink', displayName: "STBB Chapter", icon: BookCopy },
    { key: 'teacherNotesPdfName', displayName: "Teacher's Notes", icon: Notebook },
    { key: 'ziauddinBoardPdfName', displayName: "Ziauddin Board", icon: Landmark },
    { key: 'punjabBoardPdfName', displayName: "Punjab Board", icon: BookCopy },
    { key: 'nationalSyllabusPdfName', displayName: "National Syllabus", icon: Globe },
    { key: 'alternativeChapterPdfLink', displayName: "Alternative Notes", icon: BookOpen },
  ], []);

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

  const getGoogleDriveEmbedUrl = useCallback((gDriveLink: string | null | undefined): string | null => {
    if (!gDriveLink || !gDriveLink.includes('drive.google.com')) return null;
    try {
      const url = new URL(gDriveLink);
      if (url.pathname.includes("/preview") || url.pathname.includes("/view")) return gDriveLink; // Already embeddable
      const fileIdMatch = url.pathname.match(/file\/d\/([^/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
    } catch (e) { console.error("Error parsing GDrive link for embed:", e); }
    return null;
  }, []);


  const attemptToCachePdf = useCallback(async (sourceGLink: string, fileName: string) => {
    if (!isOnline) {
      toast({ title: "Offline", description: "Cannot cache PDF while offline.", variant: "destructive" });
      return;
    }
    if (!sourceGLink.startsWith('http')) {
      toast({ title: "Invalid Link", description: "The provided PDF link is not valid for caching.", variant: "destructive" });
      return;
    }
    setIsCachingPdf(true);
    setPdfCacheStatus('caching_in_progress');
    toast({ title: "Caching PDF...", description: `Attempting to download ${fileName} for offline viewing. This might take a moment. Note: Standard Google Drive sharing links may not be directly downloadable due to CORS. Direct download links work best.` });

    try {
      const response = await fetch(sourceGLink); // This is the tricky part for GDrive direct links
      if (!response.ok) throw new Error(`Failed to fetch PDF (status: ${response.status}). Ensure the link is a direct download link, not a viewer page.`);
      const blob = await response.blob();
      if (blob.type !== 'application/pdf') {
        throw new Error("Downloaded file is not a PDF. The link might be to an HTML page or an incorrect file type.");
      }
      await storePdfInDB(sourceGLink, blob, fileName);
      const blobUrl = URL.createObjectURL(blob);
      setCurrentCachedPdfDetails({ url: sourceGLink, blob, fileName, fileSize: blob.size, lastFetched: new Date().toISOString() });
      setActivePdfEmbedUrl(blobUrl);
      setPdfCacheStatus('cached');
      toast({ title: "PDF Cached!", description: `${fileName} is now available offline.` });
    } catch (e: any) {
      console.error("Error caching PDF:", e);
      toast({ title: "PDF Caching Failed", description: e.message || "Could not download or cache the PDF. Check the link and ensure it's a direct download link.", variant: "destructive", duration: 7000 });
      setPdfCacheStatus('error_caching');
    } finally {
      setIsCachingPdf(false);
    }
  }, [isOnline, toast]);

  const updateDisplayedPdf = useCallback(async (gLink: string | null, sourceName: string) => {
    setActivePdfGLink(gLink);
    if (!gLink) {
      setActivePdfEmbedUrl(null);
      setCurrentCachedPdfDetails(null);
      setPdfCacheStatus('idle');
      setIsLoadingPdf(false);
      return;
    }

    setIsLoadingPdf(true);
    setPdfCacheStatus('checking_cache');
    const cachedData = await getPdfFromDB(gLink);

    if (cachedData) {
      const blobUrl = URL.createObjectURL(cachedData.blob);
      setCurrentCachedPdfDetails(cachedData);
      setActivePdfEmbedUrl(blobUrl);
      setPdfCacheStatus('cached');
    } else {
      setCurrentCachedPdfDetails(null);
      if (isOnline) {
        const embedUrl = getGoogleDriveEmbedUrl(gLink);
        setActivePdfEmbedUrl(embedUrl);
        setPdfCacheStatus(embedUrl ? 'not_cached' : 'error_caching');
        if (!embedUrl) {
          toast({ title: "Online View Issue", description: `Could not generate an embeddable link for ${sourceName}.`, variant: "default" });
        } else {
          // Attempt to cache in the background if not already cached
          attemptToCachePdf(gLink, sourceName);
        }
      } else {
        setActivePdfEmbedUrl(null);
        setPdfCacheStatus('not_cached');
        toast({ title: "Offline", description: `${sourceName} is not cached and cannot be viewed offline.`, variant:"default" });
      }
    }
    setIsLoadingPdf(false);
  }, [isOnline, toast, getGoogleDriveEmbedUrl, attemptToCachePdf]);

  const loadChapterWithOverrides = useCallback(async () => {
    if (!db) {
        console.error("Firestore DB is not initialized.");
        // Handle this case gracefully, maybe show a warning or error message to the user.
        // You might want to load initial data from props as a fallback here if possible,
        // but the prompt asks to fetch from Firestore.
         toast({
            title: "Database Error",
            description: "Physics content database is not available.",
            variant: "destructive"
        });
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    let fetchedContent: ChapterContent | null = null;
    let fetchedGrade: StudyGrade | null = null;

    try {
      // Fetch chapter content from Firestore
      const chapterDocRef = doc(db, `studyMaterials/${params.grade}/chapters/${params.chapterId}`);
      const chapterDocSnap = await getDoc(chapterDocRef);

      if (chapterDocSnap.exists()) {
        fetchedContent = chapterDocSnap.data() as ChapterContent;
      } else {
         toast({ title: "Content Not Found", description: "Chapter details could not be loaded.", variant: "destructive" });
      }

      // Fetch grade data (for name context)
      const gradeDocRef = doc(db, `studyMaterials/${params.grade}`);
      const gradeDocSnap = await getDoc(gradeDocRef);
      if (gradeDocSnap.exists()) {
        fetchedGrade = gradeDocSnap.data() as StudyGrade;
      }

      // Apply teacher overrides from localStorage
      if (typeof window !== 'undefined') {
          const overridesRaw = localStorage.getItem(TEACHER_CHAPTER_OVERRIDES_STORAGE_KEY);
          if (overridesRaw) {
            const allOverrides: TeacherChapterOverrides = JSON.parse(overridesRaw);
            const chapterOverride = allOverrides[params.chapterId]; // Use params.chapterId
            if (chapterOverride) {
                fetchedContent = { ...(fetchedContent || {}), ...chapterOverride };
            }
          }
      }

      setChapterContent(fetchedContent);
      setGradeData(fetchedGrade || initialGradeData); // Fallback to initial grade data if fetch fails

      // Determine available PDF sources
      const content = fetchedContent || {}; // Use fetched content
      const validSources: ChapterPdfSourceInfo[] = pdfSourceConfig
          .map(cfg => ({ ...cfg, link: content[cfg.key] }))
          .filter(s => s.link && s.link.trim() !== "");
      setAvailableChapterPdfSources(validSources);

      if (validSources.length > 0) {
          setActivePdfSourceKey(validSources[0].key);
          await updateDisplayedPdf(validSources[0].link!, validSources[0].displayName);
      } else {
          setActivePdfSourceKey(null);
          await updateDisplayedPdf(null, "No Source");
      }

    } catch (e) {
      console.error("Failed to load or parse teacher chapter overrides:", e);
      toast({
        title: "Content Override Error",
        description: "Could not load teacher-modified content. Displaying default material.",
        variant: "destructive"
      })
    }
     setIsLoading(false);

  }, [params.grade, params.chapterId, toast, updateDisplayedPdf, pdfSourceConfig, initialGradeData]);

  useEffect(() => {
    loadChapterWithOverrides();
  }, [loadChapterWithOverrides]);

  useEffect(() => {
    if (activePdfGLink && activePdfSourceKey) {
        const sourceInfo = availableChapterPdfSources.find(s => s.key === activePdfSourceKey);
        if (sourceInfo && isOnline) { // Re-evaluate if online status changes and we might need to fetch
            updateDisplayedPdf(activePdfGLink, sourceInfo.displayName);
        } else if (!isOnline && activePdfGLink && !currentCachedPdfDetails) {
            // If offline and current GLink not cached, try to load from cache again (might have been cached earlier)
            updateDisplayedPdf(activePdfGLink, sourceInfo?.displayName || "Document")
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

  const handleClearCacheForActivePdf = async () => {
    if (activePdfGLink) {
        try {
            await deletePdfFromDB(activePdfGLink);
            toast({title: "Cache Cleared", description: `Offline cache for ${currentCachedPdfDetails?.fileName || 'this document'} has been removed.`});
            setCurrentCachedPdfDetails(null);
            // Re-evaluate PDF display to show online version or 'not_cached' status
            const sourceInfo = availableChapterPdfSources.find(s => s.key === activePdfSourceKey);
            updateDisplayedPdf(activePdfGLink, sourceInfo?.displayName || "Document");
        } catch (e) {
            toast({title: "Error Clearing Cache", description: "Could not remove the PDF from offline storage.", variant: "destructive"});
        }
    }
  };

  const handleSourceButtonClick = async (source: ChapterPdfSourceInfo) => {
    setActivePdfSourceKey(source.key);
    await updateDisplayedPdf(source.link!, source.displayName);
  };


  // Helper to check and update cache status for all sources
  const checkAllPdfCacheStatus = useCallback(async (sources: ChapterPdfSourceInfo[]) => {
    const newStates: Record<string, typeof pdfCacheStatus> = {};
    for (const src of sources) {
      if (src.link) {
        newStates[src.key] = 'checking_cache';
        try {
          const cached = await getPdfFromDB(src.link);
          newStates[src.key] = cached ? 'cached' : 'not_cached';
        } catch {
          newStates[src.key] = 'error_caching';
        }
      }
    }
    setPdfResourceStates(newStates);
  }, []);

  // Update cache status when sources change
  useEffect(() => {
    if (availableChapterPdfSources.length > 0) {
      checkAllPdfCacheStatus(availableChapterPdfSources);
    }
  }, [availableChapterPdfSources, checkAllPdfCacheStatus]);

  // Per-source download/cache/clear cache controls
  const handleDownloadPdfForSource = async (src: ChapterPdfSourceInfo) => {
    if (!src.link) return;
    setPdfResourceStates(prev => ({ ...prev, [src.key]: 'caching_in_progress' }));
    try {
      await attemptToCachePdf(src.link, src.displayName);
      setPdfResourceStates(prev => ({ ...prev, [src.key]: 'cached' }));
    } catch {
      setPdfResourceStates(prev => ({ ...prev, [src.key]: 'error_caching' }));
    }
  };

  const handleClearCacheForSource = async (src: ChapterPdfSourceInfo) => {
    if (!src.link) return;
    try {
      await deletePdfFromDB(src.link);
      setPdfResourceStates(prev => ({ ...prev, [src.key]: 'not_cached' }));
      toast({title: 'Cache Cleared', description: `Offline cache for ${src.displayName} has been removed.`});
    } catch {
      setPdfResourceStates(prev => ({ ...prev, [src.key]: 'error_caching' }));
      toast({title: 'Error Clearing Cache', description: `Could not remove the PDF for ${src.displayName} from offline storage.`, variant: 'destructive'});
    }
  };

  if (isLoading || !gradeData || !chapterContent) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-10 md:col-span-1" />
            <Skeleton className="h-10 md:col-span-1" />
            <Skeleton className="h-10 md:col-span-1" />
        </div>
        <div className="mt-4 space-y-4">
          <Skeleton className="h-96 w-full" /> {/* PDF viewer skeleton */}
          <Skeleton className="h-8 w-1/4 mt-4" /> {/* Key points title skeleton */}
          <Skeleton className="h-24 w-full" /> {/* Key points content skeleton */}
        </div>
      </div>
    );
  }

  const content: ChapterContent = chapterContent;
  const lastUpdatedByTeacher = content.lastUpdated ? new Date(content.lastUpdated).toLocaleDateString() : null;

  const currentActiveDisplayName = availableChapterPdfSources.find(s => s.key === activePdfSourceKey)?.displayName || "Chapter Notes";
  
  // Developer comment on PDF security
  // NOTE TO DEVELOPER: True PDF security (preventing download/external view) is complex
  // with client-side iframe rendering of external links like Google Drive.
  // The current approach relies on the iframe's sandbox and the nature of the embed URL.
  // For higher security, PDFs would typically be served through an authenticated backend
  // that might process/watermark them, or use a specialized DRM-enabled viewer.

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
          <CardDescription> {/* Using initialChapterData for name and gradeData for grade name as fallback */}
            {gradeData.name} - Sindh Textbook Board Syllabus. App by {APP_AUTHOR}.
            {lastUpdatedByTeacher && <span className="text-xs text-muted-foreground italic"> (Teacher Edits: {lastUpdatedByTeacher})</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="notes-keypoints" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 md:max-w-md">
              <TabsTrigger value="notes-keypoints"><FileText className="mr-2 h-4 w-4" />Notes &amp; Key Points</TabsTrigger>
              <TabsTrigger value="chapter-exercise"><ListChecks className="mr-2 h-4 w-4" />Chapter Exercise</TabsTrigger>
            </TabsList>

            <TabsContent value="notes-keypoints" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <CardTitle>{currentActiveDisplayName}</CardTitle>
                    {pdfCacheStatus === 'cached' && currentCachedPdfDetails && (
                        <Button onClick={handleClearCacheForActivePdf} size="sm" variant="outline" className="text-xs">
                            <Trash2 className="mr-1 h-3 w-3"/> Clear Offline Cache
                        </Button>
                    )}
                  </div>
                   {availableChapterPdfSources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 border-b pb-2 mb-2">
                        <Label className="text-sm font-medium mr-2 self-center">View Source:</Label>
                        {availableChapterPdfSources.map(src => (
                          <div key={src.key} className="flex items-center gap-1">
                            <Button
                              variant={activePdfSourceKey === src.key ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleSourceButtonClick(src)}
                              className="text-xs"
                              disabled={isCachingPdf || isLoadingPdf}
                            >
                              <src.icon className="mr-1 h-3 w-3" />
                              {src.displayName}
                            </Button>
                            {/* Per-source download/cache/clear cache controls */}
                            {src.link && pdfResourceStates[src.key] !== 'cached' && isOnline && (
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Download for Offline"
                                onClick={() => handleDownloadPdfForSource(src)}
                                disabled={pdfResourceStates[src.key] === 'caching_in_progress'}
                              >
                                <DownloadCloud className="h-4 w-4 text-primary" />
                              </Button>
                            )}
                            {src.link && pdfResourceStates[src.key] === 'cached' && (
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Clear Offline Cache"
                                onClick={() => handleClearCacheForSource(src)}
                              >
                                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            )}
                            {src.link && pdfResourceStates[src.key] === 'caching_in_progress' && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
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
                    {pdfCacheStatus === 'not_cached' && isOnline && activePdfEmbedUrl && <span className="text-xs text-blue-600 dark:text-blue-400 block">(Online Streaming View)</span>}
                    {pdfCacheStatus === 'not_cached' && !isOnline && <span className="text-xs text-orange-600 dark:text-orange-400 block">(Offline, this document is not cached)</span>}
                    {pdfCacheStatus === 'error_caching' && <span className="text-xs text-red-600 dark:text-red-400 block">(Error displaying or caching PDF)</span>}
                    {(pdfCacheStatus === 'checking_cache' || pdfCacheStatus === 'caching_in_progress' || isLoadingPdf) && <span className="text-xs text-muted-foreground block flex items-center"><Loader2 className="h-3 w-3 animate-spin mr-1"/> {pdfCacheStatus === 'caching_in_progress' ? 'Caching in progress...' : 'Processing PDF...'}</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPdf ? (
                    <Skeleton className="w-full h-[70vh] min-h-[500px] md:min-h-[700px] border rounded-md bg-muted" />
                  ) : activePdfEmbedUrl ? (
                    <iframe
                        key={activePdfEmbedUrl}
                        src={activePdfEmbedUrl}
                        className="w-full h-[70vh] min-h-[500px] md:min-h-[700px] border rounded-md bg-muted"
                        title={`${currentActiveDisplayName} Document`}
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    ></iframe>
                  ) : (
                    <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center p-4 text-center min-h-[300px] border">
                        <FileText className="h-16 w-16 text-muted-foreground mb-2"/>
                        <p className="text-sm text-muted-foreground">
                            {isOnline ? "No document to display. Select a source or the teacher may need to add one." : "Offline and no cached document available for this source."}
                        </p>
                    </div>
                  )}
                   <Alert variant="default" className="mt-4 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
                        <AlertTriangle className="h-4 w-4 !text-blue-600 dark:!text-blue-400"/>
                        <AlertTitle className="text-blue-700 dark:text-blue-300">Important Note on PDFs</AlertTitle>
                        <AlertDescription className="text-blue-600 dark:text-blue-400 text-xs">
                            Directly caching PDFs from standard Google Drive "sharing" links can be unreliable due to Google's security policies. Direct download links work best for offline caching.
                            For the best offline experience, ensure the teacher provides direct download links in the Content Management panel. Large PDFs might take time to cache.
                            This app uses IndexedDB for offline PDF storage, which is more robust than localStorage for large files.
                        </AlertDescription>
                    </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  {isLoading ? <Skeleton className="h-8 w-1/2" /> : <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-400"/>Key Points &amp; Summary</CardTitle>}
                  {isLoading ? <Skeleton className="h-4 w-3/4 mt-1"/> : <CardDescription>Quickly review the most important concepts. {lastUpdatedByTeacher && "(Teacher Edited)"}</CardDescription>}
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                   <div className="space-y-2">
                      <Skeleton className="h-4 w-full"/>
                      <Skeleton className="h-4 w-full"/>
                      <Skeleton className="h-4 w-3/4"/>
                   </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Summary */}
                      {content.summary && (
                        <div className="p-3 border rounded-md bg-secondary/30 flex gap-2 items-start">
                          <Info className="h-5 w-5 text-blue-500 mt-1" />
                          <div>
                            <div className="font-semibold mb-1">Chapter Summary</div>
                            <div className="prose prose-sm dark:prose-invert">{content.summary}</div>
                          </div>
                        </div>
                      )}
                      {/* Formulas (LaTeX) - Collapsible */}
                      {content.formulas && content.formulas.length > 0 && (
                        <Accordion type="single" collapsible defaultValue="formulas">
                          <AccordionItem value="formulas">
                            <AccordionTrigger className="flex items-center gap-2">
                              <Calculator className="h-5 w-5 text-purple-500" /> Important Formulas
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-4">
                                {content.formulas.map((f, i) => (
                                  <li key={i} className="flex flex-col gap-1 bg-muted/50 p-2 rounded-md">
                                    <Latex>{`$$${f.formula}$$`}</Latex>
                                    <span className="text-xs text-muted-foreground">{f.description}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                      {/* Key Points */}
                      <div className="p-4 border rounded-md bg-secondary/30 min-h-[150px] space-y-4 prose prose-sm dark:prose-invert">
                        {content.keyPoints ? (
                          <div>{content.keyPoints}</div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No key points available for this chapter yet.</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Real-World Examples - Collapsible */}
              {content.realWorldExamples && content.realWorldExamples.length > 0 && (
                <Accordion type="single" collapsible defaultValue="realworld">
                  <AccordionItem value="realworld">
                    <AccordionTrigger className="flex items-center gap-2">
                      <Globe2 className="h-5 w-5 text-green-600" /> Real-World Examples
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card className="bg-secondary/30">
                        <CardHeader>
                          <CardDescription>How these concepts apply in real life.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc pl-6 space-y-1">
                            {content.realWorldExamples.map((ex, i) => (
                              <li key={i} className="text-sm">{ex}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
              {/* Diagram Descriptions */}
              {content.diagramDescriptions && content.diagramDescriptions.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-orange-500" />
                    <div>
                      <CardTitle>Diagram Descriptions</CardTitle>
                      <CardDescription>Key diagrams and their explanations.</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {content.diagramDescriptions.map((d, i) => (
                        <li key={i} className="border-l-4 border-primary pl-3">
                          <div className="font-semibold">{d.title}</div>
                          <div className="text-sm text-muted-foreground whitespace-pre-line">{d.description}</div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="chapter-exercise" className="mt-4 space-y-6">
              <p className="text-sm text-muted-foreground">All exercises are based on the syllabus. {lastUpdatedByTeacher && "(Teacher Edited)"}</p>

              <Card>
                <CardHeader>
                  {isLoading ? <Skeleton className="h-8 w-1/3" /> : <CardTitle>Multiple Choice Questions (MCQs)</CardTitle>}
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? Array(3).fill(0).map((_,i) => (
                    <div key={`mcq-skel-${i}`} className="p-4 border rounded-md shadow-sm space-y-2">
                        <Skeleton className="h-5 w-3/4"/>
                        <Skeleton className="h-4 w-full"/>
                        <Skeleton className="h-4 w-full"/>
                        <Skeleton className="h-4 w-1/2"/>
                    </div>
                  )) : content.mcqs && content.mcqs.length > 0 ? (
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
                   {isLoading ? <Skeleton className="h-8 w-1/3" /> : <CardTitle>Short Answer Questions (CRQs)</CardTitle>}
                </CardHeader>
                <CardContent>
                  {isLoading ? Array(2).fill(0).map((_,i) => <Skeleton key={`crq-skel-${i}`} className="h-16 w-full mb-2"/>) : content.shortAnswers && content.shortAnswers.length > 0 ? (
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
                   {isLoading ? <Skeleton className="h-8 w-1/3" /> : <CardTitle>Long Answer Questions (ERQs)</CardTitle>}
                </CardHeader>
                <CardContent>
                   {isLoading ? Array(1).fill(0).map((_,i) => <Skeleton key={`erq-skel-${i}`} className="h-20 w-full mb-2"/>) : content.longAnswers && content.longAnswers.length > 0 ? (
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
