
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Import Button
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Palette, Bell, Download, UserCog, DownloadCloud, Loader2, AlertTriangle } from "lucide-react";
import { useFunFactsSettings } from '@/hooks/use-fun-facts-settings';
import { ThemeToggle } from '@/components/theme-toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import type { StudyGrade } from '@/lib/types';
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOnlineStatus } from "@/hooks/use-online-status";

// IndexedDB Helper Functions for PDF Caching
const PDF_DB_NAME = 'PhysicsLabPDFCache';
const PDF_STORE_NAME = 'pdfStore';

interface CachedPdfData {
  url: string;
  blob: Blob;
  fileName: string;
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
    const pdfData: CachedPdfData = {
      url,
      blob,
      fileName,
      fileSize: blob.size,
      lastFetched: new Date().toISOString(),
    };
    const request = store.put(pdfData);
    request.onerror = () => { db.close(); reject("Error storing PDF in IndexedDB: " + request.error); };
    request.onsuccess = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => { db.close(); reject("Transaction error storing PDF: " + transaction.error); };
    transaction.onabort = () => { db.close(); reject("Transaction aborted storing PDF: " + transaction.error); };
  });
};

const getPdfFromDB = async (url: string): Promise<CachedPdfData | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PDF_STORE_NAME, 'readonly');
    const store = transaction.objectStore(PDF_STORE_NAME);
    const request = store.get(url);
    request.onerror = () => { db.close(); reject("Error fetching PDF from IndexedDB: " + request.error); };
    request.onsuccess = () => { db.close(); resolve(request.result || null); };
  });
};


export default function SettingsPage() {
  const { isPanelVisible, togglePanelVisibility, isMounted: isFunFactsMounted } = useFunFactsSettings();
  const { toast } = useToast();
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [gradesError, setGradesError] = useState<string | null>(null);
  const [selectedGradeForDownload, setSelectedGradeForDownload] = useState<string | null>(null);
  const [isCachingFullBook, setIsCachingFullBook] = useState(false);
  const [cacheProgress, setCacheProgress] = useState<{ [gradeId: string]: string }>({}); // To show status per grade
  const [currentGradeCacheStatus, setCurrentGradeCacheStatus] = useState<string>("Not Checked");
  const isOnline = useOnlineStatus(); // Assuming you have a useOnlineStatus hook or similar


  const fetchGrades = useCallback(async () => {
    setIsLoadingGrades(true);
    setGradesError(null);
    try {
      const res = await fetch('/api/study-materials');
      if (!res.ok) throw new Error(`Failed to fetch grades: ${res.statusText}`);
      const data: StudyGrade[] = await res.json();
      setStudyGrades(data);
    } catch (error) {
      console.error("Error fetching study grades for settings:", error);
      const errorMsg = error instanceof Error ? error.message : "Could not load grade information.";
      setGradesError(errorMsg);
      toast({ variant: "destructive", title: "Error loading grades", description: errorMsg });
    } finally {
      setIsLoadingGrades(false);
    }
  }, [toast]);

   // Effect to check cache status when selected grade changes or after caching attempts
   useEffect(() => {
    const checkCacheStatus = async () => {
      if (selectedGradeForDownload) {
        const grade = studyGrades.find(g => g.id === selectedGradeForDownload);
        if (grade?.completeTextbookPdfLink) {
          setCurrentGradeCacheStatus("Checking...");
          try {
            const cached = await getPdfFromDB(grade.completeTextbookPdfLink);
            if (cached && cached.blob) {
               setCurrentGradeCacheStatus(`Cached (${(cached.fileSize! / (1024*1024)).toFixed(2)} MB)`);
            } else {
              setCurrentGradeCacheStatus("Not Cached");
            }
          } catch (e) {
             console.error("Error checking cache status:", e);
             setCurrentGradeCacheStatus("Error Checking");
          }
        } else {
          setCurrentGradeCacheStatus("No Textbook Link");
        }
      } else {
        setCurrentGradeCacheStatus("Select Grade");
      }
    };
    checkCacheStatus();
  }, [selectedGradeForDownload, studyGrades, isCachingFullBook]); // Rerun when caching finishes or selection changes


  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const handleDownloadAllForGrade = async () => {
    if (!selectedGradeForDownload) {
      toast({ title: "Select Grade", description: "Please select a grade to download materials for.", variant: "destructive" });
      return;
    }
    if (!isOnline) {
        toast({ title: "Offline", description: "Cannot download materials while offline.", variant: "destructive" });
        return;
    }

    const gradeToDownload = studyGrades.find(g => g.id === selectedGradeForDownload);
    if (!gradeToDownload || !gradeToDownload.completeTextbookPdfLink) {
      toast({ title: "No Textbook Link", description: `No STBB full textbook link found for ${gradeToDownload?.name || "selected grade"}.`, variant: "default" });
      return;
    }
     toast({ title: `Starting Download: ${gradeToDownload.name} Textbook`,
      description: "(Simulated) Full background caching of all PDFs and content for this grade via IndexedDB is a future enhancement. This feature is currently a placeholder."
    });
    // In a real implementation, this would trigger a robust background caching process
    // for all PDFs and possibly other content related to the selectedGradeForDownload.
  };

  const handleDownloadFullTextbook = async () => {
    if (!selectedGradeForDownload || isCachingFullBook) return;

    const gradeToDownload = studyGrades.find(g => g.id === selectedGradeForDownload);
    if (!gradeToDownload || !gradeToDownload.completeTextbookPdfLink) {
       toast({ title: "No Textbook Link", description: `No STBB full textbook link found for ${gradeToDownload?.name || "selected grade"}.`, variant: "default" });
       return;
    }

    const pdfUrl = gradeToDownload.completeTextbookPdfLink;
    const pdfFileName = `${gradeToDownload.name.replace(/\s+/g, '_')}_STBB_Full_Textbook.pdf`;

    setIsCachingFullBook(true);
 setCacheProgress(prev => ({ ...prev, [selectedGradeForDownload]: "Caching..." })); // Keep for potential multi-file status later
 setCurrentGradeCacheStatus("Caching...");

    try {
      const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`;
      const response = await fetch(proxyUrl); // Fetch via proxy
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF via proxy (status: ${response.status}).`);
      }
      const blob = await response.blob();
      if (blob.type !== 'application/pdf') {
        throw new Error("Downloaded file is not a PDF.");
      }
      await storePdfInDB(pdfUrl, blob, pdfFileName);
 setCacheProgress(prev => ({ ...prev, [selectedGradeForDownload!]: "Cached!" })); // Keep for potential multi-file status later
 setCurrentGradeCacheStatus(`Cached (${(blob.size / (1024*1024)).toFixed(2)} MB)`);
      toast({ title: "Download Complete!", description: `${pdfFileName} has been cached for offline use.` });
    } catch (e: any) {
 setCacheProgress(prev => ({ ...prev, [selectedGradeForDownload!]: "Error" })); // Keep for potential multi-file status later
 setCurrentGradeCacheStatus("Error Caching");
      toast({ title: "Download Failed", description: e.message || `Could not cache textbook for ${gradeToDownload.name}.`, variant: "destructive", duration: 7000 });
    } finally { setIsCachingFullBook(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
           <div className="inline-block mx-auto bg-primary/10 p-3 rounded-full mb-2">
             <SettingsIcon className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Application Settings</CardTitle>
          <CardDescription>Customize your PhysicsLab experience.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Palette className="h-5 w-5 text-primary"/>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <Label htmlFor="theme-toggle-label" className="flex flex-col gap-1">
              <span className="font-semibold">Theme</span>
              <span className="text-sm text-muted-foreground">Select your preferred light or dark mode.</span>
            </Label>
            <ThemeToggle />
          </div>
          {isFunFactsMounted && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <Label htmlFor="fun-facts-toggle" className="flex flex-col gap-1">
                <span className="font-semibold">Fun Physics Facts Panel</span>
                <span className="text-sm text-muted-foreground">Show or hide the floating panel with interesting physics facts.</span>
                </Label>
                <Switch
                id="fun-facts-toggle"
                checked={isPanelVisible}
                onCheckedChange={togglePanelVisibility}
                aria-label="Toggle fun facts panel visibility"
                />
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Bell className="h-5 w-5 text-primary"/>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between p-4 border rounded-lg">
            <Label htmlFor="notifications-toggle" className="flex flex-col gap-1">
              <span className="font-semibold">Enable Notifications</span>
               <span className="text-sm text-muted-foreground">Receive updates for new quizzes or announcements. (Feature coming soon)</span>
            </Label>
            <Switch id="notifications-toggle" disabled aria-label="Toggle notifications"/>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Download className="h-5 w-5 text-primary"/>Data & Sync</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="p-4 border rounded-lg">
            <Label className="flex flex-col gap-1">
              <span className="font-semibold">Automatic Data Sync</span>
              <span className="text-sm text-muted-foreground">
                The app aims to automatically sync data (like pending feedback submissions and potentially future content updates) 
                when an internet connection is available. This ensures your experience is as up-to-date as possible and offline work is saved.
                PDFs and other large study materials are managed via IndexedDB for robust offline access.
              </span>
            </Label>
          </div>
          <div className="p-4 border rounded-lg">
            <Label className="flex flex-col gap-1">
              <span className="font-semibold">App Updates</span>
                <span className="text-sm text-muted-foreground">
                    This application is designed as a Progressive Web App (PWA). Updates are typically handled automatically by your browser when you re-open the app after an update has been deployed. You can also try a hard refresh.
                </span>
            </Label>
            <Button variant="outline" className="w-full mt-2" onClick={() => window.location.reload(true)} >
               Force Reload App
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><DownloadCloud className="h-5 w-5 text-primary"/>Offline Content Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You can download all study materials (notes, exercises, etc.) for a specific grade to ensure full offline access. This may take some time and consume storage space.
          </p>
          {isLoadingGrades ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading grades...</span>
            </div>
          ) : gradesError ? (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{gradesError}</AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 items-end">
              <div className="flex-grow">
                <Label htmlFor="grade-download-select">Select Grade</Label>
                <Select onValueChange={setSelectedGradeForDownload} value={selectedGradeForDownload || ""}>
                  <SelectTrigger id="grade-download-select">
                    <SelectValue placeholder="Select Grade to Download" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Grades</SelectLabel>
                      {studyGrades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleDownloadFullTextbook} // Call the new function
                disabled={!selectedGradeForDownload || isCachingFullBook || !isOnline || currentGradeCacheStatus.startsWith("Cached")}
                className="w-full sm:w-auto"
              >
                 {isCachingFullBook ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <DownloadCloud className="mr-2 h-4 w-4" />
                  )}
                 {isCachingFullBook
                    ? `Caching Textbook...`
                    : currentGradeCacheStatus.startsWith("Cached")
                    ? `Cached`
                    : `Download Textbook for ${studyGrades.find(g => g.id === selectedGradeForDownload)?.name || "Grade"}`}
              </Button>

            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Note: Full download functionality for all content types (beyond individual PDF caching on view) is a future enhancement. This button currently simulates the initiation.
          </p>
        </CardContent>
         <CardContent className="space-y-4">
             <p className="text-sm font-semibold">Current Selected Grade Cache Status:</p>
             <p className={`text-sm ${currentGradeCacheStatus.startsWith("Cached") ? "text-green-600 dark:text-green-400" : currentGradeCacheStatus.startsWith("Error") ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                {currentGradeCacheStatus}
             </p>
         </CardContent>
      </Card>

    </div>
  );
}
