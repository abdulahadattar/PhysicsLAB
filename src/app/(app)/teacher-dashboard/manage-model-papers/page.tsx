
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, FileArchive, Save, Loader2, AlertTriangle, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ModelPaper, StudyGrade } from '@/lib/types';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from '@/components/ui/alert';

const MODEL_PAPERS_STORAGE_KEY = 'physicsLabModelPapers';

interface GroupedModelPapers {
  [gradeId: string]: {
    gradeName: string;
    years: {
      [year: number]: ModelPaper[];
    };
  };
}

export default function ManageModelPapersPage() {
  const { toast } = useToast();
  const [modelPapers, setModelPapers] = useState<ModelPaper[]>([]);
  const [groupedPapers, setGroupedPapers] = useState<GroupedModelPapers>({});
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  
  const [newPaperTitle, setNewPaperTitle] = useState("");
  const [newPaperDescription, setNewPaperDescription] = useState("");
  const [newPaperUrl, setNewPaperUrl] = useState("");
  const [newPaperGradeId, setNewPaperGradeId] = useState<string>("");
  const [newPaperYear, setNewPaperYear] = useState<string>(new Date().getFullYear().toString()); 

  const fetchGrades = useCallback(async () => {
    setIsLoadingGrades(true);
    try {
      const res = await fetch('/api/study-materials');
      if (!res.ok) throw new Error('Failed to fetch grades');
      const data: StudyGrade[] = await res.json();
      setStudyGrades(data);
    } catch (e) {
      console.error("Error fetching study grades:", e);
      toast({ title: "Error", description: "Could not load grades for selection.", variant: "destructive" });
    }
    setIsLoadingGrades(false);
  }, [toast]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const groupPapers = useCallback((papers: ModelPaper[], grades: StudyGrade[]): GroupedModelPapers => {
    const grouped: GroupedModelPapers = {};
    const gradeMap = new Map(grades.map(g => [g.id, g.name]));

    papers.forEach(paper => {
      if (!grouped[paper.gradeId]) {
        grouped[paper.gradeId] = {
          gradeName: gradeMap.get(paper.gradeId) || `Grade ID: ${paper.gradeId}`,
          years: {}
        };
      }
      if (!grouped[paper.gradeId].years[paper.year]) {
        grouped[paper.gradeId].years[paper.year] = [];
      }
      grouped[paper.gradeId].years[paper.year].push(paper);
    });
    
    for (const gradeId in grouped) {
        const sortedYears: { [year: number]: ModelPaper[] } = {};
        Object.keys(grouped[gradeId].years)
            .map(Number)
            .sort((a, b) => b - a) 
            .forEach(year => {
                
                sortedYears[year] = grouped[gradeId].years[year].sort((a, b) => a.title.localeCompare(b.title));
            });
        grouped[gradeId].years = sortedYears;
    }
    return grouped;
  }, []);


  const loadModelPapers = useCallback(() => {
    setIsLoading(true);
    try {
      const storedData = localStorage.getItem(MODEL_PAPERS_STORAGE_KEY);
      const papers = storedData ? JSON.parse(storedData) : [];
      setModelPapers(papers);
      if (studyGrades.length > 0) {
        setGroupedPapers(groupPapers(papers, studyGrades));
      }
    } catch (e) {
      console.error("Error loading model papers:", e);
      toast({ title: "Error", description: "Could not load saved model papers.", variant: "destructive"});
      setModelPapers([]);
      setGroupedPapers({});
    }
    setIsLoading(false);
  }, [toast, studyGrades, groupPapers]);

  useEffect(() => {
    if (studyGrades.length > 0) { // Only load/group papers if grades are available for names
        loadModelPapers();
    }
  }, [loadModelPapers, studyGrades]); 


  const handleSaveModelPapers = useCallback(() => {
    setIsSaving(true);
    try {
      localStorage.setItem(MODEL_PAPERS_STORAGE_KEY, JSON.stringify(modelPapers));
      toast({ title: "Model Papers Saved", description: "Your changes have been saved locally." });
      if (studyGrades.length > 0) { // Re-group only if grades are loaded
        setGroupedPapers(groupPapers(modelPapers, studyGrades)); 
      }
    } catch (e) {
      console.error("Error saving model papers:", e);
      toast({ title: "Save Failed", description: "Could not save model papers.", variant: "destructive" });
    }
    setIsSaving(false);
  }, [modelPapers, toast, studyGrades, groupPapers]);

  const handleAddModelPaper = () => {
    const yearNum = parseInt(newPaperYear, 10);
    if (!newPaperTitle.trim() || !newPaperUrl.trim() || !newPaperGradeId || !newPaperYear.trim() || isNaN(yearNum)) {
      toast({ title: "Missing Information", description: "Please provide a valid Title, URL, Grade, and Year.", variant: "destructive" });
      return;
    }
    if (!newPaperUrl.startsWith('http://') && !newPaperUrl.startsWith('https://')) {
      toast({ title: "Invalid URL", description: "Please provide a valid URL starting with http:// or https://.", variant: "destructive" });
      return;
    }

    const newPaper: ModelPaper = {
      id: `mp-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      title: newPaperTitle,
      description: newPaperDescription,
      url: newPaperUrl,
      gradeId: newPaperGradeId,
      year: yearNum,
    };
    const updatedPapers = [...modelPapers, newPaper];
    setModelPapers(updatedPapers);
    if (studyGrades.length > 0) { // Update grouped view only if grades are loaded
        setGroupedPapers(groupPapers(updatedPapers, studyGrades)); 
    }
    setNewPaperTitle("");
    setNewPaperDescription("");
    setNewPaperUrl("");
    setNewPaperGradeId("");
    setNewPaperYear(new Date().getFullYear().toString());
    toast({ title: "Model Paper Added", description: `"${newPaper.title}" is ready to be saved.` });
  };

  const handleDeleteModelPaper = (id: string) => {
    const updatedPapers = modelPapers.filter(paper => paper.id !== id);
    setModelPapers(updatedPapers);
    if (studyGrades.length > 0) { // Update grouped view only if grades are loaded
        setGroupedPapers(groupPapers(updatedPapers, studyGrades)); 
    }
    toast({ title: "Model Paper Removed", description: "The paper has been removed from the list. Save changes to make it permanent." });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileArchive className="h-7 w-7 text-primary"/>Manage Model Papers</CardTitle>
          <CardDescription>Add, edit, or remove links to model papers. Categorize them by Grade and Year. Changes are saved to your browser's local storage.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Add New Model Paper</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="new-paper-grade">Grade <span className="text-destructive">*</span></Label>
              {isLoadingGrades ? <Loader2 className="h-4 w-4 animate-spin my-1"/> : (
                <Select value={newPaperGradeId} onValueChange={setNewPaperGradeId} disabled={studyGrades.length === 0}>
                  <SelectTrigger id="new-paper-grade">
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Grades</SelectLabel>
                      {studyGrades.map(grade => (
                        <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label htmlFor="new-paper-year">Year <span className="text-destructive">*</span></Label>
              <Input id="new-paper-year" type="number" value={newPaperYear} onChange={e => setNewPaperYear(e.target.value)} placeholder="E.g., 2023" min="1900" max="2100"/>
            </div>
            <div>
              <Label htmlFor="new-paper-title">Title <span className="text-destructive">*</span></Label>
              <Input id="new-paper-title" value={newPaperTitle} onChange={e => setNewPaperTitle(e.target.value)} placeholder="E.g., Physics Final Exam 2023" />
            </div>
            <div>
              <Label htmlFor="new-paper-description">Description (Optional)</Label>
              <Textarea id="new-paper-description" value={newPaperDescription} onChange={e => setNewPaperDescription(e.target.value)} placeholder="Briefly describe the paper" rows={2}/>
            </div>
            <div>
              <Label htmlFor="new-paper-url">Google Drive PDF Link <span className="text-destructive">*</span></Label>
              <Input id="new-paper-url" type="url" value={newPaperUrl} onChange={e => setNewPaperUrl(e.target.value)} placeholder="https://drive.google.com/..." />
            </div>
            <Button onClick={handleAddModelPaper} className="w-full" disabled={isLoadingGrades}>
              <PlusCircle className="mr-2 h-4 w-4"/> Add to List
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Current Model Papers</CardTitle>
            <CardDescription>Review and remove existing model papers. Click "Save All Changes" below to persist updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[600px] overflow-y-auto">
            {isLoading && <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></div>}
            {!isLoading && Object.keys(groupedPapers).length === 0 && (
              <p className="text-muted-foreground text-center py-4">No model papers added yet.</p>
            )}
            {!isLoading && 
              <Accordion type="multiple" className="w-full">
                {Object.entries(groupedPapers).map(([gradeId, gradeData]) => (
                  <AccordionItem value={gradeId} key={gradeId}>
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline bg-secondary/30 px-4 py-3 rounded-t-md">
                        <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary"/>{gradeData.gradeName}</div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pt-2 pb-1 border border-t-0 rounded-b-md">
                      {Object.keys(gradeData.years).length > 0 ? (
                        <Accordion type="multiple" className="w-full">
                          {Object.entries(gradeData.years).map(([year, papersInYear]) => (
                            <AccordionItem value={`${gradeId}-${year}`} key={`${gradeId}-${year}`} className="mb-2 border rounded-md overflow-hidden">
                              <AccordionTrigger className="text-md font-medium hover:no-underline bg-card px-3 py-2.5">Year: {year}</AccordionTrigger>
                              <AccordionContent className="p-0">
                                <ul className="divide-y">
                                  {papersInYear.map(paper => (
                                    <li key={paper.id} className="p-3 hover:bg-muted/30">
                                      <div className="flex justify-between items-start gap-2">
                                        <div>
                                          <h4 className="font-semibold text-sm">{paper.title}</h4>
                                          {paper.description && <p className="text-xs text-muted-foreground mb-1">{paper.description}</p>}
                                          <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block max-w-xs sm:max-w-sm md:max-w-md">{paper.url}</a>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => handleDeleteModelPaper(paper.id)}>
                                          <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <p className="text-muted-foreground text-center p-3">No papers for this grade yet.</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            }
             {!isLoadingGrades && studyGrades.length === 0 && (
                <Alert variant="default" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        No grades found. Please ensure study materials (grades) are loaded correctly to assign model papers.
                    </AlertDescription>
                </Alert>
            )}
          </CardContent>
          <CardFooter>
             <Button onClick={handleSaveModelPapers} disabled={isSaving} className="w-full mt-4">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
              Save All Changes to Model Papers
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
