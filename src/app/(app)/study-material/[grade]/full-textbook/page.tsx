"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, WifiOff, DownloadCloud, AlertTriangle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- IndexedDB Helper Functions (Copied/Adapted from ChapterDetailClient) ---
const PDF_DB_NAME = 'PhysicsLabPDFCache';
const PDF_STORE_NAME = 'pdfStore';

interface CachedPdfData {
  url: string; // Original PDF URL (e.g., from STBB)
  blob: Blob;
  fileName: string; // A descriptive file name for the cache
  fileSize?: number;
  lastFetched?: string;
}

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
    const pdfData: CachedPdfData = { url, blob, fileName, fileSize: blob.size, lastFetched: new Date().toISOString() };
    const request = store.put(pdfData);
    request.onerror = () => { db.close(); reject("Error storing PDF: " + request.error); };
    request.onsuccess = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject("Transaction error storing PDF: " + transaction.error); };
  });
};

const getPdfFromDB = async (url: string): Promise<CachedPdfData | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PDF_STORE_NAME, 'readonly');
    const store = transaction.objectStore(PDF_STORE_NAME);
    const request = store.get(url);
    request.onerror = () => { db.close(); reject("Error fetching PDF: " + request.error); };
    request.onsuccess = () => { db.close(); resolve(request.result || null); };
    transaction.oncomplete = () => { /* db already closed in onsuccess/onerror */ };
  });
};

const deletePdfFromDB = async (url: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(PDF_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(PDF_STORE_NAME);
        const request = store.delete(url);
        request.onerror = () => { db.close(); reject("Error deleting PDF: " + request.error); };
        request.onsuccess = () => { db.close(); resolve(); };
        transaction.onerror = () => { db.close(); reject("Transaction error deleting PDF: " + transaction.error); };
    });
};
// --- End IndexedDB Helper Functions ---

function FullTextbookViewerContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const { toast } = useToast();

  const pdfUrlParam = searchParams.get("url");
  const titleParam = searchParams.get("title");
  const gradeId = params.grade as string; // from folder structure [grade]

  const [pdfSrcForIframe, setPdfSrcForIframe] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isCaching, setIsCaching] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<'idle' | 'cached' | 'not_cached' | 'error_caching' | 'checking_cache'>('checking_cache');
  const [cachedDetails, setCachedDetails] = useState<CachedPdfData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const descriptiveFileName = `${titleParam?.replace(/\s+/g, '_') || 'Full_Textbook'}_Grade_${gradeId}.pdf`;

  const loadPdf = useCallback(async () => {
    if (!pdfUrlParam) {
      setError("No PDF URL provided.");
      setIsLoadingPdf(false);
      setCacheStatus('idle');
      return;
    }
    setIsLoadingPdf(true);
    setError(null);
    setCacheStatus('checking_cache');

    try {
      const cachedData = await getPdfFromDB(pdfUrlParam);
      if (cachedData?.blob) {
        const blobUrl = URL.createObjectURL(cachedData.blob);
        setPdfSrcForIframe(blobUrl);
        setCacheStatus('cached');
        setCachedDetails(cachedData);
        toast({ title: "Loaded from Cache", description: `${titleParam || 'Textbook'} is being shown from offline storage.` });
      } else {
        setCachedDetails(null);
        if (isOnline) {
          // Use the proxy for online viewing as direct links are blocked by CORS/X-Frame-Options
          const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(pdfUrlParam)}`;
          setPdfSrcForIframe(proxyUrl);
          setCacheStatus('not_cached');
        } else {
          setPdfSrcForIframe(null);
          setCacheStatus('not_cached');
          setError("You are offline and this textbook is not cached.");
          toast({ title: "Offline", description: `${titleParam || 'Textbook'} is not available offline.`, variant: "destructive" });
        }
      }
    } catch (e: any) {
      console.error("Error loading PDF:", e);
      setError(`Failed to load PDF: ${e.message}`);
      setPdfSrcForIframe(null);
      setCacheStatus('error_caching');
    } finally {
      setIsLoadingPdf(false);
    }
  }, [pdfUrlParam, isOnline, toast, titleParam]);

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

  useEffect(() => {
    loadPdf();
  }, [loadPdf]); // Rerun loadPdf if isOnline or pdfUrlParam changes (though pdfUrlParam is stable)

  const handleCacheCurrentPdf = async () => {
    if (!pdfUrlParam || !isOnline) {
      toast({ title: isOnline ? "No PDF" : "Offline", description: isOnline ? "No PDF URL to cache." : "Cannot cache while offline.", variant: "destructive" });
      return;
    }
    setIsCaching(true);
    toast({ title: `Caching: ${titleParam || 'Textbook'}`, description: "This may take some time..." });
    try {
      // Fetch the PDF via the server-side proxy to bypass CORS restrictions
      const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(pdfUrlParam)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`Failed to fetch PDF (status: ${response.status})`);
      const blob = await response.blob();
      if (blob.type !== 'application/pdf') throw new Error("Downloaded file is not a PDF.");

      await storePdfInDB(pdfUrlParam, blob, descriptiveFileName);
      setCacheStatus('cached');
      const newCachedDetails = await getPdfFromDB(pdfUrlParam); // Re-fetch details to get size etc.
      setCachedDetails(newCachedDetails);
      toast({ title: "Cached Successfully!", description: `${titleParam || 'Textbook'} is now available offline.` });
    } catch (e: any) {
      console.error("Error caching PDF:", e);
      toast({ title: "Caching Failed", description: e.message || "Could not cache the PDF.", variant: "destructive", duration: 7000 });
      setCacheStatus('error_caching');
    } finally {
      setIsCaching(false);
    }
  };

  const handleClearCachedPdf = async () => {
    if (!pdfUrlParam) return;
    try {
        await deletePdfFromDB(pdfUrlParam);
        toast({ title: "Cache Cleared", description: `Offline cache for ${titleParam || 'Textbook'} removed.` });
        setCachedDetails(null);
        setCacheStatus('not_cached');
        // Reload the PDF from online source if available
        if (isOnline) setPdfSrcForIframe(pdfUrlParam); else setPdfSrcForIframe(null);
    } catch (e) {
        toast({ title: "Error Clearing Cache", description: "Could not remove PDF from offline storage.", variant: "destructive" });
    }
  };

  if (!pdfUrlParam) {
    return (
      <div className="p-4 md:p-6 text-center">
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>PDF URL missing. Cannot display the textbook.</AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-4">
            <Link href={`/study-material`}>Back to Study Materials</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <Button variant="outline" asChild size="sm">
          <Link href={`/study-material`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Study Materials
          </Link>
        </Button>
        {cacheStatus === 'not_cached' && isOnline && (
          <Button onClick={handleCacheCurrentPdf} disabled={isCaching} size="sm">
            {isCaching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DownloadCloud className="mr-2 h-4 w-4" />}
            {isCaching ? "Caching..." : "Download for Offline"}
          </Button>
        )}
        {cacheStatus === 'cached' && cachedDetails && (
             <Button onClick={handleClearCachedPdf} size="sm" variant="outline" className="text-xs">
                <Trash2 className="mr-1 h-3 w-3"/> Clear Offline Cache
            </Button>
        )}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">{titleParam || "Full Textbook"}</CardTitle>
          <CardDescription>
            Grade {gradeId} Full Textbook.
            {cacheStatus === 'cached' && cachedDetails && (
              <span className="text-xs text-green-600 dark:text-green-400 block mt-1">
                (Available Offline. Cached: {cachedDetails.lastFetched ? new Date(cachedDetails.lastFetched).toLocaleDateString() : 'N/A'},
                Size: {cachedDetails.fileSize ? (cachedDetails.fileSize / (1024*1024)).toFixed(2) + 'MB' : 'N/A'})
              </span>
            )}
            {cacheStatus === 'not_cached' && isOnline && <span className="text-xs text-blue-600 dark:text-blue-400 block mt-1">(Viewing Online Version)</span>}
            {cacheStatus === 'not_cached' && !isOnline && <span className="text-xs text-orange-600 dark:text-orange-400 block mt-1">(Offline, content not cached)</span>}
            {cacheStatus === 'error_caching' && <span className="text-xs text-red-600 dark:text-red-400 block mt-1">(Error with PDF)</span>}
            {(cacheStatus === 'checking_cache' || isLoadingPdf) && !error && <span className="text-xs text-muted-foreground block mt-1 flex items-center"><Loader2 className="h-3 w-3 animate-spin mr-1"/> Processing PDF...</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPdf && !error && (
            <Skeleton className="w-full h-[calc(100vh-250px)] min-h-[500px] border rounded-md bg-muted" />
          )}
          {!isLoadingPdf && error && (
            <Alert variant="destructive" className="my-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Displaying PDF</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!isLoadingPdf && !error && pdfSrcForIframe && (
            <iframe
              key={pdfSrcForIframe} // Important to force re-render if src changes between blob and URL
              src={pdfSrcForIframe}
              className="w-full h-[calc(100vh-250px)] min-h-[500px] border rounded-md bg-muted"
              title={titleParam || "Full Textbook Viewer"}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Sandbox for security
            ></iframe>
          )}
          {!isLoadingPdf && !error && !pdfSrcForIframe && (
             <div className="w-full h-[calc(100vh-250px)] min-h-[500px] border rounded-md bg-muted flex flex-col items-center justify-center text-muted-foreground p-4">
                <WifiOff className="h-12 w-12 mb-2"/>
                <p>PDF cannot be displayed.</p>
                <p className="text-sm">{isOnline ? "The online PDF might be unavailable or the link is incorrect." : "You are offline and this PDF is not cached."}</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function FullTextbookPage() {
  // Suspense is good for handling cases where searchParams might not be immediately available
  return (
    <Suspense fallback={<div className="p-6 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto"/> Loading textbook viewer...</div>}>
      <FullTextbookViewerContent />
    </Suspense>
  );
}