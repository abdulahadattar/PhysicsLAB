
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, FileEdit, Link2, Trash2, Bot, PlusCircle, Save } from "lucide-react"; // Changed UploadCloud to Link2
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { StudyGrade, Chapter, TeacherChapterOverrides, ChapterContent, MCQ, QuestionAnswer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { extractChapterContent, type ExtractedChapterContentOutput } from '@/ai/flows/extractChapterContentFlow';

const TEACHER_OVERRIDES_STORAGE_KEY = 'physicsLabTeacherChapterOverrides';
type PdfTypeKey = 'sindhTextbookPdfName' | 'alternativeTextbookPdfName' | 'teacherNotesPdfName';

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

  const handlePdfLinkChange = (pdfType: PdfTypeKey, link: string) => {
    setEditableContent(prev => ({ ...prev, [pdfType]: link }));
  };

  const handleRemovePdfLink = (pdfType: PdfTypeKey) => {
    setEditableContent(prev => {
      const newContent = {...prev};
      delete newContent[pdfType]; 
      return newContent;
    });
    toast({ title: "PDF Link Removed", description: `The link for ${pdfType.replace('PdfName',' PDF')} will be cleared upon saving.` });
  };

  const handleAiGenerate = async () => {
    const primaryPdfForAi = editableContent.teacherNotesPdfName || editableContent.sindhTextbookPdfName || editableContent.alternativeTextbookPdfName;
    if (!primaryPdfForAi || !primaryPdfForAi.startsWith('http')) { // Basic check for a link
      toast({ title: "No PDF Link for AI", description: "Please provide a valid Google Drive PDF link (e.g., Teacher Notes or Sindh Textbook) to generate content from.", variant: "destructive" });
      return;
    }
    setIsGeneratingAiContent(true);
    try {
      // For AI, we pass the LINK itself, conceptualizing that the AI can access/process it.
      // The current `extractChapterContent` flow simulates this by using the link as a "filename" for mock data.
      const result: ExtractedChapterContentOutput = await extractChapterContent({ 
        pdfTextContent: `Content from PDF link: ${primaryPdfForAi}`, 
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
  
  const handleContentChange = (field: keyof ChapterContent | 'mcqs' | 'shortAnswers' | 'longAnswers', value: any, index?: number, subField?: keyof MCQ | keyof QuestionAnswer | 'options') => {
    setEditableContent(prev => {
      const updatedContent = { ...prev };
      if ((field === 'mcqs' || field === 'shortAnswers' || field === 'longAnswers') && typeof index === 'number' && subField) {
        const items = [...(updatedContent[field as 'mcqs' | 'shortAnswers' | 'longAnswers'] || [])] as any[];
        if (field === 'mcqs' && subField === 'options') {
            const options = [...(items[index].options || [])];
            options[value.optionIndex] = value.optionValue; 
            items[index] = { ...items[index], options };
        } else if (field === 'mcqs' && subField === 'correctAnswerIndex') {
            items[index] = { ...items[index], correctAnswerIndex: parseInt(value, 10) };
        } else {
            items[index] = { ...items[index], [subField]: value };
        }
        return { ...updatedContent, [field]: items };
      }
      return { ...updatedContent, [field as keyof ChapterContent]: value };
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
      
      const contentToSave: Partial<ChapterContent> = { ...editableContent };
      // Clean up empty PDF links before saving
      if (!contentToSave.sindhTextbookPdfName?.trim()) delete contentToSave.sindhTextbookPdfName;
      if (!contentToSave.alternativeTextbookPdfName?.trim()) delete contentToSave.alternativeTextbookPdfName;
      if (!contentToSave.teacherNotesPdfName?.trim()) delete contentToSave.teacherNotesPdfName;


      allOverrides[selectedChapterId] = {
        ...contentToSave, // This now contains the PDF links
        chapterId: selectedChapterId, 
        gradeId: selectedGradeId,    
        lastUpdated: new Date().toISOString(),
      };
      
      localStorage.setItem(TEACHER_OVERRIDES_STORAGE_KEY, JSON.stringify(allOverrides));
      toast({ title: "Content Saved!", description: `Changes for chapter ${selectedChapterId} saved locally.` });

       setStudyGrades(prevGrades => prevGrades.map(g => {
        if (g.id === selectedGradeId) {
          return {
            ...g,
            chapters: g.chapters.map(c => {
              if (c.id === selectedChapterId) {
                // Merge existing content with the new override
                const baseContent = c.content || {};
                const updatedChapterContent = { ...baseContent, ...allOverrides[selectedChapterId] };
                return { ...c, content: updatedChapterContent };
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

  const pdfConfig: { key: PdfTypeKey, label: string }[] = [
    { key: 'sindhTextbookPdfName', label: 'Sindh Textbook PDF Link' },
    { key: 'alternativeTextbookPdfName', label: 'Alternative Textbook PDF Link' },
    { key: 'teacherNotesPdfName', label: "Teacher's Notes PDF Link" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileEdit className="h-6 w-6 text-primary"/>Content Management</CardTitle>
          <CardDescription>Manage chapter content including PDF links, key points, and exercises. Changes are saved locally.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Select Chapter</CardTitle></CardHeader>
                <CardContent>
                  <Select onValueChange={(value) => {setSelectedGradeId(value); setSelectedChapterId(null); setEditableContent({});}} value={selectedGradeId || undefined}>
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

            <div className="md:col-span-2">
              {selectedChapterId && selectedChapterName ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Editing: {selectedChapterName}</CardTitle>
                    <CardDescription>Grade: {studyGrades.find(g=>g.id === selectedGradeId)?.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4 p-4 border rounded-md">
                      <h3 className="font-semibold text-lg">Chapter PDF Links (Google Drive)</h3>
                      {pdfConfig.map(pdf => (
                        <div key={pdf.key} className="space-y-1 border-b pb-3 last:border-b-0 last:pb-0">
                          <Label htmlFor={`${pdf.key}-input`} className="font-medium">{pdf.label}</Label>
                           <div className="flex gap-2 items-center">
                            <Input 
                              id={`${pdf.key}-input`} 
                              type="url" 
                              placeholder="Paste Google Drive PDF link here" 
                              value={editableContent[pdf.key] || ""}
                              onChange={(e) => handlePdfLinkChange(pdf.key, e.target.value)}
                              className="flex-grow"
                            />
                            {editableContent[pdf.key] && <Button variant="ghost" size="icon" onClick={() => handleRemovePdfLink(pdf.key)} className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive"/></Button>}
                          </div>
                          {editableContent[pdf.key] && <p className="text-xs text-muted-foreground">Current Link: {editableContent[pdf.key]}</p>}
                        </div>
                      ))}
                    </div>

                    <Button onClick={handleAiGenerate} disabled={isGeneratingAiContent || !(editableContent.teacherNotesPdfName || editableContent.sindhTextbookPdfName || editableContent.alternativeTextbookPdfName)} className="w-full">
                      {isGeneratingAiContent ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Bot className="mr-2 h-4 w-4"/>}
                      Generate Key Points & Exercises (AI - Simulated)
                    </Button>
                    
                    <div className="space-y-2 p-4 border rounded-md">
                      <h3 className="font-semibold">Key Points & Summary</h3>
                      <Textarea 
                        value={editableContent.keyPoints || ""}
                        onChange={(e) => handleContentChange('keyPoints', e.target.value)}
                        placeholder="Enter key points and summary... (AI can help generate this)"
                        rows={6}
                      />
                    </div>

                    <Accordion type="single" collapsible className="w-full p-4 border rounded-md">
                      <AccordionItem value="mcqs">
                        <AccordionTrigger className="text-lg font-semibold">Multiple Choice Questions (MCQs)</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          {(editableContent.mcqs || []).map((mcq, index) => (
                            <Card key={mcq.id || index} className="p-3 bg-secondary/50">
                              <Label>MCQ {index + 1}:</Label>
                              <Textarea placeholder="Question" value={mcq.question} onChange={e => handleContentChange('mcqs', e.target.value, index, 'question')} className="mb-1" rows={2}/>
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

                     <Accordion type="single" collapsible className="w-full p-4 border rounded-md">
                      <AccordionItem value="crqs">
                        <AccordionTrigger className="text-lg font-semibold">Short Answer Questions (CRQs)</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          {(editableContent.shortAnswers || []).map((qa, index) => (
                            <Card key={qa.id || index} className="p-3 bg-secondary/50">
                              <Label>Short Question {index + 1}:</Label>
                              <Textarea placeholder="Question" value={qa.question} onChange={e => handleContentChange('shortAnswers', e.target.value, index, 'question')} className="mb-1" rows={2}/>
                              <Textarea placeholder="Answer" value={qa.answer} onChange={e => handleContentChange('shortAnswers', e.target.value, index, 'answer')} className="text-sm" rows={3}/>
                              <Button variant="ghost" size="sm" onClick={() => removeQuestionAnswer('shortAnswers', index)} className="mt-1 text-destructive hover:bg-destructive/10"><Trash2 className="mr-1 h-3 w-3"/>Remove Short Q</Button>
                            </Card>
                          ))}
                          <Button variant="outline" size="sm" onClick={() => addQuestionAnswer('shortAnswers')}><PlusCircle className="mr-2 h-4 w-4"/>Add Short Question</Button>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <Accordion type="single" collapsible className="w-full p-4 border rounded-md">
                      <AccordionItem value="erqs">
                        <AccordionTrigger className="text-lg font-semibold">Long Answer Questions (ERQs)</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                           {(editableContent.longAnswers || []).map((qa, index) => (
                            <Card key={qa.id || index} className="p-3 bg-secondary/50">
                              <Label>Long Question {index + 1}:</Label>
                              <Textarea placeholder="Question" value={qa.question} onChange={e => handleContentChange('longAnswers', e.target.value, index, 'question')} className="mb-1" rows={3}/>
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
                    {editableContent.lastUpdated && <p className="text-xs text-muted-foreground text-center mt-1">Teacher content last saved: {new Date(editableContent.lastUpdated).toLocaleString()}</p>}
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
