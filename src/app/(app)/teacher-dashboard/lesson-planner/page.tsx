
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle, NotebookText, Printer, Save, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { StudyGrade, Chapter } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { generateLessonPlan, type GenerateLessonPlanInput } from '@/ai/flows/generate-lesson-plan-flow';

const LESSON_PLANS_STORAGE_KEY_PREFIX = 'physicsLabLessonPlan_';

export default function TeacherLessonPlannerPage() {
  const { toast } = useToast();
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [gradesError, setGradesError] = useState<string | null>(null);
  
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  
  const [learningObjectives, setLearningObjectives] = useState<string>("");
  const [durationMinutes, setDurationMinutes] = useState<number>(40);
  const [lessonPlanText, setLessonPlanText] = useState<string>("");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

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

  const fetchGrades = useCallback(async () => {
    setIsLoadingGrades(true);
    setGradesError(null);
    try {
      const res = await fetch('/api/study-materials');
      if (!res.ok) throw new Error(`Failed to fetch grades: ${res.statusText}`);
      const data: StudyGrade[] = await res.json();
      setStudyGrades(data);
    } catch (error) {
      console.error("Error fetching study grades:", error);
      const errorMsg = error instanceof Error ? error.message : "Could not load grade information.";
      setGradesError(errorMsg);
    } finally {
      setIsLoadingGrades(false);
    }
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const getStorageKey = useCallback(() => {
    if (!selectedGradeId || !selectedChapterId) return null;
    return `${LESSON_PLANS_STORAGE_KEY_PREFIX}${selectedGradeId}_${selectedChapterId}`;
  }, [selectedGradeId, selectedChapterId]);

  const loadSavedPlan = useCallback(() => {
    const storageKey = getStorageKey();
    if (storageKey) {
      try {
        const savedDataRaw = localStorage.getItem(storageKey);
        if (savedDataRaw) {
          const savedData = JSON.parse(savedDataRaw);
          setLessonPlanText(savedData.lessonPlanText || "");
          setLearningObjectives(savedData.learningObjectives || "");
          setDurationMinutes(savedData.durationMinutes || 40);
          toast({ title: "Loaded Saved Plan", description: "Previously saved lesson plan for this chapter has been loaded." });
          return true;
        }
      } catch (e) {
        console.error("Failed to load or parse saved lesson plan:", e);
        toast({ title: "Error Loading Plan", description: "Could not load saved plan.", variant: "destructive" });
      }
    }
    setLessonPlanText(""); // Reset if no plan found or error
    setLearningObjectives("");
    setDurationMinutes(40);
    return false;
  }, [getStorageKey, toast]);

  useEffect(() => {
    if (selectedChapterId) {
      loadSavedPlan();
    } else {
      setLessonPlanText("");
      setLearningObjectives("");
      setDurationMinutes(40);
    }
  }, [selectedChapterId, loadSavedPlan]);


  const handleGeneratePlan = async () => {
    if (!selectedGradeId || !selectedChapterId) {
      toast({ title: "Selection Required", description: "Please select a grade and chapter.", variant: "destructive" });
      return;
    }
    if (!isOnline) {
      toast({ title: "Offline", description: "Lesson plan generation requires an internet connection.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setLessonPlanText("Generating lesson plan...\nPlease wait, this may take a moment.");
    const grade = studyGrades.find(g => g.id === selectedGradeId);
    const chapter = grade?.chapters.find(c => c.id === selectedChapterId);

    if (!grade || !chapter) {
      toast({ title: "Error", description: "Selected grade or chapter not found.", variant: "destructive" });
      setIsGenerating(false);
      return;
    }

    try {
      const input: GenerateLessonPlanInput = {
        gradeName: grade.name,
        chapterName: chapter.name,
        learningObjectives: learningObjectives || undefined,
        durationMinutes: durationMinutes,
      };
      const result = await generateLessonPlan(input);
      setLessonPlanText(result.lessonPlanText);
      toast({ title: "Lesson Plan Generated!", description: "Review and edit the plan as needed." });
    } catch (error) {
      console.error("AI lesson plan generation error:", error);
      const errorMsg = error instanceof Error ? error.message : "Could not generate lesson plan.";
      setLessonPlanText(`Failed to generate lesson plan. Error: ${errorMsg}\n\nPlease try again or manually create your plan.`);
      toast({ title: "Generation Failed", description: errorMsg, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = () => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      toast({ title: "Selection Required", description: "Cannot save without selecting grade/chapter.", variant: "destructive" });
      return;
    }
    if (!lessonPlanText.trim()) {
        toast({ title: "Empty Plan", description: "Cannot save an empty lesson plan.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    try {
      const dataToSave = {
        lessonPlanText,
        learningObjectives,
        durationMinutes,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      toast({ title: "Lesson Plan Saved!", description: "Your plan has been saved locally." });
    } catch (e) {
      console.error("Failed to save lesson plan:", e);
      toast({ title: "Save Failed", description: "Could not save lesson plan to local storage.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintPlan = () => {
    if (!lessonPlanText.trim()) {
        toast({ title: "Empty Plan", description: "Nothing to print.", variant: "destructive" });
        return;
    }
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Lesson Plan - ${studyGrades.find(g=>g.id===selectedGradeId)?.chapters.find(c=>c.id===selectedChapterId)?.name || 'Physics Lesson'}</title>
            <style>
              body { font-family: sans-serif; line-height: 1.5; padding: 20px; }
              h1, h2, h3, h4 { margin-top: 1.2em; margin-bottom: 0.5em; }
              pre { white-space: pre-wrap; word-wrap: break-word; background-color: #f8f9fa; padding: 10px; border-radius: 4px; border: 1px solid #dee2e6; }
              strong { font-weight: bold; }
              ul { margin-left: 20px; }
              @media print {
                body { padding: 10mm; } /* A4-like margins */
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>Lesson Plan</h1>
            <h2>Grade: ${studyGrades.find(g=>g.id===selectedGradeId)?.name || 'N/A'}</h2>
            <h3>Chapter/Topic: ${studyGrades.find(g=>g.id===selectedGradeId)?.chapters.find(c=>c.id===selectedChapterId)?.name || 'N/A'}</h3>
            <p><strong>Duration:</strong> ${durationMinutes} minutes</p>
            ${learningObjectives ? `<p><strong>Learning Objectives:</strong><br/>${learningObjectives.replace(/\n/g, '<br/>')}</p>` : ''}
            <hr/>
            <pre>${lessonPlanText}</pre>
            <script>
              setTimeout(() => {
                window.print();
                window.onafterprint = function() { window.close(); };
              }, 250); // Delay to ensure content loads
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      toast({ title: "Print Error", description: "Could not open print window. Please check pop-up blocker.", variant: "destructive"});
    }
  };

  const selectedChapterName = studyGrades.find(g => g.id === selectedGradeId)?.chapters.find(c => c.id === selectedChapterId)?.name;

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><NotebookText className="h-7 w-7 text-primary"/>AI-Assisted Lesson Planner (4A's Model)</CardTitle>
          <CardDescription>Select a grade and chapter, then generate an editable lesson plan using the 4A's model (Activity, Analysis, Abstraction, Application). Saved plans are stored locally in your browser.</CardDescription>
        </CardHeader>
      </Card>

      {!isOnline && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You are currently offline. AI lesson plan generation is unavailable. Saved plans can still be viewed and edited.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
            <CardTitle className="text-xl">Setup Lesson Context</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
                <Label htmlFor="grade-select">Grade</Label>
                {isLoadingGrades ? <Loader2 className="h-5 w-5 animate-spin my-2"/> : gradesError ? <Alert variant="destructive" className="mt-1"><AlertDescription>{gradesError}</AlertDescription></Alert> : (
                    <Select onValueChange={(value) => { setSelectedGradeId(value); setSelectedChapterId(null); }} value={selectedGradeId || undefined} disabled={isLoadingGrades}>
                    <SelectTrigger id="grade-select"><SelectValue placeholder="Select Grade" /></SelectTrigger>
                    <SelectContent>
                        {studyGrades.map(grade => <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>)}
                    </SelectContent>
                    </Select>
                )}
            </div>
            <div>
                <Label htmlFor="chapter-select">Chapter/Topic</Label>
                 <Select onValueChange={setSelectedChapterId} value={selectedChapterId || undefined} disabled={!selectedGradeId || (studyGrades.find(g => g.id === selectedGradeId)?.chapters.length === 0)}>
                    <SelectTrigger id="chapter-select"><SelectValue placeholder="Select Chapter/Topic" /></SelectTrigger>
                    <SelectContent>
                    {selectedGradeId && studyGrades.find(g => g.id === selectedGradeId)?.chapters.map(chapter => (
                        <SelectItem key={chapter.id} value={chapter.id}>{chapter.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="md:col-span-2">
                <Label htmlFor="learning-objectives">Specific Learning Objectives (Optional)</Label>
                <Textarea id="learning-objectives" placeholder="E.g., Students will be able to define kinematics. Students will solve problems involving v = u + at." value={learningObjectives} onChange={(e) => setLearningObjectives(e.target.value)} rows={3} />
            </div>
            <div>
                <Label htmlFor="duration-minutes">Lesson Duration (minutes)</Label>
                <Input id="duration-minutes" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 40)} min="10" step="5" />
            </div>
        </CardContent>
      </Card>

      {selectedChapterId && (
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-xl">Lesson Plan for: {selectedChapterName || "Selected Chapter"}</CardTitle>
                <div className="flex gap-2">
                    <Button onClick={handleGeneratePlan} disabled={isGenerating || !isOnline} size="sm">
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RotateCcw className="mr-2 h-4 w-4"/>}
                        {lessonPlanText.startsWith("Failed") || !lessonPlanText.trim() ? "Generate" : "Regenerate"} Plan (AI)
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Textarea 
                    placeholder="Your AI-generated lesson plan will appear here. You can edit it directly."
                    value={lessonPlanText}
                    onChange={(e) => setLessonPlanText(e.target.value)}
                    rows={25}
                    className="font-mono text-sm whitespace-pre-wrap"
                />
                 <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleSavePlan} disabled={isSaving || !lessonPlanText.trim()} className="flex-1">
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                        Save Plan Locally
                    </Button>
                    <Button onClick={handlePrintPlan} variant="outline" disabled={!lessonPlanText.trim()} className="flex-1">
                        <Printer className="mr-2 h-4 w-4"/> Print Plan
                    </Button>
                </div>
            </CardContent>
        </Card>
      )}
      {!selectedChapterId && (
        <p className="text-center text-muted-foreground py-6">Select a grade and chapter to generate or view a lesson plan.</p>
      )}
    </div>
  );
}
