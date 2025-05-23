
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, FileEdit, Link2, Trash2, Bot, PlusCircle, Save, BookCopy, Landmark, Globe, Notebook } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { StudyGrade, Chapter, TeacherChapterOverrides, ChapterContent, MCQ, QuestionAnswer, TeacherGradeOverrides, TeacherGradeOverride } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { extractChapterContent, type ExtractedChapterContentOutput } from '@/ai/flows/extractChapterContentFlow';

const TEACHER_CHAPTER_OVERRIDES_STORAGE_KEY = 'physicsLabTeacherChapterOverrides';
const TEACHER_GRADE_OVERRIDES_STORAGE_KEY = 'physicsLabTeacherGradeOverrides';


type ChapterPdfTypeKey = keyof Pick<ChapterContent, 'stbbChapterPdfLink' | 'teacherNotesPdfName' | 'alternativeChapterPdfLink'>;
interface ChapterPdfConfigItem {
  key: ChapterPdfTypeKey;
  label: string;
  placeholder: string;
}

type GradePdfTypeKey = keyof Pick<StudyGrade, 'completeTextbookPdfLink' | 'ziauddinBoardFullPdfLink' | 'punjabBoardFullPdfLink' | 'nationalSyllabusFullPdfLink'>;
interface GradePdfConfigItem {
    key: GradePdfTypeKey;
    label: string;
    placeholder: string;
}


export default function TeacherContentManagementPage() {
  const { toast } = useToast();
  const [studyGrades, setStudyGrades] = useState<StudyGrade[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [gradesError, setGradesError] = useState<string | null>(null);
  
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  
  const [editableChapterContent, setEditableChapterContent] = useState<Partial<ChapterContent>>({});
  const [editableGradeOverrides, setEditableGradeOverrides] = useState<Partial<TeacherGradeOverride>>({});
  const [isGeneratingAiContent, setIsGeneratingAiContent] = useState(false);

  const chapterPdfConfig: ChapterPdfConfigItem[] = [
    { key: 'stbbChapterPdfLink', label: 'STBB Chapter PDF Link', placeholder: 'Sindh Board Chapter Google Drive PDF link' },
    { key: 'teacherNotesPdfName', label: "Teacher's Notes PDF Link", placeholder: "Teacher's Notes Google Drive PDF link" },
    { key: 'alternativeChapterPdfLink', label: 'Other Alternative Chapter PDF Link', placeholder: 'Alternative Chapter Google Drive PDF link' },
  ];

  const gradePdfConfig: GradePdfConfigItem[] = [
    { key: 'completeTextbookPdfLink', label: 'STBB Full Textbook PDF Link', placeholder: 'Sindh Board Full Google Drive PDF link' },
    { key: 'ziauddinBoardFullPdfLink', label: 'Ziauddin Board Full PDF Link', placeholder: 'Ziauddin Board Full Google Drive PDF link' },
    { key: 'punjabBoardFullPdfLink', label: 'Punjab Board Full PDF Link', placeholder: 'Punjab Board Full Google Drive PDF link' },
    { key: 'nationalSyllabusFullPdfLink', label: 'National Syllabus Full PDF Link', placeholder: 'National Syllabus Full Google Drive PDF link' },
  ];


  const fetchGrades = useCallback(async () => {
    setIsLoadingGrades(true);
    setGradesError(null);
    try {
      const res = await fetch('/api/study-materials');
      if (!res.ok) throw new Error(`Failed to fetch grades: ${res.statusText}`);
      let data: StudyGrade[] = await res.json();
      
      // Apply grade-level overrides from localStorage
      const gradeOverridesRaw = localStorage.getItem(TEACHER_GRADE_OVERRIDES_STORAGE_KEY);
      if (gradeOverridesRaw) {
        const allGradeOverrides: TeacherGradeOverrides = JSON.parse(gradeOverridesRaw);
        data = data.map(grade => {
          const override = allGradeOverrides[grade.id];
          return override ? { ...grade, ...override } : grade;
        });
      }
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
      setEditableChapterContent({});
      return;
    }
    const grade = studyGrades.find(g => g.id === selectedGradeId);
    const chapter = grade?.chapters.find(c => c.id === selectedChapterId);
    
    let contentToEdit: Partial<ChapterContent> = chapter?.content || {};

    try {
      const overridesRaw = localStorage.getItem(TEACHER_CHAPTER_OVERRIDES_STORAGE_KEY);
      if (overridesRaw) {
        const allOverrides: TeacherChapterOverrides = JSON.parse(overridesRaw);
        const chapterOverride = allOverrides[selectedChapterId];
        if (chapterOverride) {
          contentToEdit = { ...contentToEdit, ...chapterOverride };
        }
      }
    } catch (e) {
      console.error("Failed to load or parse teacher chapter overrides for editing:", e);
    }
    setEditableChapterContent(contentToEdit);
  }, [selectedChapterId, selectedGradeId, studyGrades]);

  const loadGradeOverridesForEditing = useCallback(() => {
    if (!selectedGradeId) {
        setEditableGradeOverrides({});
        return;
    }
    const grade = studyGrades.find(g => g.id === selectedGradeId);
    let overridesToEdit: Partial<TeacherGradeOverride> = {
        gradeId: selectedGradeId,
        completeTextbookPdfLink: grade?.completeTextbookPdfLink,
        ziauddinBoardFullPdfLink: grade?.ziauddinBoardFullPdfLink,
        punjabBoardFullPdfLink: grade?.punjabBoardFullPdfLink,
        nationalSyllabusFullPdfLink: grade?.nationalSyllabusFullPdfLink,
    };
     try {
      const gradeOverridesRaw = localStorage.getItem(TEACHER_GRADE_OVERRIDES_STORAGE_KEY);
      if (gradeOverridesRaw) {
        const allGradeOverrides: TeacherGradeOverrides = JSON.parse(gradeOverridesRaw);
        const gradeOverride = allGradeOverrides[selectedGradeId];
        if (gradeOverride) {
            overridesToEdit = { ...overridesToEdit, ...gradeOverride };
        }
      }
    } catch (e) {
      console.error("Failed to load or parse teacher grade overrides for editing:", e);
    }
    setEditableGradeOverrides(overridesToEdit);
  }, [selectedGradeId, studyGrades]);


  useEffect(() => {
    loadChapterContentForEditing();
  }, [selectedChapterId, loadChapterContentForEditing]);

  useEffect(() => {
    if (selectedGradeId) {
        loadGradeOverridesForEditing();
        setSelectedChapterId(null); // Reset chapter selection when grade changes
        setEditableChapterContent({});
    } else {
        setEditableGradeOverrides({});
    }
  }, [selectedGradeId, loadGradeOverridesForEditing]);


  const handleChapterPdfLinkChange = (pdfType: ChapterPdfTypeKey, link: string) => {
    setEditableChapterContent(prev => ({ ...prev, [pdfType]: link }));
  };

  const handleRemoveChapterPdfLink = (pdfType: ChapterPdfTypeKey) => {
    setEditableChapterContent(prev => {
      const newContent = {...prev};
      delete newContent[pdfType]; 
      return newContent;
    });
    toast({ title: "Chapter PDF Link Cleared", description: `The link for ${chapterPdfConfig.find(p=>p.key === pdfType)?.label || pdfType} will be removed upon saving.` });
  };
  
  const handleGradePdfLinkChange = (pdfType: GradePdfTypeKey, link: string) => {
    setEditableGradeOverrides(prev => ({ ...prev, [pdfType]: link }));
  };

  const handleRemoveGradePdfLink = (pdfType: GradePdfTypeKey) => {
    setEditableGradeOverrides(prev => {
      const newContent = {...prev};
      delete newContent[pdfType];
      return newContent;
    });
    toast({ title: "Grade PDF Link Cleared", description: `The link for ${gradePdfConfig.find(p=>p.key === pdfType)?.label || pdfType} will be removed upon saving.` });
  };


  const handleAiGenerate = async () => {
    const potentialPdfSources: (ChapterPdfTypeKey)[] = [
        'teacherNotesPdfName', 
        'stbbChapterPdfLink',
        'alternativeChapterPdfLink'
    ];
    let primaryPdfForAi: string | undefined;
    for (const key of potentialPdfSources) {
        if (editableChapterContent[key]?.trim()) {
            primaryPdfForAi = editableChapterContent[key];
            break;
        }
    }

    if (!primaryPdfForAi || !primaryPdfForAi.startsWith('http')) {
      toast({ title: "No PDF Link for AI", description: "Please provide at least one valid Google Drive PDF link for the selected chapter (e.g., Teacher Notes or STBB Chapter PDF) to generate content from.", variant: "destructive" });
      return;
    }
    setIsGeneratingAiContent(true);
    try {
      const result: ExtractedChapterContentOutput = await extractChapterContent({ 
        pdfTextContent: `Content from PDF link: ${primaryPdfForAi}`, 
        chapterName: studyGrades.find(g=>g.id === selectedGradeId)?.chapters.find(c=>c.id === selectedChapterId)?.name || "Selected Chapter"
      });
      
      setEditableChapterContent(prev => ({
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
    setEditableChapterContent(prev => {
      const updatedContent = { ...prev };
      if ((field === 'mcqs' || field === 'shortAnswers' || field === 'longAnswers') && typeof index === 'number' && subField) {
        const items = [...(updatedContent[field as 'mcqs' | 'shortAnswers' | 'longAnswers'] || [])] as any[];
        if(items[index] === undefined && (field === 'mcqs' || field === 'shortAnswers' || field === 'longAnswers')) {
             items[index] = field === 'mcqs' ? { id: `new-${Date.now()}`, question: "", options: ["", "", "", ""], correctAnswerIndex: 0, explanation: "" } : { id: `new-${Date.now()}`, question: "", answer: "" };
        }
        if (field === 'mcqs' && subField === 'options') {
            const options = [...(items[index].options || ["", "", "", ""])];
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
    setEditableChapterContent(prev => ({
      ...prev,
      mcqs: [...(prev.mcqs || []), { id: `new-mcq-${Date.now()}`, question: "", options: ["", "", "", ""], correctAnswerIndex: 0, explanation: "" }]
    }));
  };
  const removeMcq = (index: number) => {
    setEditableChapterContent(prev => ({
      ...prev,
      mcqs: prev.mcqs?.filter((_, i) => i !== index)
    }));
  };
  
  const addQuestionAnswer = (type: 'shortAnswers' | 'longAnswers') => {
    setEditableChapterContent(prev => ({
      ...prev,
      [type]: [...(prev[type] || []), { id: `new-${type}-${Date.now()}`, question: "", answer: "" }]
    }));
  };
  const removeQuestionAnswer = (type: 'shortAnswers' | 'longAnswers', index: number) => {
     setEditableChapterContent(prev => ({
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
      const overridesRaw = localStorage.getItem(TEACHER_CHAPTER_OVERRIDES_STORAGE_KEY);
      const allOverrides: TeacherChapterOverrides = overridesRaw ? JSON.parse(overridesRaw) : {};
      
      const contentToSave: Partial<ChapterContent> = { ...editableChapterContent };
      chapterPdfConfig.forEach(pdf => {
        if (!contentToSave[pdf.key]?.trim()) delete contentToSave[pdf.key];
      });

      allOverrides[selectedChapterId] = {
        ...contentToSave,
        chapterId: selectedChapterId, 
        gradeId: selectedGradeId,    
        lastUpdated: new Date().toISOString(),
      };
      
      localStorage.setItem(TEACHER_CHAPTER_OVERRIDES_STORAGE_KEY, JSON.stringify(allOverrides));
      toast({ title: "Chapter Content Saved!", description: `Changes for chapter ${selectedChapterId} saved locally.` });

       setStudyGrades(prevGrades => prevGrades.map(g => {
        if (g.id === selectedGradeId) {
          return {
            ...g,
            chapters: g.chapters.map(c => {
              if (c.id === selectedChapterId) {
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
      console.error("Failed to save chapter overrides:", e);
      toast({ title: "Save Failed", description: "Could not save chapter changes to local storage.", variant: "destructive" });
    }
  };

  const saveGradeOverrides = () => {
    if (!selectedGradeId) {
        toast({ title: "Error", description: "No grade selected to save overrides for.", variant: "destructive" });
        return;
    }
    try {
        const gradeOverridesRaw = localStorage.getItem(TEACHER_GRADE_OVERRIDES_STORAGE_KEY);
        const allGradeOverrides: TeacherGradeOverrides = gradeOverridesRaw ? JSON.parse(gradeOverridesRaw) : {};

        const gradeContentToSave: Partial<TeacherGradeOverride> = { ...editableGradeOverrides, gradeId: selectedGradeId };
        gradePdfConfig.forEach(pdf => {
            if (!gradeContentToSave[pdf.key]?.trim()) delete gradeContentToSave[pdf.key];
        });
        gradeContentToSave.lastUpdated = new Date().toISOString();
        
        allGradeOverrides[selectedGradeId] = gradeContentToSave as TeacherGradeOverride;
        localStorage.setItem(TEACHER_GRADE_OVERRIDES_STORAGE_KEY, JSON.stringify(allGradeOverrides));
        toast({ title: "Grade PDF Links Saved!", description: `Full textbook links for ${studyGrades.find(g => g.id === selectedGradeId)?.name} saved locally.` });
        
        // Optimistically update the studyGrades state
        setStudyGrades(prevGrades => prevGrades.map(g => {
            if (g.id === selectedGradeId) {
                return { ...g, ...gradeContentToSave };
            }
            return g;
        }));

    } catch (e) {
        console.error("Failed to save grade overrides:", e);
        toast({ title: "Save Failed", description: "Could not save grade PDF links to local storage.", variant: "destructive" });
    }
  };
  
  const selectedGradeName = studyGrades.find(g => g.id === selectedGradeId)?.name;
  const selectedChapterName = studyGrades.find(g => g.id === selectedChapterId)?.chapters.find(c => c.id === selectedChapterId)?.name;

  if (isLoadingGrades) return <div className="flex justify-center items-center p-10"><Loader2 className="h-10 w-10 animate-spin"/></div>;
  if (gradesError) return <Alert variant="destructive"><AlertTriangle className="h-4 w-4"/><AlertDescription>{gradesError}</AlertDescription></Alert>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileEdit className="h-6 w-6 text-primary"/>Content Management</CardTitle>
          <CardDescription>Manage study material structure, PDF links, key points, and exercises. Changes are saved locally to your browser.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Select Grade</CardTitle></CardHeader>
            <CardContent>
              <Select onValueChange={(value) => {setSelectedGradeId(value);}} value={selectedGradeId || undefined}>
                <SelectTrigger><SelectValue placeholder="Select Grade" /></SelectTrigger>
                <SelectContent>
                  {studyGrades.map(grade => <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

         {selectedGradeId && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Manage Full Textbook PDFs for {selectedGradeName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {gradePdfConfig.map(pdf => (
                        <div key={pdf.key} className="space-y-1">
                            <Label htmlFor={`${pdf.key}-gradeinput`} className="font-medium text-sm">{pdf.label}</Label>
                            <div className="flex gap-2 items-center">
                                <Input 
                                    id={`${pdf.key}-gradeinput`} 
                                    type="url" 
                                    placeholder={pdf.placeholder} 
                                    value={editableGradeOverrides[pdf.key] || ""}
                                    onChange={(e) => handleGradePdfLinkChange(pdf.key, e.target.value)}
                                    className="flex-grow"
                                />
                                {editableGradeOverrides[pdf.key] && <Button variant="ghost" size="icon" onClick={() => handleRemoveGradePdfLink(pdf.key)} className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive"/></Button>}
                            </div>
                        </div>
                    ))}
                    <Button onClick={saveGradeOverrides} className="w-full mt-2"><Save className="mr-2 h-4 w-4"/>Save Grade PDF Links</Button>
                    {editableGradeOverrides.lastUpdated && <p className="text-xs text-muted-foreground text-center mt-1">Grade links last saved: {new Date(editableGradeOverrides.lastUpdated).toLocaleString()}</p>}
                </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2">
          {selectedGradeId ? (
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Chapters for {selectedGradeName}</CardTitle>
                    <CardDescription>Select a chapter below to edit its specific content.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible onValueChange={setSelectedChapterId} value={selectedChapterId || undefined}>
                        {(studyGrades.find(g => g.id === selectedGradeId)?.chapters || []).map(chapter => (
                            <AccordionItem value={chapter.id} key={chapter.id}>
                                <AccordionTrigger className="text-base">{chapter.name}</AccordionTrigger>
                                <AccordionContent className="pt-4 space-y-6 bg-muted/30 p-4 rounded-md">
                                  <div className="space-y-4 p-4 border rounded-md bg-background">
                                    <h3 className="font-semibold text-lg">Chapter-Specific PDF Links</h3>
                                    {chapterPdfConfig.map(pdf => (
                                      <div key={pdf.key} className="space-y-1 border-b pb-3 last:border-b-0 last:pb-0">
                                        <Label htmlFor={`${pdf.key}-chapterinput`} className="font-medium">{pdf.label}</Label>
                                        <div className="flex gap-2 items-center">
                                          <Input 
                                            id={`${pdf.key}-chapterinput`} 
                                            type="url" 
                                            placeholder={pdf.placeholder} 
                                            value={editableChapterContent[pdf.key] || ""}
                                            onChange={(e) => handleChapterPdfLinkChange(pdf.key, e.target.value)}
                                            className="flex-grow"
                                          />
                                          {editableChapterContent[pdf.key] && <Button variant="ghost" size="icon" onClick={() => handleRemoveChapterPdfLink(pdf.key)} className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive"/></Button>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <Button 
                                    onClick={handleAiGenerate} 
                                    disabled={isGeneratingAiContent || !chapterPdfConfig.some(pdf => !!editableChapterContent[pdf.key]?.trim())} 
                                    className="w-full"
                                    variant="outline"
                                    >
                                    {isGeneratingAiContent ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Bot className="mr-2 h-4 w-4"/>}
                                    Generate Key Points &amp; Exercises from PDF (AI - Simulated)
                                  </Button>
                                  
                                  <div className="space-y-2 p-4 border rounded-md bg-background">
                                    <h3 className="font-semibold">Key Points &amp; Summary</h3>
                                    <Textarea 
                                      value={editableChapterContent.keyPoints || ""}
                                      onChange={(e) => handleContentChange('keyPoints', e.target.value)}
                                      placeholder="Enter key points and summary... (AI can help generate this)"
                                      rows={6}
                                    />
                                  </div>

                                  <Card>
                                    <CardHeader><CardTitle className="text-md">Multiple Choice Questions (MCQs)</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                      {(editableChapterContent.mcqs || []).map((mcq, index) => (
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
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardHeader><CardTitle className="text-md">Short Answer Questions (CRQs)</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                      {(editableChapterContent.shortAnswers || []).map((qa, index) => (
                                        <Card key={qa.id || index} className="p-3 bg-secondary/50">
                                          <Label>Short Question {index + 1}:</Label>
                                          <Textarea placeholder="Question" value={qa.question} onChange={e => handleContentChange('shortAnswers', e.target.value, index, 'question')} className="mb-1" rows={2}/>
                                          <Textarea placeholder="Answer" value={qa.answer} onChange={e => handleContentChange('shortAnswers', e.target.value, index, 'answer')} className="text-sm" rows={3}/>
                                          <Button variant="ghost" size="sm" onClick={() => removeQuestionAnswer('shortAnswers', index)} className="mt-1 text-destructive hover:bg-destructive/10"><Trash2 className="mr-1 h-3 w-3"/>Remove Short Q</Button>
                                        </Card>
                                      ))}
                                      <Button variant="outline" size="sm" onClick={() => addQuestionAnswer('shortAnswers')}><PlusCircle className="mr-2 h-4 w-4"/>Add Short Question</Button>
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardHeader><CardTitle className="text-md">Long Answer Questions (ERQs)</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                      {(editableChapterContent.longAnswers || []).map((qa, index) => (
                                        <Card key={qa.id || index} className="p-3 bg-secondary/50">
                                          <Label>Long Question {index + 1}:</Label>
                                          <Textarea placeholder="Question" value={qa.question} onChange={e => handleContentChange('longAnswers', e.target.value, index, 'question')} className="mb-1" rows={3}/>
                                          <Textarea placeholder="Answer" value={qa.answer} onChange={e => handleContentChange('longAnswers', e.target.value, index, 'answer')} className="text-sm" rows={5}/>
                                          <Button variant="ghost" size="sm" onClick={() => removeQuestionAnswer('longAnswers', index)} className="mt-1 text-destructive hover:bg-destructive/10"><Trash2 className="mr-1 h-3 w-3"/>Remove Long Q</Button>
                                        </Card>
                                      ))}
                                      <Button variant="outline" size="sm" onClick={() => addQuestionAnswer('longAnswers')}><PlusCircle className="mr-2 h-4 w-4"/>Add Long Question</Button>
                                    </CardContent>
                                  </Card>

                                  <Button onClick={saveChapterContent} className="w-full mt-6">
                                    <Save className="mr-2 h-4 w-4"/> Save Content for {selectedChapterName}
                                  </Button>
                                   {editableChapterContent.lastUpdated && <p className="text-xs text-muted-foreground text-center mt-1">Chapter content last saved: {new Date(editableChapterContent.lastUpdated).toLocaleString()}</p>}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                         {(studyGrades.find(g => g.id === selectedGradeId)?.chapters.length === 0) && <p className="text-muted-foreground p-4 text-center">No chapters found for this grade.</p>}
                    </Accordion>
                </CardContent>
            </Card>
          ) : (
            <p className="text-center text-muted-foreground py-10 md:col-span-2">Select a grade to view and manage its chapters and content.</p>
          )}
        </div>
      </div>
    </div>
  );
}
