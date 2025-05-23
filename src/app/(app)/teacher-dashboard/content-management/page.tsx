
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, FileEdit, UploadCloud, Trash2, Bot, PlusCircle, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { StudyGrade, Chapter, TeacherChapterOverrides, ChapterContent, MCQ, QuestionAnswer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
// Placeholder for the AI flow
import { extractChapterContent, type ExtractedChapterContentOutput } from '@/ai/flows/extractChapterContentFlow';

const TEACHER_OVERRIDES_STORAGE_KEY = 'physicsLabTeacherChapterOverrides';

export default function TeacherContentManagementPage() {
  const { toast } = useToast();
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [gradesError, setGradesError] = useState<string | null>(null);
  
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  
  const [editableContent, setEditableContent] = useState<Partial<ChapterContent>>({});
  const [isGeneratingAiContent, setIsGeneratingAiContent] = useState(false);

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

  const loadChapterContentForEditing = useCallback(() => {
    if (!selectedChapterId || !selectedGradeId) {
      setEditableContent({});
      return;
    }
    const grade = studyGrades.find(g => g.id === selectedGradeId);
    const chapter = grade?.chapters.find(c => c.id === selectedChapterId);
    
    let contentToEdit: Partial<ChapterContent> = chapter?.content || {};

    try {
      const overridesRaw = localStorage.getItem(TEACHER_OVERRIDES_STORAGE_KEY);
      if (overridesRaw) {
        const allOverrides: TeacherChapterOverrides = JSON.parse(overridesRaw);
        const chapterOverride = allOverrides[selectedChapterId];
        if (chapterOverride) {
          contentToEdit = { ...contentToEdit, ...chapterOverride };
        }
      }
    } catch (e) {
      console.error("Failed to load or parse teacher overrides for editing:", e);
    }
    setEditableContent(contentToEdit);
  }, [selectedChapterId, selectedGradeId, studyGrades]);

  useEffect(() => {
    loadChapterContentForEditing();
  }, [selectedChapterId, selectedGradeId, loadChapterContentForEditing]);


  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditableContent(prev => ({ ...prev, pdfName: file.name }));
      toast({ title: "PDF Selected", description: `${file.name} is ready to be associated upon saving.` });
    }
  };

  const handleRemovePdf = () => {
    setEditableContent(prev => ({ ...prev, pdfName: undefined }));
    toast({ title: "PDF Removed", description: "The PDF association will be cleared upon saving." });
  };

  const handleAiGenerate = async () => {
    if (!editableContent.pdfName) {
      toast({ title: "No PDF", description: "Please 'upload' (associate a name) a PDF first.", variant: "destructive" });
      return;
    }
    setIsGeneratingAiContent(true);
    try {
      // Simulate passing PDF content (just the name for now)
      const result: ExtractedChapterContentOutput = await extractChapterContent({ 
        pdfTextContent: `Simulated content from ${editableContent.pdfName}`, // In real app, pass actual text
        chapterName: studyGrades.find(g=>g.id === selectedGradeId)?.chapters.find(c=>c.id === selectedChapterId)?.name || "Selected Chapter"
      });
      
      setEditableContent(prev => ({
        ...prev,
        keyPoints: result.keyPoints,
        mcqs: result.mcqs.map((mcq, i) => ({ ...mcq, id: `mcq-${Date.now()}-${i}`})),
        shortAnswers: result.shortAnswers.map((qa, i) => ({ ...qa, id: `sa-${Date.now()}-${i}`})),
        longAnswers: result.longAnswers.map((qa, i) => ({...qa, id: `la-${Date.now()}-${i}`})),
      }));
      toast({ title: "AI Content Generated (Simulated)", description: "Review and save the generated content." });
    } catch (error) {
      console.error("AI generation error:", error);
      toast({ title: "AI Generation Failed", description: error instanceof Error ? error.message : "Could not generate content.", variant: "destructive" });
    } finally {
      setIsGeneratingAiContent(false);
    }
  };
  
  const handleContentChange = (field: keyof ChapterContent, value: any, index?: number, subField?: keyof MCQ | keyof QuestionAnswer | 'options') => {
    setEditableContent(prev => {
      const updatedContent = { ...prev };
      if (field === 'mcqs' && typeof index === 'number' && subField) {
        const mcqs = [...(updatedContent.mcqs || [])];
        if (subField === 'options') { // options is an array
            const options = [...(mcqs[index].options || [])];
            options[value.optionIndex] = value.optionValue; // value = { optionIndex, optionValue }
            mcqs[index] = { ...mcqs[index], options };
        } else if (subField === 'correctAnswerIndex') {
            mcqs[index] = { ...mcqs[index], correctAnswerIndex: parseInt(value, 10) };
        }
         else {
            mcqs[index] = { ...mcqs[index], [subField]: value };
        }
        return { ...updatedContent, mcqs };
      } else if ((field === 'shortAnswers' || field === 'longAnswers') && typeof index === 'number' && subField) {
        const qas = [...(updatedContent[field] || [])] as QuestionAnswer[];
        qas[index] = { ...qas[index], [subField]: value };
        return { ...updatedContent, [field]: qas };
      }
      return { ...updatedContent, [field]: value };
    });
  };

  const addMcq = () => {
    setEditableContent(prev => ({
      ...prev,
      mcqs: [...(prev.mcqs || []), { id: `new-mcq-${Date.now()}`, question: "", options: ["", "", "", ""], correctAnswerIndex: 0, explanation: "" }]
    }));
  };
  const removeMcq = (index: number) => {
    setEditableContent(prev => ({
      ...prev,
      mcqs: prev.mcqs?.filter((_, i) => i !== index)
    }));
  };
  
  const addQuestionAnswer = (type: 'shortAnswers' | 'longAnswers') => {
    setEditableContent(prev => ({
      ...prev,
      [type]: [...(prev[type] || []), { id: `new-${type}-${Date.now()}`, question: "", answer: "" }]
    }));
  };
  const removeQuestionAnswer = (type: 'shortAnswers' | 'longAnswers', index: number) => {
     setEditableContent(prev => ({
      ...prev,
      [type]: (prev[type] as QuestionAnswer[])?.filter((_, i) => i !== index)
    }));
  };

  const saveChapterContent = () => {
    if (!selectedChapterId || !selectedGradeId) {
      toast({ title: "Error", description: "No chapter selected.", variant: "destructive" });
      return;
    }
    try {
      const overridesRaw = localStorage.getItem(TEACHER_OVERRIDES_STORAGE_KEY);
      const allOverrides: TeacherChapterOverrides = overridesRaw ? JSON.parse(overridesRaw) : {};
      
      allOverrides[selectedChapterId] = {
        ...editableContent,
        chapterId: selectedChapterId,
        gradeId: selectedGradeId,
        lastUpdated: new Date().toISOString(),
      };
      
      localStorage.setItem(TEACHER_OVERRIDES_STORAGE_KEY, JSON.stringify(allOverrides));
      toast({ title: "Content Saved!", description: `Changes for chapter ${selectedChapterId} saved locally.` });

      // Optimistically update studyGrades state if needed, or trigger a re-fetch
      // For simplicity, let's just update the local state for immediate reflection if the structure matches
       setStudyGrades(prevGrades => prevGrades.map(g => {
        if (g.id === selectedGradeId) {
          return {
            ...g,
            chapters: g.chapters.map(c => {
              if (c.id === selectedChapterId) {
                return { ...c, content: { ...c.content, ...allOverrides[selectedChapterId]} };
              }
              return c;
            })
          };
        }
        return g;
      }));


    } catch (e) {
      console.error("Failed to save overrides:", e);
      toast({ title: "Save Failed", description: "Could not save changes to local storage.", variant: "destructive" });
    }
  };
  
  const selectedChapterName = studyGrades.find(g => g.id === selectedGradeId)?.chapters.find(c => c.id === selectedChapterId)?.name;

  if (isLoadingGrades) return <div className="flex justify-center items-center p-10"><Loader2 className="h-10 w-10 animate-spin"/></div>;
  if (gradesError) return <Alert variant="destructive"><AlertTriangle className="h-4 w-4"/><AlertDescription>{gradesError}</AlertDescription></Alert>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileEdit className="h-6 w-6 text-primary"/>Content Management</CardTitle>
          <CardDescription>Manage chapter content, including PDFs, key points, and exercises. Changes are saved to your browser's local storage.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Grade and Chapter Selection */}
            <div className="md:col-span-1 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Select Chapter</CardTitle></CardHeader>
                <CardContent>
                  <Select onValueChange={setSelectedGradeId} value={selectedGradeId || undefined}>
                    <SelectTrigger><SelectValue placeholder="Select Grade" /></SelectTrigger>
                    <SelectContent>
                      {studyGrades.map(grade => <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {selectedGradeId && (
                    <Select onValueChange={setSelectedChapterId} value={selectedChapterId || undefined} className="mt-2">
                      <SelectTrigger><SelectValue placeholder="Select Chapter" /></SelectTrigger>
                      <SelectContent>
                        {studyGrades.find(g => g.id === selectedGradeId)?.chapters.map(chapter => (
                          <SelectItem key={chapter.id} value={chapter.id}>{chapter.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Content Editing Area */}
            <div className="md:col-span-2">
              {selectedChapterId && selectedChapterName ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Editing: {selectedChapterName}</CardTitle>
                    <CardDescription>Grade: {studyGrades.find(g=>g.id === selectedGradeId)?.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* PDF Management */}
                    <div className="space-y-2 p-4 border rounded-md">
                      <h3 className="font-semibold">PDF Document</h3>
                      {editableContent.pdfName && <p className="text-sm text-muted-foreground">Current PDF: {editableContent.pdfName}</p>}
                      <div className="flex gap-2 items-center">
                        <Label htmlFor="pdf-upload" className="flex-grow">
                            <Button asChild variant="outline" className="w-full">
                                <span><UploadCloud className="mr-2 h-4 w-4"/> {editableContent.pdfName ? "Change PDF" : "Upload PDF"}</span>
                            </Button>
                        </Label>
                        <Input id="pdf-upload" type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden"/>
                        {editableContent.pdfName && <Button variant="ghost" size="icon" onClick={handleRemovePdf}><Trash2 className="h-4 w-4 text-destructive"/></Button>}
                      </div>
                    </div>

                    {/* AI Generation Button */}
                    <Button onClick={handleAiGenerate} disabled={isGeneratingAiContent || !editableContent.pdfName} className="w-full">
                      {isGeneratingAiContent ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Bot className="mr-2 h-4 w-4"/>}
                      Generate Key Points & Exercises from PDF (AI - Simulated)
                    </Button>
                    
                    {/* Key Points */}
                    <div className="space-y-2 p-4 border rounded-md">
                      <h3 className="font-semibold">Key Points & Summary</h3>
                      <Textarea 
                        value={editableContent.keyPoints || ""}
                        onChange={(e) => handleContentChange('keyPoints', e.target.value)}
                        placeholder="Enter key points and summary for this chapter..."
                        rows={6}
                      />
                    </div>

                    {/* MCQs */}
                    <Accordion type="single" collapsible className="w-full p-4 border rounded-md">
                      <AccordionItem value="mcqs">
                        <AccordionTrigger className="text-lg font-semibold">Multiple Choice Questions (MCQs)</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          {(editableContent.mcqs || []).map((mcq, index) => (
                            <Card key={mcq.id || index} className="p-3 bg-secondary/50">
                              <Label>MCQ {index + 1}:</Label>
                              <Input placeholder="Question" value={mcq.question} onChange={e => handleContentChange('mcqs', e.target.value, index, 'question')} className="mb-1"/>
                              {mcq.options.map((opt, optIndex) => (
                                <Input key={optIndex} placeholder={`Option ${optIndex + 1}`} value={opt} onChange={e => handleContentChange('mcqs', {optionIndex: optIndex, optionValue: e.target.value}, index, 'options')} className="mb-1 text-sm"/>
                              ))}
                              <Select value={mcq.correctAnswerIndex?.toString()} onValueChange={val => handleContentChange('mcqs', val, index, 'correctAnswerIndex')}>
                                <SelectTrigger className="text-sm"><SelectValue placeholder="Correct Answer" /></SelectTrigger>
                                <SelectContent>
                                  {mcq.options.map((_, optIdx) => <SelectItem key={optIdx} value={optIdx.toString()}>Option {optIdx + 1}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <Textarea placeholder="Explanation" value={mcq.explanation} onChange={e => handleContentChange('mcqs', e.target.value, index, 'explanation')} className="mt-1 text-sm" rows={2}/>
                              <Button variant="ghost" size="sm" onClick={() => removeMcq(index)} className="mt-1 text-destructive hover:bg-destructive/10"><Trash2 className="mr-1 h-3 w-3"/>Remove MCQ</Button>
                            </Card>
                          ))}
                          <Button variant="outline" size="sm" onClick={addMcq}><PlusCircle className="mr-2 h-4 w-4"/>Add MCQ</Button>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Short Answer Questions (CRQs) */}
                     <Accordion type="single" collapsible className="w-full p-4 border rounded-md">
                      <AccordionItem value="crqs">
                        <AccordionTrigger className="text-lg font-semibold">Short Answer Questions (CRQs)</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          {(editableContent.shortAnswers || []).map((qa, index) => (
                            <Card key={qa.id || index} className="p-3 bg-secondary/50">
                              <Label>Short Question {index + 1}:</Label>
                              <Input placeholder="Question" value={qa.question} onChange={e => handleContentChange('shortAnswers', e.target.value, index, 'question')} className="mb-1"/>
                              <Textarea placeholder="Answer" value={qa.answer} onChange={e => handleContentChange('shortAnswers', e.target.value, index, 'answer')} className="text-sm" rows={3}/>
                              <Button variant="ghost" size="sm" onClick={() => removeQuestionAnswer('shortAnswers', index)} className="mt-1 text-destructive hover:bg-destructive/10"><Trash2 className="mr-1 h-3 w-3"/>Remove Short Q</Button>
                            </Card>
                          ))}
                          <Button variant="outline" size="sm" onClick={() => addQuestionAnswer('shortAnswers')}><PlusCircle className="mr-2 h-4 w-4"/>Add Short Question</Button>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Long Answer Questions (ERQs) */}
                    <Accordion type="single" collapsible className="w-full p-4 border rounded-md">
                      <AccordionItem value="erqs">
                        <AccordionTrigger className="text-lg font-semibold">Long Answer Questions (ERQs)</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                           {(editableContent.longAnswers || []).map((qa, index) => (
                            <Card key={qa.id || index} className="p-3 bg-secondary/50">
                              <Label>Long Question {index + 1}:</Label>
                              <Input placeholder="Question" value={qa.question} onChange={e => handleContentChange('longAnswers', e.target.value, index, 'question')} className="mb-1"/>
                              <Textarea placeholder="Answer" value={qa.answer} onChange={e => handleContentChange('longAnswers', e.target.value, index, 'answer')} className="text-sm" rows={5}/>
                               <Button variant="ghost" size="sm" onClick={() => removeQuestionAnswer('longAnswers', index)} className="mt-1 text-destructive hover:bg-destructive/10"><Trash2 className="mr-1 h-3 w-3"/>Remove Long Q</Button>
                            </Card>
                          ))}
                          <Button variant="outline" size="sm" onClick={() => addQuestionAnswer('longAnswers')}><PlusCircle className="mr-2 h-4 w-4"/>Add Long Question</Button>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <Button onClick={saveChapterContent} className="w-full mt-6">
                      <Save className="mr-2 h-4 w-4"/> Save Chapter Content
                    </Button>
                    {editableContent.lastUpdated && <p className="text-xs text-muted-foreground text-center mt-1">Last saved by teacher: {new Date(editableContent.lastUpdated).toLocaleString()}</p>}
                  </CardContent>
                </Card>
              ) : (
                <p className="text-center text-muted-foreground py-10">Select a grade and chapter to manage its content.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
